import { z } from 'zod';
import { TenantContext, validateTenantContext } from '../context';
import { roomService } from '../../services/roomService';

export const searchRoomsSchema = z.object({
  checkIn: z.string().describe('Check-in date in YYYY-MM-DD format'),
  checkOut: z.string().describe('Check-out date in YYYY-MM-DD format'),
  guests: z.number().int().positive().default(2).describe('Number of guests')
});

export type SearchRoomsInput = z.infer<typeof searchRoomsSchema>;

export async function executeSearchRooms(input: SearchRoomsInput, context: TenantContext) {
  const verified = validateTenantContext(context);
  const result = await roomService.searchRooms({
    hotelId: verified.hotelId,
    organizationId: verified.organizationId,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    guests: input.guests
  });

  return {
    hotelId: verified.hotelId,
    hotelName: verified.hotelName,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    guests: input.guests,
    totalFound: result.rooms.length,
    rooms: result.rooms
  };
}

export const getRoomDetailsSchema = z.object({
  roomId: z.string().describe('The unique identifier of the room or room category')
});

export type GetRoomDetailsInput = z.infer<typeof getRoomDetailsSchema>;

export async function executeGetRoomDetails(input: GetRoomDetailsInput, context: TenantContext) {
  const verified = validateTenantContext(context);
  const details = await roomService.getRoomDetails({
    hotelId: verified.hotelId,
    organizationId: verified.organizationId,
    roomId: input.roomId
  });

  return {
    hotelId: verified.hotelId,
    ...details
  };
}
