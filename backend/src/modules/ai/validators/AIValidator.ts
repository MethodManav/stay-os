import { z } from 'zod';

export const guestMessageSchema = z.object({
  guestName: z.string().min(1, 'Guest name is required'),
  guestPhone: z.string().min(5, 'Valid guest phone number is required'),
  text: z.string().min(1, 'Message text cannot be empty')
});

export const kbItemSchema = z.object({
  category: z.enum(['FAQ', 'POLICY', 'DETAILS']),
  question: z.string().min(3, 'Question must be at least 3 characters long'),
  answer: z.string().min(1, 'Answer cannot be empty')
});

export const conversationStatusSchema = z.object({
  status: z.enum(['active', 'resolved', 'escalated']),
  unread: z.boolean().optional()
});
