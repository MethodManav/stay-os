import { z } from 'zod';
import { TenantContext, validateTenantContext } from '../context';
import { bookingService } from '../../services/bookingService';

export const createBookingSchema = z.object({
  roomId: z.string().describe('The room category ID or room ID to book'),
  checkIn: z.string().describe('Check-in date in YYYY-MM-DD format'),
  checkOut: z.string().describe('Check-out date in YYYY-MM-DD format'),
  guests: z.number().int().positive().default(2).describe('Number of guests staying'),
  guest: z.object({
    name: z.string().min(1).describe('Full name of primary guest'),
    email: z.string().email().describe('Email address of primary guest'),
    phone: z.string().min(5).describe('Phone number of primary guest')
  }).describe('Guest contact details')
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export async function executeCreateBooking(input: CreateBookingInput, context: TenantContext) {
  const verified = validateTenantContext(context);
  const booking = await bookingService.createBooking({
    hotelId: verified.hotelId,
    organizationId: verified.organizationId,
    roomId: input.roomId,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    guests: input.guests,
    guest: input.guest
  });

  return {
    success: true,
    message: `Booking successfully confirmed for ${booking.guest.name}!`,
    booking
  };
}

export const getBookingSchema = z.object({
  bookingId: z.string().describe('The booking confirmation ID (e.g. STY-XXXXXX or MongoDB ObjectId)'),
  email: z.string().email().optional().describe('Guest email address for security verification'),
  phone: z.string().optional().describe('Guest phone number for security verification')
});

export type GetBookingInput = z.infer<typeof getBookingSchema>;

export async function executeGetBooking(input: GetBookingInput, context: TenantContext) {
  const verified = validateTenantContext(context);
  const booking = await bookingService.getBooking({
    hotelId: verified.hotelId,
    bookingId: input.bookingId,
    email: input.email,
    phone: input.phone
  });

  return {
    success: true,
    booking
  };
}

export const cancelBookingSchema = z.object({
  bookingId: z.string().describe('The booking confirmation ID to cancel'),
  email: z.string().email().optional().describe('Guest email address for verification'),
  phone: z.string().optional().describe('Guest phone number for verification'),
  reason: z.string().optional().describe('Reason for cancellation')
});

export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;

export async function executeCancelBooking(input: CancelBookingInput, context: TenantContext) {
  const verified = validateTenantContext(context);
  const result = await bookingService.cancelBooking({
    hotelId: verified.hotelId,
    bookingId: input.bookingId,
    email: input.email,
    phone: input.phone,
    reason: input.reason
  });

  return {
    success: result.success,
    message: result.policyMessage,
    bookingId: result.bookingId,
    bookingStatus: result.bookingStatus,
    refundStatus: result.refundStatus
  };
}
