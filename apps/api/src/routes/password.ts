import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import type { Env } from '../types';
import { requestPasswordReset, resetUserPassword } from '../lib/auth';
import {
  ForgotPasswordInputSchema, ForgotPasswordResponseSchema,
  ResetPasswordInputSchema, ResetPasswordResponseSchema,
  ErrorResponseSchema,
} from '../openapi/schemas';
import { validationHook } from '../openapi/validation-hook';

const app = new OpenAPIHono<{ Bindings: Env }>({ defaultHook: validationHook });

// POST /forgot-password
const forgotPasswordRoute = createRoute({
  method: 'post',
  path: '/forgot-password',
  tags: ['Password'],
  request: {
    body: { content: { 'application/json': { schema: ForgotPasswordInputSchema } } },
  },
  responses: {
    200: { content: { 'application/json': { schema: ForgotPasswordResponseSchema } }, description: 'Reset email sent' },
    429: { content: { 'application/json': { schema: ErrorResponseSchema } }, description: 'Too many requests' },
  },
});

app.openapi(forgotPasswordRoute, async (c) => {
  const body = c.req.valid('json');
  const db = c.get('db');

  const result = await requestPasswordReset(db, c.env, body.email);

  if (!result.success && result.error) {
    return c.json({ success: false as const, error: result.error.message }, result.error.status as 429);
  }

  return c.json({
    success: true as const,
    data: { message: 'If an account with this email exists, a password reset email has been sent.' },
  }, 200);
});

// POST /reset-password
const resetPasswordRoute = createRoute({
  method: 'post',
  path: '/reset-password',
  tags: ['Password'],
  request: {
    body: { content: { 'application/json': { schema: ResetPasswordInputSchema } } },
  },
  responses: {
    200: { content: { 'application/json': { schema: ResetPasswordResponseSchema } }, description: 'Password reset' },
    401: { content: { 'application/json': { schema: ErrorResponseSchema } }, description: 'Invalid token' },
  },
});

app.openapi(resetPasswordRoute, async (c) => {
  const body = c.req.valid('json');
  const db = c.get('db');

  const result = await resetUserPassword(db, c.env, body.access_token, body.refresh_token, body.password);

  if (!result.success && result.error) {
    return c.json({ success: false as const, error: result.error.message }, result.error.status as 401);
  }

  return c.json({
    success: true as const,
    data: { message: 'Password has been reset successfully. Please log in with your new password.' },
  }, 200);
});

export default app;
