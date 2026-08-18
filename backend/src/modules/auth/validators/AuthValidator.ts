import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

export const registerOnboardSchema = z.object({
  userName: z.string().min(2, 'User name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  orgName: z.string().min(2, 'Organization name must be at least 2 characters'),
  orgSlug: z.string()
    .min(2, 'Organization slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Organization slug must be lowercase alphanumeric characters and hyphens only'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  businessType: z.enum(['HOTEL', 'RESORT', 'HOMESTAY', 'BOUTIQUE', 'OTHER']),
  businessPhone: z.string().min(5, 'Business phone is too short'),
  businessAddress: z.string().min(2, 'Business address is required'),
  businessCity: z.string().min(2, 'Business city is required'),
  businessCountry: z.string().min(2, 'Business country is required'),
  currency: z.string().min(2, 'Currency code is required').default('USD'),
  timezone: z.string().min(2, 'Timezone is required').default('UTC')
});

