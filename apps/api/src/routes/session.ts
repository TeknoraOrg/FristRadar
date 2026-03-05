import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import type { Env } from '../types';
import { refreshUserToken } from '../lib/auth';
import { sessions } from '../db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { logSessionEvent } from '../lib/session-utils';
import {
  RefreshTokenInputSchema, RefreshTokenResponseSchema,
  ErrorResponseSchema,
} from '../openapi/schemas';
import { validationHook } from '../openapi/validation-hook';
import { z } from 'zod';

const app = new OpenAPIHono<{ Bindings: Env }>({ defaultHook: validationHook });

const LogoutResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ message: z.string() }),
});

// POST /refresh
const refreshRoute = createRoute({
  method: 'post',
  path: '/refresh',
  tags: ['Session'],
  request: {
    body: { content: { 'application/json': { schema: RefreshTokenInputSchema } } },
  },
  responses: {
    200: { content: { 'application/json': { schema: RefreshTokenResponseSchema } }, description: 'Token refreshed' },
    401: { content: { 'application/json': { schema: ErrorResponseSchema } }, description: 'Invalid refresh token' },
  },
});

app.openapi(refreshRoute, async (c) => {
  const body = c.req.valid('json');
  const db = c.get('db');
  const userAgent = c.req.header('User-Agent') || null;
  const ipAddress = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || null;

  const result = await refreshUserToken(db, c.env, body.refresh_token, userAgent, ipAddress);
  if (result.error) {
    return c.json({ success: false as const, error: result.error.message }, result.error.status as 401);
  }

  return c.json({
    success: true as const,
    data: { session: result.data.session },
  }, 200);
});

// POST /logout (protected - middleware applied in index.ts)
const logoutRoute = createRoute({
  method: 'post',
  path: '/logout',
  tags: ['Session'],
  security: [{ bearerAuth: [] }],
  responses: {
    200: { content: { 'application/json': { schema: LogoutResponseSchema } }, description: 'Logged out' },
    401: { content: { 'application/json': { schema: ErrorResponseSchema } }, description: 'Not authenticated' },
  },
});

app.openapi(logoutRoute, async (c) => {
  const db = c.get('db');
  const user = c.get('user');
  const tokenHash = c.get('tokenHash');

  await db.update(sessions).set({
    revokedAt: new Date().toISOString(),
    revocationReason: 'user_logout',
  }).where(and(eq(sessions.id, tokenHash), isNull(sessions.revokedAt)));

  // Blacklist in KV for fast lookup
  const kv = c.env.RATE_LIMITER;
  if (kv) {
    try {
      await kv.put(`session:blacklist:${tokenHash}`, 'revoked', { expirationTtl: 3600 });
    } catch (err) {
      console.error('[Session] Failed to blacklist token in KV:', err);
    }
  }

  logSessionEvent({
    event: 'session_revoked',
    userId: user.sub,
    sessionId: tokenHash.slice(0, 8),
    timestamp: new Date().toISOString(),
    metadata: { reason: 'user_logout' },
  });

  return c.json({
    success: true as const,
    data: { message: 'Logged out successfully.' },
  }, 200);
});

// POST /logout-all (protected - middleware applied in index.ts)
const logoutAllRoute = createRoute({
  method: 'post',
  path: '/logout-all',
  tags: ['Session'],
  security: [{ bearerAuth: [] }],
  responses: {
    200: { content: { 'application/json': { schema: LogoutResponseSchema } }, description: 'All sessions revoked' },
    401: { content: { 'application/json': { schema: ErrorResponseSchema } }, description: 'Not authenticated' },
  },
});

app.openapi(logoutAllRoute, async (c) => {
  const db = c.get('db');
  const user = c.get('user');

  // Get all active sessions for this user
  const activeSessions = await db.query.sessions.findMany({
    where: and(eq(sessions.userId, user.sub), isNull(sessions.revokedAt)),
    columns: { id: true },
  });

  // Revoke all sessions in DB
  await db.update(sessions).set({
    revokedAt: new Date().toISOString(),
    revocationReason: 'user_logout_all',
  }).where(and(eq(sessions.userId, user.sub), isNull(sessions.revokedAt)));

  // Blacklist all sessions in KV
  const kv = c.env.RATE_LIMITER;
  if (kv) {
    const blacklistPromises = activeSessions.map(s =>
      kv.put(`session:blacklist:${s.id}`, 'revoked', { expirationTtl: 3600 }).catch(err => {
        console.error('[Session] Failed to blacklist token in KV:', err);
      })
    );
    await Promise.all(blacklistPromises);
  }

  logSessionEvent({
    event: 'session_revoked',
    userId: user.sub,
    sessionId: 'all',
    timestamp: new Date().toISOString(),
    metadata: { reason: 'user_logout_all', count: activeSessions.length },
  });

  return c.json({
    success: true as const,
    data: { message: `All sessions revoked (${activeSessions.length} sessions).` },
  }, 200);
});

export default app;
