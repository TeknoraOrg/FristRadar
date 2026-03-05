import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import type { Env } from '../types';
import { createUser, loginUser, verifyEmailOtp, resendVerification, issueTokenPair } from '../lib/auth';
import { subscriptions } from '../db/schema';
import { serializeUser } from '../db/serializers';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import {
  RegisterInputSchema, RegisterResponseSchema,
  LoginInputSchema, LoginResponseSchema,
  VerifyOtpInputSchema, VerifyOtpResponseSchema,
  ResendVerificationInputSchema, ResendVerificationResponseSchema,
  ErrorResponseSchema,
} from '../openapi/schemas';
import { validationHook } from '../openapi/validation-hook';

const app = new OpenAPIHono<{ Bindings: Env }>({ defaultHook: validationHook });

// POST /register
const registerRoute = createRoute({
  method: 'post',
  path: '/register',
  tags: ['Auth'],
  request: {
    body: { content: { 'application/json': { schema: RegisterInputSchema } } },
  },
  responses: {
    201: { content: { 'application/json': { schema: RegisterResponseSchema } }, description: 'User registered' },
    400: { content: { 'application/json': { schema: ErrorResponseSchema } }, description: 'Validation error' },
    409: { content: { 'application/json': { schema: ErrorResponseSchema } }, description: 'Email already exists' },
  },
});

app.openapi(registerRoute, async (c) => {
  const body = c.req.valid('json');
  const db = c.get('db');

  const result = await createUser(db, c.env, body.email, body.password, {
    first_name: body.first_name,
    last_name: body.last_name,
  });

  if (result.error) {
    return c.json({ success: false as const, error: result.error.message }, result.error.status as 400 | 409);
  }

  // Seed free subscription
  const now = new Date().toISOString();
  await db.insert(subscriptions).values({
    id: crypto.randomUUID(),
    userId: result.data.user.id,
    tier: 'free',
    status: 'active',
    currentPeriodStart: now,
  });

  // Fetch full user for serialization
  const fullUser = await db.query.users.findFirst({ where: eq(users.id, result.data.user.id) });

  return c.json({
    success: true as const,
    data: {
      user: serializeUser(fullUser!),
      message: 'Verification email sent. Please check your email for the verification code.',
    },
  }, 201);
});

// POST /login
const loginRoute = createRoute({
  method: 'post',
  path: '/login',
  tags: ['Auth'],
  request: {
    body: { content: { 'application/json': { schema: LoginInputSchema } } },
  },
  responses: {
    200: { content: { 'application/json': { schema: LoginResponseSchema } }, description: 'Login successful' },
    401: { content: { 'application/json': { schema: ErrorResponseSchema } }, description: 'Invalid credentials' },
    403: { content: { 'application/json': { schema: ErrorResponseSchema } }, description: 'Email not verified' },
  },
});

app.openapi(loginRoute, async (c) => {
  const body = c.req.valid('json');
  const db = c.get('db');

  const result = await loginUser(db, c.env, body.email, body.password);
  if (result.error) {
    return c.json({ success: false as const, error: result.error.message }, result.error.status as 401 | 403);
  }

  const userAgent = c.req.header('User-Agent') || null;
  const ipAddress = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || null;

  const session = await issueTokenPair(db, c.env, result.data.user.id, result.data.user.email, userAgent, ipAddress);

  const fullUser = await db.query.users.findFirst({ where: eq(users.id, result.data.user.id) });

  return c.json({
    success: true as const,
    data: {
      user: serializeUser(fullUser!),
      session,
    },
  }, 200);
});

// POST /verify-otp
const verifyOtpRoute = createRoute({
  method: 'post',
  path: '/verify-otp',
  tags: ['Auth'],
  request: {
    body: { content: { 'application/json': { schema: VerifyOtpInputSchema } } },
  },
  responses: {
    200: { content: { 'application/json': { schema: VerifyOtpResponseSchema } }, description: 'OTP verified' },
    400: { content: { 'application/json': { schema: ErrorResponseSchema } }, description: 'Invalid OTP' },
  },
});

app.openapi(verifyOtpRoute, async (c) => {
  const body = c.req.valid('json');
  const db = c.get('db');
  const userAgent = c.req.header('User-Agent') || null;
  const ipAddress = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || null;

  const result = await verifyEmailOtp(db, c.env, body.email, body.token, body.type, userAgent, ipAddress);
  if (result.error) {
    return c.json({ success: false as const, error: result.error.message }, result.error.status as 400);
  }

  const fullUser = await db.query.users.findFirst({ where: eq(users.id, result.data.user.id) });

  return c.json({
    success: true as const,
    data: {
      user: serializeUser(fullUser!),
      session: result.data.session,
      message: 'Email verified successfully.',
    },
  }, 200);
});

// POST /resend-verification
const resendVerificationRoute = createRoute({
  method: 'post',
  path: '/resend-verification',
  tags: ['Auth'],
  request: {
    body: { content: { 'application/json': { schema: ResendVerificationInputSchema } } },
  },
  responses: {
    200: { content: { 'application/json': { schema: ResendVerificationResponseSchema } }, description: 'Verification email sent' },
  },
});

app.openapi(resendVerificationRoute, async (c) => {
  const body = c.req.valid('json');
  const db = c.get('db');

  const result = await resendVerification(db, c.env, body.email);
  if (result.error) {
    // Still return 200 with ambiguous message
    return c.json({ success: true as const, data: { message: result.error.message } }, 200);
  }

  return c.json({
    success: true as const,
    data: { message: result.data!.message },
  }, 200);
});

export default app;
