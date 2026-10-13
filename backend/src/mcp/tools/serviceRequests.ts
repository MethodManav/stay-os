import { z } from 'zod';
import { TenantContext, validateTenantContext } from '../context';
import { serviceRequestService } from '../../services/serviceRequestService';

export const requestRoomServiceSchema = z.object({
  bookingId: z.string().optional().describe('Booking confirmation ID (e.g. STY-XXXXXX or MongoDB ObjectId) of the staying guest if known'),
  roomNumber: z.string().optional().describe('The room number of the guest requesting room service if known (e.g. "101", "204")'),
  serviceType: z.string().default('cleaning').describe('The requested service category, e.g. "cleaning", "housekeeping", "towels", "maintenance", "dining", "room_service"'),
  details: z.string().optional().describe('Specific instructions or items requested (e.g. "clean room and change sheets", "need 2 extra towels", "AC not cooling")'),
  guestName: z.string().optional().describe('Guest name if known'),
  email: z.string().email().optional().describe('Guest registered email for booking lookup'),
  phone: z.string().optional().describe('Guest registered phone for booking lookup'),
  requestedTime: z.string().optional().describe('Requested time or urgency, e.g. "ASAP" or "in 1 hour"')
});

export type RequestRoomServiceInput = z.infer<typeof requestRoomServiceSchema>;

export async function executeRequestRoomService(input: RequestRoomServiceInput, context: TenantContext) {
  const verified = validateTenantContext(context);

  const result = await serviceRequestService.createServiceRequest({
    hotelId: verified.hotelId,
    organizationId: verified.organizationId,
    bookingId: input.bookingId,
    roomNumber: input.roomNumber,
    serviceType: input.serviceType,
    details: input.details,
    guestName: input.guestName,
    email: input.email,
    phone: input.phone,
    requestedTime: input.requestedTime
  });

  return {
    success: true,
    message: `${result.serviceType} has been successfully scheduled for ${result.roomNumber}! Housekeeping will arrive ${result.estimatedArrival.toLowerCase()}. Request Reference: ${result.requestId}.`,
    serviceRequest: result
  };
}
