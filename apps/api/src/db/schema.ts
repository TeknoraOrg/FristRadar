import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const subscriptionTiers = ['free', 'premium'] as const;
export const subscriptionStatuses = ['active', 'canceled', 'expired', 'past_due'] as const;

export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
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
  index('idx_subscriptions_status').on(table.status),
]);

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
