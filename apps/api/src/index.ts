import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';
import type { Env } from './types';
import { createDb } from './db';
import { HealthResponseSchema } from './openapi/schemas';
import { validationHook } from './openapi/validation-hook';

const app = new OpenAPIHono<{ Bindings: Env }>({ defaultHook: validationHook });

// CORS
app.use('*', async (c, next) => {
  const origin = c.env.ENVIRONMENT === 'development' ? '*' :
    ((c.env.ALLOWED_ORIGINS ?? '').split(',').map(s => s.trim()).filter(Boolean));
  return cors({
    origin,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
  })(c, next);
});

// Drizzle middleware
app.use('*', async (c, next) => {
  c.set('db', createDb(c.env.DB));
  await next();
});

// Health check
const healthRoute = createRoute({
  method: 'get', path: '/api/health', tags: ['Health'],
  responses: { 200: { content: { 'application/json': { schema: HealthResponseSchema } }, description: 'API is healthy' } },
});
app.openapi(healthRoute, (c) => c.json({ success: true as const, data: { status: 'ok' as const, timestamp: new Date().toISOString(), version: '0.0.1' } }));

// OpenAPI docs (dev only)
app.use('/api/doc', async (c, next) => {
  if (c.env.ENVIRONMENT === 'production') return c.json({ success: false, error: 'Not found' }, 404);
  await next();
});
app.doc('/api/doc', () => ({
  openapi: '3.0.0',
  info: { title: 'FristRadar API', version: '0.0.1', description: 'API for FristRadar' },
  tags: [{ name: 'Health' }],
}));

app.use('/api/ui', async (c, next) => {
  if (c.env.ENVIRONMENT === 'production') return c.json({ success: false, error: 'Not found' }, 404);
  await next();
});
app.get('/api/ui', swaggerUI({ url: '/api/doc' }));

// Catch-all
app.all('/api/*', (c) => c.json({ success: false, error: 'Not found' }, 404));
app.notFound((c) => c.json({ success: false, error: 'Not found' }, 404));
app.onError((err, c) => {
  const isDev = c.env?.ENVIRONMENT === 'development';
  console.error(`[Error] ${err.name}: ${err.message}`, isDev ? err.stack : '');
  return c.json({ success: false, error: isDev ? `${err.name}: ${err.message}` : 'Internal server error' }, 500);
});

export default { fetch: app.fetch };
