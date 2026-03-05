import { Context, Next } from 'hono';
import { jwtVerify } from 'jose';
import type { Env } from '../types';
import type { Database } from '../db';
import { hashToken, logSessionEvent } from '../lib/session-utils';
import { sessions, users } from '../db/schema';
import { eq, and, isNull, isNotNull, sql } from 'drizzle-orm';

export interface AuthenticatedUser {
  sub: string;
  email: string;
  role: string;
}

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Missing or invalid authorization header' }, 401);
  }

  const token = authHeader.slice(7);
  const tokenHash = await hashToken(token);

  try {
    const secret = new TextEncoder().encode(c.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, { issuer: 'fristradar', audience: 'authenticated' });

    const user: AuthenticatedUser = {
      sub: payload.sub!,
      email: payload.email as string,
      role: (payload.role as string) || 'authenticated',
    };

    // Check session blacklist
    const kv = c.env.RATE_LIMITER;
    let isBlacklisted = false;

    if (kv) {
      const blacklisted = await kv.get(`session:blacklist:${tokenHash}`);
      if (blacklisted) isBlacklisted = true;
    }

    if (!isBlacklisted) {
      const db = c.get('db');
      const revokedSession = await db.query.sessions.findFirst({
        where: and(eq(sessions.id, tokenHash), isNotNull(sessions.revokedAt)),
        columns: { id: true },
      });
      if (revokedSession) isBlacklisted = true;
    }

    if (isBlacklisted) {
      return c.json({ success: false, error: 'Session has been revoked. Please log in again.' }, 401);
    }

    // Update session activity (non-blocking)
    c.executionCtx?.waitUntil(
      updateSessionActivity(c.get('db'), tokenHash, user.sub).catch(err => {
        console.error('[Auth] Failed to update session activity:', err);
      })
    );

    c.set('user', user);
    c.set('tokenHash', tokenHash);
    await next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    return c.json({ success: false, error: 'Invalid or expired token' }, 401);
  }
}

async function updateSessionActivity(db: Database, tokenHash: string, userId: string) {
  const now = new Date().toISOString();
  await db.update(sessions).set({ lastActivityAt: now })
    .where(and(eq(sessions.id, tokenHash), eq(sessions.userId, userId), isNull(sessions.revokedAt)));

  await db.update(users).set({ lastSeenAt: now })
    .where(and(eq(users.id, userId), sql`(${users.lastSeenAt} IS NULL OR ${users.lastSeenAt} < datetime('now', '-60 seconds'))`));
}
