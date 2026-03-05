import { z } from 'zod';

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
});

export const HealthResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    status: z.literal('ok'),
    timestamp: z.string(),
    version: z.string(),
  }),
});

export const RegisterInputSchema = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const RegisterResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    user: z.object({
      id: z.string(),
      email: z.string(),
      first_name: z.string().nullable(),
      last_name: z.string().nullable(),
      timezone: z.string(),
      onboarding_completed: z.boolean(),
      subscription_tier: z.string(),
      created_at: z.string(),
      updated_at: z.string(),
    }),
    message: z.string(),
  }),
});

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const LoginResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    user: z.object({
      id: z.string(),
      email: z.string(),
      first_name: z.string().nullable(),
      last_name: z.string().nullable(),
      timezone: z.string(),
      onboarding_completed: z.boolean(),
      subscription_tier: z.string(),
      created_at: z.string(),
      updated_at: z.string(),
    }),
    session: z.object({
      access_token: z.string(),
      refresh_token: z.string(),
      expires_at: z.number(),
      expires_in: z.number(),
      token_type: z.string(),
    }),
  }),
});

export const ResendVerificationInputSchema = z.object({
  email: z.string().email(),
});

export const ResendVerificationResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ message: z.string() }),
});

export const VerifyOtpInputSchema = z.object({
  email: z.string().email(),
  token: z.string().min(6).max(10),
  type: z.enum(['signup', 'recovery']),
});

export const VerifyOtpResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    user: z.object({
      id: z.string(),
      email: z.string(),
      first_name: z.string().nullable(),
      last_name: z.string().nullable(),
      timezone: z.string(),
      onboarding_completed: z.boolean(),
      subscription_tier: z.string(),
      created_at: z.string(),
      updated_at: z.string(),
    }),
    session: z.object({
      access_token: z.string(),
      refresh_token: z.string(),
      expires_at: z.number(),
      expires_in: z.number(),
      token_type: z.string(),
    }),
    message: z.string(),
  }),
});

export const ForgotPasswordInputSchema = z.object({
  email: z.string().email(),
});

export const ForgotPasswordResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ message: z.string() }),
});

export const ResetPasswordInputSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  password: z.string().min(8).max(128),
});

export const ResetPasswordResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ message: z.string() }),
});

export const RefreshTokenInputSchema = z.object({
  refresh_token: z.string(),
});

export const RefreshTokenResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    session: z.object({
      access_token: z.string(),
      refresh_token: z.string(),
      expires_at: z.number(),
      expires_in: z.number(),
      token_type: z.string(),
    }),
  }),
});

export const UserResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    user: z.object({
      id: z.string(),
      email: z.string(),
      first_name: z.string().nullable(),
      last_name: z.string().nullable(),
      timezone: z.string(),
      onboarding_completed: z.boolean(),
      subscription_tier: z.string(),
      created_at: z.string(),
      updated_at: z.string(),
    }),
  }),
});

export const UpdateUserInputSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  timezone: z.string().optional(),
  onboarding_completed: z.boolean().optional(),
});
