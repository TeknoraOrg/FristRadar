import type { Database } from './db';
import type { AuthenticatedUser } from './middleware/auth';

export interface Env {
  DB: D1Database;
  ENVIRONMENT: string;
  JWT_SECRET: string;
  RATE_LIMITER: KVNamespace;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  ALLOWED_ORIGINS?: string;
}

declare module 'hono' {
  interface ContextVariableMap {
    db: Database;
    user: AuthenticatedUser;
    tokenHash: string;
  }
}
