import type { D1Database } from '@cloudflare/workers-types';

export type Env = {
  Bindings: {
    DB: D1Database;
    JWT_SECRET: string;
    JWT_ISSUER: string;
    OTP_EXPIRY_SECONDS: string;
    OTP_RATE_LIMIT_MAX: string;
    OTP_RATE_LIMIT_WINDOW_SECONDS: string;
    ENVIRONMENT: string;
  };
  Variables: {
    userId: string;
    phone: string;
  };
};
