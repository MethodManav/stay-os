import { z } from 'zod';
import type { TamboComponent } from '@tambo-ai/react';
import { RoomCard } from './generative/RoomCard';
import { BookingConfirmationCard } from './generative/BookingConfirmationCard';
import { AvailabilityBadge } from './generative/AvailabilityBadge';

export const RoomCardSchema = z.object({
  roomId: z.string().describe('Unique identifier or ID of the room type'),
  name: z.string().describe('Title of the room type (e.g. Deluxe Heritage Suite)'),
  description: z.string().optional().describe('Brief description of the room and highlights'),
  price: z.number().describe('Base price per night in the hotel currency'),
  currency: z.string().default('INR').describe('Currency code (INR, USD, EUR, etc.)'),
  capacity: z.number().default(2).describe('Max number of guests accommodated'),
  amenities: z.array(z.string()).default([]).describe('Highlight amenities (e.g. Free Wi-Fi, King Bed, Breakfast)'),
  imageUrl: z.string().optional().describe('Representative photo URL of the room'),
});

export const BookingConfirmationCardSchema = z.object({
  bookingId: z.string().describe('Unique confirmation reference code (e.g. STY-XXXXXX)'),
  guestName: z.string().describe('Full name of the reserving guest'),
  roomName: z.string().describe('Name of the room booked'),
  checkIn: z.string().describe('Check-in date (YYYY-MM-DD)'),
  checkOut: z.string().describe('Check-out date (YYYY-MM-DD)'),
  totalAmount: z.number().describe('Total booking price'),
  currency: z.string().default('INR').describe('Currency code (INR, USD, EUR, etc.)'),
  status: z.enum(['confirmed', 'pending', 'cancelled']).default('confirmed').describe('Current status of the reservation'),
});

export const AvailabilityBadgeSchema = z.object({
  roomName: z.string().describe('The name of the room checked for availability'),
  roomId: z.string().optional().describe('Optional room ID to trigger booking directly'),
  checkIn: z.string().describe('Requested check-in date'),
  checkOut: z.string().describe('Requested check-out date'),
  isAvailable: z.boolean().describe('True if room can be reserved for specified dates, false otherwise'),
  pricePerNight: z.number().optional().describe('Rate per night for the selected period'),
  currency: z.string().default('INR').describe('Currency code'),
});

export const tamboComponents: TamboComponent[] = [
  {
    name: 'RoomCard',
    description: 'Renders an interactive hotel room card with photos, pricing, capacity, and direct "Book Now" action. Use whenever presenting available room choices or details to the guest.',
    component: RoomCard,
    propsSchema: RoomCardSchema,
  },
  {
    name: 'BookingConfirmationCard',
    description: 'Renders a stylish digital boarding pass/voucher for confirmed, pending, or cancelled bookings with full stay summary and reference code. Use when confirming a booking or retrieving an existing reservation.',
    component: BookingConfirmationCard,
    propsSchema: BookingConfirmationCardSchema,
  },
  {
    name: 'AvailabilityBadge',
    description: 'Renders a live availability check banner with stay dates, availability status, and rate estimate. Use when guests ask if rooms are free for specific dates.',
    component: AvailabilityBadge,
    propsSchema: AvailabilityBadgeSchema,
  },
];
