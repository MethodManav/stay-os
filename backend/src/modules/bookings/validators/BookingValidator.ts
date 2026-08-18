import { z } from 'zod';

export const createBookingSchema = z.object({
  guestId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Guest ID format').optional(),
  guestDetails: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email format'),
    phone: z.string().min(5, 'Phone number is too short'),
    country: z.string().optional()
  }).optional(),
  roomId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Room ID format'),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, 'Check-in must be a valid date string (YYYY-MM-DD or ISO)'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, 'Check-out must be a valid date string (YYYY-MM-DD or ISO)'),
  numberOfGuests: z.number().int().min(1, 'Number of guests must be at least 1'),
  pricing: z.object({
    discount: z.number().min(0).optional(),
    tax: z.number().min(0).optional()
  }).optional(),
  notes: z.string().optional(),
  source: z.enum(['DASHBOARD', 'WEBSITE', 'AI']).default('DASHBOARD')
}).refine(data => data.guestId || data.guestDetails, {
  message: 'Either guestId or guestDetails must be provided',
  path: ['guestId']
});

export const updateBookingSchema = z.object({
  notes: z.string().optional(),
  bookingStatus: z.enum(['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PARTIAL', 'PAID', 'REFUNDED', 'FAILED']).optional()
});
