import { z } from 'zod';
import { TenantContext, validateTenantContext } from '../context';
import { roomService } from '../../services/roomService';

export const checkAvailabilitySchema = z.object({
  roomId: z.string().describe('The unique identifier of the room or room category'),
  checkIn: z.string().describe('Check-in date in YYYY-MM-DD format'),
  checkOut: z.string().describe('Check-out date in YYYY-MM-DD format')
});

export type CheckAvailabilityInput = z.infer<typeof checkAvailabilitySchema>;

export async function executeCheckAvailability(input: CheckAvailabilityInput, context: TenantContext) {
  const verified = validateTenantContext(context);
  const result = await roomService.checkAvailability({
    hotelId: verified.hotelId,
    organizationId: verified.organizationId,
    roomId: input.roomId,
    checkIn: input.checkIn,
    checkOut: input.checkOut
  });

  return {
    hotelId: verified.hotelId,
    hotelName: verified.hotelName,
    ...result
  };
}
