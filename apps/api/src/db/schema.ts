import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const subscriptionTiers = ['free', 'premium'] as const;

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  emailVerifiedAt: text('email_verified_at'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  timezone: text('timezone').default('Europe/Berlin'),
  onboardingCompleted: integer('onboarding_completed', { mode: 'boolean' }).default(false),
  subscriptionTier: text('subscription_tier', { enum: subscriptionTiers }).default('free'),
  language: text('language').default('de'),
  lastSeenAt: text('last_seen_at'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
}, (table) => [
  index('idx_users_email').on(table.email),
]);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: text('expires_at').notNull(),
  deviceType: text('device_type'),
  deviceName: text('device_name'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  lastActivityAt: text('last_activity_at').notNull(),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  refreshTokenHash: text('refresh_token_hash'),
  revokedAt: text('revoked_at'),
  revocationReason: text('revocation_reason'),
  replacedBySessionId: text('replaced_by_session_id'),
}, (table) => [
  index('idx_sessions_user_id').on(table.userId),
  index('idx_sessions_expires_at').on(table.expiresAt),
  index('idx_sessions_revoked_at').on(table.revokedAt),
  index('idx_sessions_refresh_token_hash').on(table.refreshTokenHash),
]);

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export const subscriptionStatuses = ['active', 'canceled', 'expired', 'past_due'] as const;

export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tier: text('tier', { enum: subscriptionTiers }).notNull().default('free'),
  status: text('status', { enum: subscriptionStatuses }).notNull().default('active'),
  currentPeriodStart: text('current_period_start').notNull(),
  currentPeriodEnd: text('current_period_end'),
  canceledAt: text('canceled_at'),
  paymentProvider: text('payment_provider'),
  paymentProviderSubscriptionId: text('payment_provider_subscription_id'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
}, (table) => [
  uniqueIndex('idx_subscriptions_user_id').on(table.userId),
  index('idx_subscriptions_status').on(table.status),
]);

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

export const otpTypes = ['signup', 'recovery'] as const;

export const emailVerificationOtps = sqliteTable('email_verification_otps', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  otpHash: text('otp_hash').notNull(),
  type: text('type', { enum: otpTypes }).notNull(),
  attempts: integer('attempts').notNull().default(0),
  maxAttempts: integer('max_attempts').notNull().default(5),
  expiresAt: text('expires_at').notNull(),
  usedAt: text('used_at'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
}, (table) => [
  index('idx_otp_user_id').on(table.userId),
  index('idx_otp_email_type').on(table.email, table.type),
]);

export type EmailVerificationOtp = typeof emailVerificationOtps.$inferSelect;
export type NewEmailVerificationOtp = typeof emailVerificationOtps.$inferInsert;
