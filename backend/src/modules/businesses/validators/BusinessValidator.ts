import { z } from 'zod';

const normalizeTime = (val: unknown) => {
  if (typeof val !== 'string' || !val.trim()) return val;
  const match = val.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?$/i);
  if (!match) return val;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const meridiem = match[3]?.toUpperCase();
  if (meridiem) {
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
  }
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

const normalizeBreakfastPolicy = (val: unknown) => {
  if (typeof val !== 'string') return val;
  const lower = val.toLowerCase().trim();
  if (lower.includes('no') || lower === 'none') return 'none';
  if (lower.includes('paid') || lower.includes('surcharge')) return 'paid';
  if (lower.includes('free') || lower.includes('included') || lower === 'included') return 'included';
  return val;
};

export const createBusinessSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric characters and hyphens only'),
  type: z.enum(['HOTEL', 'RESORT', 'HOMESTAY', 'BOUTIQUE', 'OTHER']).default('HOTEL'),
  description: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number is too short'),
  address: z.string().min(2, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().optional(),
  country: z.string().min(2, 'Country is required'),
  currency: z.string().min(2, 'Currency code is required').default('USD'),
  timezone: z.string().min(2, 'Timezone is required').default('UTC'),
  checkInTime: z.preprocess(
    normalizeTime,
    z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
  ).default('14:00'),
  checkOutTime: z.preprocess(
    normalizeTime,
    z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
  ).default('11:00'),
  wifiPassword: z.string().optional(),
  breakfastPolicy: z.preprocess(
    normalizeBreakfastPolicy,
    z.enum(['included', 'paid', 'none'])
  ).default('none'),
  cancellationPolicy: z.string().optional(),
  amenities: z.array(z.string()).default([]),
  logo: z.string().optional(),
  images: z.array(z.string()).default([])
});

export const updateBusinessSchema = createBusinessSchema.partial();

