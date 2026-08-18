import { z } from 'zod';

export const createRoomTypeSchema = z.object({
  name: z.string().min(2, 'Room type name must be at least 2 characters'),
  description: z.string().optional(),
  capacity: z.number().int().min(1, 'Capacity must be at least 1 guest'),
  pricePerNight: z.number().min(0, 'Price per night cannot be negative'),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string()).default([])
});

export const updateRoomTypeSchema = createRoomTypeSchema.partial();

export const createRoomSchema = z.object({
  roomTypeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Room Type ID format'),
  roomNumber: z.string().min(1, 'Room number is required'),
  status: z.enum(['available', 'occupied', 'maintenance']).default('available'),
  floor: z.number().int().optional()
});

export const updateRoomSchema = createRoomSchema.partial();
