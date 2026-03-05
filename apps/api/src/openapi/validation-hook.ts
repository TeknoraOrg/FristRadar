import type { Hook } from '@hono/zod-openapi';
import type { Env } from '../types';

export const validationHook: Hook<any, { Bindings: Env }, any, any> = (result, c) => {
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const field = firstIssue?.path?.join('.') || 'input';
    const message = firstIssue?.message || 'Validation failed';
    return c.json({ success: false, error: `${field}: ${message}` }, 400);
  }
};
