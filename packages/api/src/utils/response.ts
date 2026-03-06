import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

export function success(c: Context, data: unknown, status: ContentfulStatusCode = 200) {
  return c.json({ ok: true, data }, status);
}

export function fail(c: Context, error: string, status: ContentfulStatusCode = 400) {
  return c.json({ ok: false, error }, status);
}

export function failMany(c: Context, errors: string[], status: ContentfulStatusCode = 400) {
  return c.json({ ok: false, errors }, status);
}
