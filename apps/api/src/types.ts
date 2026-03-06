import type { Database } from './db';

export interface Env {
  DB: D1Database;
  ENVIRONMENT: string;
  ALLOWED_ORIGINS?: string;
}

declare module 'hono' {
  interface ContextVariableMap {
    db: Database;
  }
}
