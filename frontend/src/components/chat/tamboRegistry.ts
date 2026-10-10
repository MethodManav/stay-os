import { z } from 'zod';
import type { TamboComponent } from '@tambo-ai/react';
import { RoomCard } from './generative/RoomCard';
import { BookingConfirmationCard } from './generative/BookingConfirmationCard';
import { AvailabilityBadge } from './generative/AvailabilityBadge';
import { ServiceRequestCard } from './generative/ServiceRequestCard';

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

export const ServiceRequestCardSchema = z.object({
  requestId: z.string().describe('Unique reference identifier for the service dispatch (e.g. SR-XXXXXX)'),
  bookingId: z.string().describe('Verified booking confirmation ID (e.g. STY-XXXXXX)'),
  roomNumber: z.string().describe('The physical room number or allocated suite of the staying guest'),
  roomName: z.string().optional().describe('Name or category of the booked room'),
  guestName: z.string().optional().describe('Name of the staying guest'),
  serviceType: z.string().default('Room Cleaning').describe('Requested service type (e.g. Room Cleaning, Fresh Towels, Maintenance)'),
  status: z.string().default('Scheduled').describe('Current dispatch status'),
  details: z.string().optional().describe('Guest instructions or details'),
  estimatedArrival: z.string().default('Within 20–35 minutes').describe('Expected staff arrival time'),
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
  {
    name: 'ServiceRequestCard',
    description: 'Renders an interactive housekeeping and room service dispatch voucher for room cleaning, maintenance, towels, or room service requests.',
    component: ServiceRequestCard,
    propsSchema: ServiceRequestCardSchema,
  },
];
