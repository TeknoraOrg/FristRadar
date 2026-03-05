import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

export type Database = ReturnType<typeof createDb>;
export {
  users, type User, type NewUser,
  sessions, type Session, type NewSession,
  subscriptions, subscriptionStatuses, subscriptionTiers, type Subscription, type NewSubscription,
  emailVerificationOtps, otpTypes, type EmailVerificationOtp, type NewEmailVerificationOtp,
} from './schema';
