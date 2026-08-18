import { z } from 'zod';

export const createGuestSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number is too short'),
  country: z.string().optional(),
  tags: z.array(z.string()).default([]),
  preferences: z.string().optional(),
  notes: z.string().optional()
});

export const updateGuestSchema = createGuestSchema.partial();

export const queryGuestSchema = z.object({
  search: z.string().optional(),
  tags: z.preprocess((val) => {
    if (typeof val === 'string') return val.split(',');
    return val;
  }, z.array(z.string())).optional(),
  country: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
});
