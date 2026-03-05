import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import type { Env } from '../types';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { serializeUser } from '../db/serializers';
import {
  UserResponseSchema,
  UpdateUserInputSchema,
  ErrorResponseSchema,
} from '../openapi/schemas';
import { validationHook } from '../openapi/validation-hook';

const app = new OpenAPIHono<{ Bindings: Env }>({ defaultHook: validationHook });

// GET /me
const getMeRoute = createRoute({
  method: 'get',
  path: '/me',
  tags: ['User'],
  security: [{ bearerAuth: [] }],
  responses: {
    200: { content: { 'application/json': { schema: UserResponseSchema } }, description: 'Current user' },
    401: { content: { 'application/json': { schema: ErrorResponseSchema } }, description: 'Not authenticated' },
    404: { content: { 'application/json': { schema: ErrorResponseSchema } }, description: 'User not found' },
  },
});

app.openapi(getMeRoute, async (c) => {
  const db = c.get('db');
  const authUser = c.get('user');

  const userData = await db.query.users.findFirst({
    where: eq(users.id, authUser.sub),
  });

  if (!userData) {
    return c.json({ success: false as const, error: 'User not found.' }, 404);
  }

  return c.json({
    success: true as const,
    data: { user: serializeUser(userData) },
  }, 200);
});

// PUT /me
const updateMeRoute = createRoute({
  method: 'put',
  path: '/me',
  tags: ['User'],
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { 'application/json': { schema: UpdateUserInputSchema } } },
  },
  responses: {
    200: { content: { 'application/json': { schema: UserResponseSchema } }, description: 'User updated' },
    401: { content: { 'application/json': { schema: ErrorResponseSchema } }, description: 'Not authenticated' },
    404: { content: { 'application/json': { schema: ErrorResponseSchema } }, description: 'User not found' },
  },
});

app.openapi(updateMeRoute, async (c) => {
  const db = c.get('db');
  const authUser = c.get('user');
  const body = c.req.valid('json');

  // Build update object with only provided fields
  const updates: Record<string, any> = {
    updatedAt: new Date().toISOString(),
  };

  if (body.first_name !== undefined) updates.firstName = body.first_name;
  if (body.last_name !== undefined) updates.lastName = body.last_name;
  if (body.timezone !== undefined) updates.timezone = body.timezone;
  if (body.onboarding_completed !== undefined) updates.onboardingCompleted = body.onboarding_completed;

  const updated = await db.update(users)
    .set(updates)
    .where(eq(users.id, authUser.sub))
    .returning();

  if (updated.length === 0) {
    return c.json({ success: false as const, error: 'User not found.' }, 404);
  }

  return c.json({
    success: true as const,
    data: { user: serializeUser(updated[0]) },
  }, 200);
});

export default app;
