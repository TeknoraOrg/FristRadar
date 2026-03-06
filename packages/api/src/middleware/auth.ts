import type { MiddlewareHandler } from 'hono';
import type { Env } from '../types.js';
import { verifyToken } from '../utils/jwt.js';

export function requireAuth(): MiddlewareHandler<Env> {
  return async (c, next) => {
    const header = c.req.header('Authorization');
    if (!header?.startsWith('Bearer ')) {
      return c.json({ ok: false, error: 'Missing or malformed Authorization header' }, 401);
    }

    const token = header.slice(7);
    const payload = await verifyToken(token, c.env.JWT_SECRET, c.env.JWT_ISSUER);
    if (!payload) {
      return c.json({ ok: false, error: 'Invalid or expired token' }, 401);
    }

    c.set('userId', payload.sub as string);
    c.set('phone', payload.phone as string);
    await next();
  };
}
