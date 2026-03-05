-- FristRadar Initial Schema Migration
-- Tables: users, sessions, subscriptions, email_verification_otps

CREATE TABLE IF NOT EXISTS `users` (
  `id` text PRIMARY KEY NOT NULL,
  `email` text NOT NULL,
  `password_hash` text,
  `email_verified` integer NOT NULL DEFAULT false,
  `email_verified_at` text,
  `first_name` text,
  `last_name` text,
  `timezone` text DEFAULT 'Europe/Berlin',
  `onboarding_completed` integer DEFAULT false,
  `subscription_tier` text DEFAULT 'free',
  `language` text DEFAULT 'de',
  `last_seen_at` text,
  `created_at` text DEFAULT (datetime('now')),
  `updated_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `users_email_unique` ON `users` (`email`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_users_email` ON `users` (`email`);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `sessions` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `expires_at` text NOT NULL,
  `device_type` text,
  `device_name` text,
  `ip_address` text,
  `user_agent` text,
  `last_activity_at` text NOT NULL,
  `created_at` text NOT NULL DEFAULT (datetime('now')),
  `refresh_token_hash` text,
  `revoked_at` text,
  `revocation_reason` text,
  `replaced_by_session_id` text
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_sessions_user_id` ON `sessions` (`user_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_sessions_expires_at` ON `sessions` (`expires_at`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_sessions_revoked_at` ON `sessions` (`revoked_at`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_sessions_refresh_token_hash` ON `sessions` (`refresh_token_hash`);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `tier` text NOT NULL DEFAULT 'free',
  `status` text NOT NULL DEFAULT 'active',
  `current_period_start` text NOT NULL,
  `current_period_end` text,
  `canceled_at` text,
  `payment_provider` text,
  `payment_provider_subscription_id` text,
  `created_at` text NOT NULL DEFAULT (datetime('now')),
  `updated_at` text NOT NULL DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `idx_subscriptions_user_id` ON `subscriptions` (`user_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_subscriptions_status` ON `subscriptions` (`status`);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `email_verification_otps` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `email` text NOT NULL,
  `otp_hash` text NOT NULL,
  `type` text NOT NULL,
  `attempts` integer NOT NULL DEFAULT 0,
  `max_attempts` integer NOT NULL DEFAULT 5,
  `expires_at` text NOT NULL,
  `used_at` text,
  `created_at` text NOT NULL DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_otp_user_id` ON `email_verification_otps` (`user_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_otp_email_type` ON `email_verification_otps` (`email`, `type`);
