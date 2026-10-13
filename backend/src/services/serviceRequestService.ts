import { Types } from 'mongoose';
import { ServiceRequestModel, ServiceType } from '../modules/bookings/models/ServiceRequestModel';
import { BookingModel } from '../modules/bookings/models/BookingModel';
import { RoomModel } from '../modules/rooms/models/RoomModel';
import { BusinessModel } from '../modules/businesses/models/BusinessModel';
import { bookingService } from './bookingService';
import { BadRequestError } from '../core/errors/BadRequestError';
import { NotFoundError } from '../core/errors/NotFoundError';

export interface CreateServiceRequestParams {
  hotelId: string;
  organizationId?: string;
  bookingId?: string;
  email?: string;
  phone?: string;
  guestName?: string;
  roomNumber?: string;
  serviceType?: string;
  details?: string;
  requestedTime?: string;
  priority?: 'low' | 'normal' | 'high';
}

export interface ServiceRequestResponse {
  requestId: string;
  bookingId: string;
  roomNumber: string;
  roomName: string;
  guestName: string;
  serviceType: string;
  status: string;
  details: string;
  estimatedArrival: string;
  createdAt: string;
}

export class ServiceRequestService {
  /**
   * Schedule or dispatch a room service / housekeeping request.
   * Gracefully links active booking if available, or records directly for hotel staff.
   */
  public async createServiceRequest(params: CreateServiceRequestParams): Promise<ServiceRequestResponse> {
    const { hotelId, bookingId, email, phone, roomNumber } = params;

    if (!hotelId || !Types.ObjectId.isValid(hotelId)) {
      throw new BadRequestError('Invalid hotel identifier');
    }

    // 1. Resolve organizationId
    let orgId: Types.ObjectId | null = params.organizationId && Types.ObjectId.isValid(params.organizationId) 
      ? new Types.ObjectId(params.organizationId) 
      : null;

    if (!orgId) {
      const b = await BusinessModel.findById(new Types.ObjectId(hotelId)).select('organizationId').exec();
      if (b?.organizationId) {
        orgId = b.organizationId;
      }
    }
    if (!orgId) {
      orgId = new Types.ObjectId();
    }

    // 2. Attempt to verify or find active booking if any details are given
    let booking: any = null;
    let bRecord: any = null;

    if (bookingId) {
      try {
        booking = await bookingService.getBooking({
          hotelId,
          bookingId,
          email,
          phone
        });
      } catch (err: any) {
        throw new NotFoundError(err.message || 'No confirmed reservation found for this property with that booking ID.');
      }
    } else if (email || phone) {
      try {
        booking = await bookingService.getBooking({
          hotelId,
          email,
          phone
        });
      } catch {
        // Non-blocking: proceed with guest context
      }
    }

    if (!booking && roomNumber) {
      const physicalRoom = await RoomModel.findOne({
        businessId: new Types.ObjectId(hotelId),
        roomNumber: roomNumber.trim()
      }).exec();

      if (physicalRoom) {
        const activeBooking = await BookingModel.findOne({
          businessId: new Types.ObjectId(hotelId),
          roomId: physicalRoom._id,
          bookingStatus: { $in: ['CONFIRMED', 'CHECKED_IN'] }
        }).sort({ createdAt: -1 }).populate('guestId').populate('roomTypeId').exec();

        if (activeBooking) {
          bRecord = activeBooking;
          try {
            booking = await bookingService.getBooking({
              hotelId,
              bookingId: activeBooking._id.toString()
            });
          } catch {
            // Fallback to activeBooking document
          }
        }
      }
    }

    if (booking?.bookingId && !bRecord) {
      bRecord = await BookingModel.findById(new Types.ObjectId(booking.bookingId)).exec();
    }

    // 3. Resolve room number and guest name
    let finalRoomNumber: string = roomNumber || booking?.roomNumber || '';
    if (!finalRoomNumber && bRecord?.roomId) {
      const bDoc = await BookingModel.findById(bRecord._id).populate('roomId').exec();
      const rDoc: any = bDoc?.roomId;
      finalRoomNumber = rDoc?.roomNumber || '';
    }
    if (!finalRoomNumber) {
      finalRoomNumber = roomNumber ? `Room ${roomNumber}` : 'Room (To be confirmed)';
    }

    const finalRoomName: string = booking?.roomName || (bRecord ? 'Assigned Suite' : 'Guest Room');
    const finalGuestName: string = params.guestName || booking?.guest?.name || (bRecord?.guestId ? 'In-House Guest' : 'Valued Guest');
    const finalBookingCode: string = booking?.confirmationCode || (bookingId ? bookingId : 'IN-HOUSE');

    // 4. Normalize service type
    const rawType = (params.serviceType || 'cleaning').toLowerCase();
    let normalizedType: ServiceType = 'cleaning';
    let displayService = 'Room Cleaning';

    if (rawType.includes('towel') || rawType.includes('linen') || rawType.includes('sheet') || rawType.includes('pillow')) {
      normalizedType = 'towels';
      displayService = 'Fresh Towels & Linens';
    } else if (rawType.includes('maintenance') || rawType.includes('fix') || rawType.includes('repair') || rawType.includes('plumb') || rawType.includes('ac')) {
      normalizedType = 'maintenance';
      displayService = 'Maintenance Support';
    } else if (rawType.includes('food') || rawType.includes('dine') || rawType.includes('dining') || rawType.includes('meal') || rawType.includes('breakfast')) {
      normalizedType = 'dining';
      displayService = 'In-Room Dining';
    } else if (rawType.includes('housekeep') || rawType.includes('clean')) {
      normalizedType = 'cleaning';
      displayService = 'Room Cleaning';
    } else {
      normalizedType = 'room_service';
      displayService = 'Room Service';
    }

    const details = params.details || `Guest requested ${displayService} via AI Concierge chatbot.`;

    // 5. Create service request record
    const serviceRequest = new ServiceRequestModel({
      organizationId: orgId,
      businessId: new Types.ObjectId(hotelId),
      bookingId: bRecord?._id || (booking?.bookingId && Types.ObjectId.isValid(booking.bookingId) ? new Types.ObjectId(booking.bookingId) : undefined),
      guestId: bRecord?.guestId,
      guestName: finalGuestName,
      roomNumber: finalRoomNumber,
      roomName: finalRoomName,
      serviceType: normalizedType,
      details,
      status: 'scheduled',
      priority: params.priority || (normalizedType === 'maintenance' ? 'high' : 'normal'),
      requestedTime: params.requestedTime || 'ASAP'
    });

    await serviceRequest.save();

    const shortId = serviceRequest._id.toString().slice(-6).toUpperCase();
    const requestId = `SR-${shortId}`;

    return {
      requestId,
      bookingId: finalBookingCode,
      roomNumber: finalRoomNumber,
      roomName: finalRoomName,
      guestName: finalGuestName,
      serviceType: displayService,
      status: 'Scheduled',
      details,
      estimatedArrival: 'Within 20–35 minutes',
      createdAt: serviceRequest.createdAt.toISOString()
    };
  }

  /**
   * Retrieve active service requests for a booking or hotel.
   */
  public async getServiceRequests(hotelId: string, bookingId?: string) {
    if (!hotelId || !Types.ObjectId.isValid(hotelId)) {
      return [];
    }
    const query: any = { businessId: new Types.ObjectId(hotelId) };
    if (bookingId && Types.ObjectId.isValid(bookingId)) {
      query.bookingId = new Types.ObjectId(bookingId);
    }
    return ServiceRequestModel.find(query).sort({ createdAt: -1 }).limit(100).exec();
  }

  /**
   * Update status of a service request (e.g. scheduled, in_progress, completed, cancelled)
   */
  public async updateServiceRequestStatus(requestId: string, status: string, notes?: string) {
    const query = Types.ObjectId.isValid(requestId) ? { _id: new Types.ObjectId(requestId) } : { _id: requestId };
    const update: any = { status };
    if (notes) {
      update.details = notes;
    }
    return ServiceRequestModel.findOneAndUpdate(query, update, { new: true }).exec();
  }
}

export const serviceRequestService = new ServiceRequestService();
export default serviceRequestService;

