export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  timezone: string;
  onboarding_completed: boolean;
  subscription_tier: 'free' | 'premium';
  created_at: string;
  updated_at: string;
}

export interface UpdateUserInput {
  first_name?: string;
  last_name?: string;
  timezone?: string;
  onboarding_completed?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
