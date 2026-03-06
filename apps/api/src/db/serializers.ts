import type { User } from './schema';

export function serializeUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    timezone: user.timezone || 'Europe/Berlin',
    onboarding_completed: user.onboardingCompleted ?? false,
    subscription_tier: user.subscriptionTier || 'free',
    created_at: user.createdAt || new Date().toISOString(),
    updated_at: user.updatedAt || new Date().toISOString(),
  };
}
