import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // UUID
  phone: text('phone').notNull().unique(), // E.164 format, e.g. +491701234567
  passwordHash: text('password_hash').notNull(),
  phoneVerified: integer('phone_verified', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(), // ISO 8601
  updatedAt: text('updated_at').notNull(),
});

export const otpCodes = sqliteTable('otp_codes', {
  id: text('id').primaryKey(), // UUID
  phone: text('phone').notNull(), // E.164
  code: text('code').notNull(), // 6-digit OTP
  purpose: text('purpose').notNull().default('registration'), // 'registration' | 'login' | 'reset'
  attempts: integer('attempts').notNull().default(0), // wrong-guess counter
  expiresAt: text('expires_at').notNull(), // ISO 8601
  usedAt: text('used_at'), // null until consumed
  createdAt: text('created_at').notNull(),
});

// Rate limit tracking for OTP requests
export const otpRateLimits = sqliteTable('otp_rate_limits', {
  phone: text('phone').primaryKey(), // E.164
  requestCount: integer('request_count').notNull().default(0),
  windowStart: text('window_start').notNull(), // ISO 8601
});
