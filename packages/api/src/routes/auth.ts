import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { SignJWT, jwtVerify } from 'jose';
import type { Env } from '../types.js';
import { users, otpCodes, otpRateLimits } from '../db/schema.js';
import { toE164 } from '../utils/phone.js';
import { validatePassword, hashPassword } from '../utils/password.js';
import { generateOTP, isExpired } from '../utils/otp.js';
import { createToken } from '../utils/jwt.js';
import { success, fail, failMany } from '../utils/response.js';

const auth = new Hono<Env>();

const MAX_OTP_ATTEMPTS = 5;


auth.post('/send-otp', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) return fail(c, 'Invalid JSON body');

  const { phone: rawPhone, countryCode = 'DE' } = body;

  const parsed = toE164(rawPhone, countryCode);
  if (!parsed.ok) return fail(c, parsed.error);
  const phone = parsed.phone;

  const db = drizzle(c.env.DB);

  const maxRequests = parseInt(c.env.OTP_RATE_LIMIT_MAX || '5', 10);
  const windowSeconds = parseInt(c.env.OTP_RATE_LIMIT_WINDOW_SECONDS || '900', 10);
  const now = new Date();

  const [rateRow] = await db.select().from(otpRateLimits).where(eq(otpRateLimits.phone, phone));

  if (rateRow) {
    const windowStart = new Date(rateRow.windowStart);
    const windowElapsed = (now.getTime() - windowStart.getTime()) / 1000;

    if (windowElapsed < windowSeconds) {
      if (rateRow.requestCount >= maxRequests) {
        const retryAfter = Math.ceil(windowSeconds - windowElapsed);
        c.header('Retry-After', String(retryAfter));
        return fail(c, `Too many OTP requests. Try again in ${retryAfter} seconds.`, 429);
      }
      await db.update(otpRateLimits)
        .set({ requestCount: rateRow.requestCount + 1 })
        .where(eq(otpRateLimits.phone, phone));
    } else {
      await db.update(otpRateLimits)
        .set({ requestCount: 1, windowStart: now.toISOString() })
        .where(eq(otpRateLimits.phone, phone));
    }
  } else {
    await db.insert(otpRateLimits).values({
      phone,
      requestCount: 1,
      windowStart: now.toISOString(),
    });
  }

  const [existingUser] = await db.select().from(users).where(eq(users.phone, phone));
  if (existingUser) {
    return fail(c, 'Phone number is already registered', 409);
  }

  const previousOtps = await db.select().from(otpCodes)
    .where(and(eq(otpCodes.phone, phone), eq(otpCodes.purpose, 'registration')));
  for (const otp of previousOtps) {
    if (!otp.usedAt) {
      await db.update(otpCodes)
        .set({ usedAt: now.toISOString() })
        .where(eq(otpCodes.id, otp.id));
    }
  }

  const expirySeconds = parseInt(c.env.OTP_EXPIRY_SECONDS || '300', 10);
  const code = generateOTP();
  const otpId = crypto.randomUUID();

  await db.insert(otpCodes).values({
    id: otpId,
    phone,
    code,
    purpose: 'registration',
    attempts: 0,
    expiresAt: new Date(now.getTime() + expirySeconds * 1000).toISOString(),
    createdAt: now.toISOString(),
  });

  console.log(`[DEV] OTP for ${phone}: ${code}`);

  return success(c, {
    message: 'OTP sent successfully',
    phone,
    ...(c.env.ENVIRONMENT === 'development' ? { _devOtp: code } : {}),
    expiresInSeconds: expirySeconds,
  });
});

auth.post('/verify-otp', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) return fail(c, 'Invalid JSON body');

  const { phone: rawPhone, code, countryCode = 'DE' } = body;

  const parsed = toE164(rawPhone, countryCode);
  if (!parsed.ok) return fail(c, parsed.error);
  const phone = parsed.phone;

  if (typeof code !== 'string' || !/^\d{6}$/.test(code)) {
    return fail(c, 'OTP must be a 6-digit number');
  }

  const db = drizzle(c.env.DB);
  const now = new Date();

  const otpRows = await db.select().from(otpCodes)
    .where(and(
      eq(otpCodes.phone, phone),
      eq(otpCodes.purpose, 'registration'),
    ));

  const otpRecord = otpRows
    .filter((r) => !r.usedAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  if (!otpRecord) {
    return fail(c, 'No pending OTP found. Please request a new one.', 404);
  }

  if (isExpired(otpRecord.expiresAt)) {
    await db.update(otpCodes)
      .set({ usedAt: now.toISOString() })
      .where(eq(otpCodes.id, otpRecord.id));
    return fail(c, 'OTP has expired. Please request a new one.', 410);
  }

  if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
    await db.update(otpCodes)
      .set({ usedAt: now.toISOString() })
      .where(eq(otpCodes.id, otpRecord.id));
    return fail(c, 'Too many incorrect attempts. Please request a new OTP.', 429);
  }

  if (!timingSafeCompare(code, otpRecord.code)) {
    await db.update(otpCodes)
      .set({ attempts: otpRecord.attempts + 1 })
      .where(eq(otpCodes.id, otpRecord.id));
    const remaining = MAX_OTP_ATTEMPTS - otpRecord.attempts - 1;
    return fail(c, `Incorrect OTP. ${remaining} attempt(s) remaining.`, 401);
  }

  await db.update(otpCodes)
    .set({ usedAt: now.toISOString() })
    .where(eq(otpCodes.id, otpRecord.id));

  const verificationToken = await createVerificationToken(phone, c.env.JWT_SECRET);

  return success(c, {
    message: 'Phone verified successfully',
    phone,
    verificationToken,
  });
});

auth.post('/register', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) return fail(c, 'Invalid JSON body');

  const { phone: rawPhone, password, verificationToken, countryCode = 'DE' } = body;

  const parsed = toE164(rawPhone, countryCode);
  if (!parsed.ok) return fail(c, parsed.error);
  const phone = parsed.phone;

  if (!verificationToken) {
    return fail(c, 'Phone verification token is required. Complete OTP verification first.');
  }

  const verifiedPhone = await decodeVerificationToken(verificationToken, c.env.JWT_SECRET);
  if (!verifiedPhone) {
    return fail(c, 'Invalid or expired verification token. Please verify your phone again.', 401);
  }
  if (verifiedPhone !== phone) {
    return fail(c, 'Verification token does not match the provided phone number.', 403);
  }

  const pwResult = validatePassword(password);
  if (!pwResult.ok) {
    return failMany(c, pwResult.errors, 422);
  }

  const db = drizzle(c.env.DB);
  const now = new Date().toISOString();

  const [existing] = await db.select().from(users).where(eq(users.phone, phone));
  if (existing) {
    return fail(c, 'Phone number is already registered', 409);
  }

  const passwordHash = await hashPassword(password);
  const userId = crypto.randomUUID();

  await db.insert(users).values({
    id: userId,
    phone,
    passwordHash,
    phoneVerified: true,
    createdAt: now,
    updatedAt: now,
  });

  const token = await createToken(userId, phone, c.env.JWT_SECRET, c.env.JWT_ISSUER);

  return success(c, {
    message: 'Registration successful',
    user: { id: userId, phone, phoneVerified: true, createdAt: now },
    token,
  }, 201);
});

function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function createVerificationToken(phone: string, secret: string): Promise<string> {
  // SignJWT already imported at top
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return new SignJWT({ phone, purpose: 'phone-verification' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('10m')
    .sign(key);
}

async function decodeVerificationToken(token: string, secret: string): Promise<string | null> {
  try {
    // jwtVerify already imported at top
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    const { payload } = await jwtVerify(token, key);
    if (payload.purpose !== 'phone-verification') return null;
    return (payload.phone as string) || null;
  } catch {
    return null;
  }
}

export default auth;
