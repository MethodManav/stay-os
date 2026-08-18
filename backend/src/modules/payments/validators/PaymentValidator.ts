import { z } from 'zod';

export const processPaymentSchema = z.object({
  bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Booking ID format'),
  amount: z.number().positive('Payment amount must be greater than zero'),
  currency: z.string().min(2, 'Currency code is required'),
  provider: z.enum(['stripe', 'razorpay']),
  sourceToken: z.string().optional()
});

export const processRefundSchema = z.object({
  transactionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Transaction ID format'),
  amount: z.number().positive('Refund amount must be greater than zero')
});
