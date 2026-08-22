import { z } from 'zod';

export const registerHotelSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.enum(['HOTEL', 'RESORT', 'HOMESTAY', 'BOUTIQUE', 'OTHER']).default('RESORT'),
  baseRoomPrice: z.number().min(0, 'Base room price must be positive').default(2999),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number is too short'),
  templateLayout: z.enum(['modern', 'luxury', 'boutique', 'minimal']).default('modern')
});
