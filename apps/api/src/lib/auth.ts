import { SignJWT, jwtVerify } from 'jose';
import type { Env } from '../types';
import type { Database } from '../db';
import { users, sessions, emailVerificationOtps } from '../db/schema';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { hashPassword, verifyPassword } from './password';
import { sendEmail, emailVerificationOtpTemplate, passwordResetOtpTemplate } from './email';
import { hashToken, createSessionRecord } from './session-utils';
import { checkRateLimit } from './rate-limit';

const ACCESS_TOKEN_TTL = 3600;
const OTP_LENGTH = 8;
const OTP_EXPIRY_MINUTES = 10;

function generateOtp(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const num = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
  return String(num % 100_000_000).padStart(OTP_LENGTH, '0');
}

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function generateRefreshToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function issueAccessToken(env: Env, userId: string, email: string) {
  const secret = new TextEncoder().encode(env.JWT_SECRET);
  const now = Math.floor(Date.now() / 1000);
  const exp = now + ACCESS_TOKEN_TTL;

  const accessToken = await new SignJWT({ sub: userId, email, role: 'authenticated' })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .setIssuer('fristradar')
    .setAudience('authenticated')
    .sign(secret);

  return { accessToken, expiresAt: exp };
}

export async function issueTokenPair(
  db: Database, env: Env, userId: string, email: string,
  userAgent: string | null, ipAddress: string | null,
  eventName: 'session_created' | 'session_refreshed' = 'session_created',
  metadata?: Record<string, unknown>,
) {
  const { accessToken, expiresAt } = await issueAccessToken(env, userId, email);
  const refreshToken = generateRefreshToken();
  await createSessionRecord({ db, accessToken, refreshToken, userId, userAgent, ipAddress, eventName, metadata });
  return { access_token: accessToken, refresh_token: refreshToken, expires_at: expiresAt, expires_in: ACCESS_TOKEN_TTL, token_type: 'bearer' };
}

interface AuthSuccess<T> { data: T; error: null }
interface AuthError { data: null; error: { message: string; status: number } }
type AuthResult<T> = AuthSuccess<T> | AuthError;

export async function createUser(
  db: Database, env: Env, email: string, password: string,
  metadata?: { first_name?: string; last_name?: string },
): Promise<AuthResult<{ user: { id: string; email: string } }>> {
  const existing = await db.query.users.findFirst({ where: eq(users.email, email), columns: { id: true } });
  if (existing) return { data: null, error: { message: 'An account with this email already exists.', status: 409 } };

  const userId = crypto.randomUUID();
  const passwordHashValue = await hashPassword(password);

  try {
    await db.insert(users).values({ id: userId, email, passwordHash: passwordHashValue, emailVerified: false, firstName: metadata?.first_name ?? null, lastName: metadata?.last_name ?? null });
  } catch (err: any) {
    if (String(err?.message || '').toLowerCase().includes('unique')) {
      return { data: null, error: { message: 'An account with this email already exists.', status: 409 } };
    }
    throw err;
  }

  const otp = generateOtp();
  const otpHash = await sha256(otp);
  await db.insert(emailVerificationOtps).values({ id: crypto.randomUUID(), userId, email, otpHash, type: 'signup', expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString() });

  const { subject, html } = emailVerificationOtpTemplate({ code: otp });
  await sendEmail(email, subject, html, env);
  return { data: { user: { id: userId, email } }, error: null };
}

export async function loginUser(db: Database, _env: Env, email: string, password: string): Promise<AuthResult<{ user: { id: string; email: string } }>> {
  const userData = await db.query.users.findFirst({ where: eq(users.email, email), columns: { id: true, email: true, passwordHash: true, emailVerified: true } });
  if (!userData || !userData.passwordHash) return { data: null, error: { message: 'Invalid email or password.', status: 401 } };
  const valid = await verifyPassword(password, userData.passwordHash);
  if (!valid) return { data: null, error: { message: 'Invalid email or password.', status: 401 } };
  if (!userData.emailVerified) return { data: null, error: { message: 'Email not verified. Please check your email for a verification code.', status: 403 } };
  return { data: { user: { id: userData.id, email: userData.email } }, error: null };
}

export async function verifyEmailOtp(
  db: Database, env: Env, email: string, token: string, type: 'signup' | 'recovery',
  userAgent: string | null, ipAddress: string | null,
): Promise<AuthResult<{ user: { id: string; email: string }; session: any }>> {
  const tokenHash = await sha256(token);
  const otpRecord = await db.query.emailVerificationOtps.findFirst({
    where: and(eq(emailVerificationOtps.email, email), eq(emailVerificationOtps.type, type), isNull(emailVerificationOtps.usedAt)),
    orderBy: [desc(emailVerificationOtps.createdAt)],
  });

  if (!otpRecord) return { data: null, error: { message: 'Invalid or expired verification code.', status: 400 } };
  if (new Date(otpRecord.expiresAt) < new Date()) return { data: null, error: { message: 'Verification code has expired. Please request a new one.', status: 400 } };
  if (otpRecord.attempts >= otpRecord.maxAttempts) return { data: null, error: { message: 'Too many failed attempts. Please request a new code.', status: 400 } };

  await db.update(emailVerificationOtps).set({ attempts: otpRecord.attempts + 1 }).where(eq(emailVerificationOtps.id, otpRecord.id));
  if (!constantTimeEqual(otpRecord.otpHash, tokenHash)) return { data: null, error: { message: 'Invalid or expired verification code.', status: 400 } };

  const markUsed = await db.update(emailVerificationOtps).set({ usedAt: new Date().toISOString() })
    .where(and(eq(emailVerificationOtps.id, otpRecord.id), isNull(emailVerificationOtps.usedAt)))
    .returning({ id: emailVerificationOtps.id });
  if (markUsed.length === 0) return { data: null, error: { message: 'Code already used.', status: 400 } };

  if (type === 'signup') {
    await db.update(users).set({ emailVerified: true, emailVerifiedAt: new Date().toISOString() }).where(eq(users.id, otpRecord.userId));
  }

  const session = await issueTokenPair(db, env, otpRecord.userId, email, userAgent, ipAddress, 'session_created', { source: `verify_otp_${type}` });
  return { data: { user: { id: otpRecord.userId, email }, session }, error: null };
}

export async function resendVerification(db: Database, env: Env, email: string): Promise<AuthResult<{ message: string }>> {
  const ambiguous = { data: { message: 'If an account with this email exists and is unverified, a verification email has been sent.' }, error: null } as AuthResult<{ message: string }>;
  const userData = await db.query.users.findFirst({ where: eq(users.email, email), columns: { id: true, emailVerified: true } });
  if (!userData || userData.emailVerified) return ambiguous;

  const kv = env.RATE_LIMITER;
  if (kv) {
    const rl = await checkRateLimit(kv, `ratelimit:otp_send:${email}`, 3, 900);
    if (!rl.allowed) return ambiguous;
  }

  await db.update(emailVerificationOtps).set({ usedAt: new Date().toISOString() })
    .where(and(eq(emailVerificationOtps.userId, userData.id), eq(emailVerificationOtps.type, 'signup'), isNull(emailVerificationOtps.usedAt)));

  const otp = generateOtp();
  const otpHash = await sha256(otp);
  await db.insert(emailVerificationOtps).values({ id: crypto.randomUUID(), userId: userData.id, email, otpHash, type: 'signup', expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString() });
  const { subject, html } = emailVerificationOtpTemplate({ code: otp });
  await sendEmail(email, subject, html, env);
  return ambiguous;
}

export async function refreshUserToken(
  db: Database, env: Env, refreshToken: string, userAgent: string | null, ipAddress: string | null,
): Promise<AuthResult<{ session: any; user: { id: string } }>> {
  const incomingRefreshHash = await hashToken(refreshToken);
  const sessionRecord = await db.query.sessions.findFirst({
    where: and(eq(sessions.refreshTokenHash, incomingRefreshHash), isNull(sessions.revokedAt)),
    columns: { id: true, userId: true, expiresAt: true },
  });
  if (!sessionRecord) return { data: null, error: { message: 'Session expired. Please log in again.', status: 401 } };

  const userData = await db.query.users.findFirst({ where: eq(users.id, sessionRecord.userId), columns: { id: true, email: true } });
  if (!userData) return { data: null, error: { message: 'User not found.', status: 401 } };

  const session = await issueTokenPair(db, env, userData.id, userData.email, userAgent, ipAddress, 'session_refreshed');

  const newSessionId = await hashToken(session.access_token);
  await db.update(sessions).set({ revokedAt: new Date().toISOString(), revocationReason: 'token_refreshed', replacedBySessionId: newSessionId }).where(eq(sessions.id, sessionRecord.id));

  return { data: { session, user: { id: userData.id } }, error: null };
}

export async function requestPasswordReset(db: Database, env: Env, email: string) {
  const userData = await db.query.users.findFirst({ where: eq(users.email, email), columns: { id: true } });
  if (!userData) return { success: true };

  const kv = env.RATE_LIMITER;
  if (kv) {
    const rl = await checkRateLimit(kv, `ratelimit:otp_send:${email}`, 3, 900);
    if (!rl.allowed) return { success: false, error: { message: 'Too many requests. Please try again later.', status: 429 } };
  }

  await db.update(emailVerificationOtps).set({ usedAt: new Date().toISOString() })
    .where(and(eq(emailVerificationOtps.userId, userData.id), eq(emailVerificationOtps.type, 'recovery'), isNull(emailVerificationOtps.usedAt)));

  const otp = generateOtp();
  const otpHash = await sha256(otp);
  await db.insert(emailVerificationOtps).values({ id: crypto.randomUUID(), userId: userData.id, email, otpHash, type: 'recovery', expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString() });
  const { subject, html } = passwordResetOtpTemplate({ code: otp });
  await sendEmail(email, subject, html, env);
  return { success: true };
}

export async function resetUserPassword(db: Database, env: Env, accessToken: string, _refreshToken: string, newPassword: string) {
  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jwtVerify(accessToken, secret, { issuer: 'fristradar', audience: 'authenticated' });
    const userId = payload.sub;
    if (!userId) return { success: false, error: { message: 'Invalid token.', status: 401 } };

    await db.update(users).set({ passwordHash: await hashPassword(newPassword) }).where(eq(users.id, userId));
    await db.update(sessions).set({ revokedAt: new Date().toISOString(), revocationReason: 'password_reset' })
      .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
    return { success: true };
  } catch {
    return { success: false, error: { message: 'Invalid or expired reset link. Please request a new one.', status: 401 } };
  }
}
