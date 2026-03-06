import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types.js';
import auth from './routes/auth.js';

const app = new Hono<Env>();

app.onError((err, c) => {
  console.error('[API Error]', err.message, err.stack);
  return c.json({ ok: false, error: 'Internal server error' }, 500);
});

app.use('/*', cors({
  origin: ['http://localhost:5173', 'http://localhost:8081'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

app.get('/health', (c) => c.json({ ok: true, service: 'fristradar-api' }));

app.route('/auth', auth);

app.notFound((c) => c.json({ ok: false, error: 'Not found' }, 404));

export default app;
