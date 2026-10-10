import { z } from 'zod';
import { TenantContext, validateTenantContext } from '../context';
import { serviceRequestService } from '../../services/serviceRequestService';
import { BadRequestError } from '../../core/errors/BadRequestError';

export const requestRoomServiceSchema = z.object({
  bookingId: z.string().optional().describe('Booking confirmation ID (e.g. STY-XXXXXX or MongoDB ObjectId) of the staying guest'),
  roomNumber: z.string().optional().describe('The room number of the guest requesting room service'),
  serviceType: z.string().default('cleaning').describe('The requested service category, e.g. "cleaning", "housekeeping", "towels", "maintenance", "dining"'),
  details: z.string().optional().describe('Specific instructions or items requested (e.g. "clean room and change sheets", "need 2 extra towels")'),
  email: z.string().email().optional().describe('Guest registered email for booking lookup'),
  phone: z.string().optional().describe('Guest registered phone for booking lookup'),
  requestedTime: z.string().optional().describe('Requested time or urgency, e.g. "ASAP" or "in 1 hour"')
});

export type RequestRoomServiceInput = z.infer<typeof requestRoomServiceSchema>;

export async function executeRequestRoomService(input: RequestRoomServiceInput, context: TenantContext) {
  const verified = validateTenantContext(context);

  if (!input.bookingId && !input.email && !input.phone && !input.roomNumber) {
    throw new BadRequestError('A booking confirmation code, room number, or guest contact info is required to verify your reservation before requesting room service.');
  }

  const result = await serviceRequestService.createServiceRequest({
    hotelId: verified.hotelId,
    organizationId: verified.organizationId,
    bookingId: input.bookingId,
    roomNumber: input.roomNumber,
    serviceType: input.serviceType,
    details: input.details,
    email: input.email,
    phone: input.phone,
    requestedTime: input.requestedTime
  });

  return {
    success: true,
    message: `${result.serviceType} has been successfully scheduled for ${result.roomNumber}! Housekeeping will arrive ${result.estimatedArrival.toLowerCase()}.`,
    serviceRequest: result
  };
}
