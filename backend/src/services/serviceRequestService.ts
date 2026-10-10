import { Types } from 'mongoose';
import { ServiceRequestModel, ServiceType } from '../modules/bookings/models/ServiceRequestModel';
import { BookingModel } from '../modules/bookings/models/BookingModel';
import { RoomModel } from '../modules/rooms/models/RoomModel';
import { bookingService } from './bookingService';
import { BadRequestError } from '../core/errors/BadRequestError';
import { NotFoundError } from '../core/errors/NotFoundError';

export interface CreateServiceRequestParams {
  hotelId: string;
  organizationId?: string;
  bookingId?: string;
  email?: string;
  phone?: string;
  roomNumber?: string;
  serviceType?: string;
  details?: string;
  requestedTime?: string;
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
   * Schedule or dispatch a room service / housekeeping request for a verified staying guest.
   */
  public async createServiceRequest(params: CreateServiceRequestParams): Promise<ServiceRequestResponse> {
    const { hotelId, bookingId, email, phone, roomNumber } = params;

    if (!Types.ObjectId.isValid(hotelId)) {
      throw new BadRequestError('Invalid hotel identifier');
    }

    if (!bookingId && !email && !phone && !roomNumber) {
      throw new BadRequestError('Please provide a booking confirmation ID, registered email/phone, or room number to request room service.');
    }

    // 1. Verify active booking for this hotel
    let booking;
    try {
      booking = await bookingService.getBooking({
        hotelId,
        bookingId,
        email,
        phone
      });
    } catch (err: any) {
      // If roomNumber was provided but no booking ID, try to find current booking for that room
      if (roomNumber && !bookingId) {
        const physicalRoom = await RoomModel.findOne({
          businessId: new Types.ObjectId(hotelId),
          roomNumber: roomNumber.trim()
        }).exec();

        if (physicalRoom) {
          const now = new Date();
          const activeBooking = await BookingModel.findOne({
            businessId: new Types.ObjectId(hotelId),
            roomId: physicalRoom._id,
            bookingStatus: { $in: ['CONFIRMED', 'CHECKED_IN'] },
            checkIn: { $lte: now },
            checkOut: { $gte: now }
          }).sort({ createdAt: -1 }).populate('guestId').populate('roomTypeId').exec();

          if (activeBooking) {
            booking = await bookingService.getBooking({
              hotelId,
              bookingId: activeBooking._id.toString()
            });
          }
        }
      }

      if (!booking) {
        throw new NotFoundError(
          err.message || 'No confirmed reservation found matching your details. Room service is reserved for staying guests.'
        );
      }
    }

    // 2. Validate booking status
    if (booking.bookingStatus === 'CANCELLED') {
      throw new BadRequestError('Cannot request room service for a cancelled reservation.');
    }
    if (booking.bookingStatus === 'CHECKED_OUT') {
      throw new BadRequestError('Cannot request room service for a reservation that has already checked out.');
    }

    // 3. Resolve room number
    let finalRoomNumber: string = roomNumber || booking.roomNumber || '';
    if (!finalRoomNumber) {
      // Look up booking document for physical room
      const bDoc = await BookingModel.findById(new Types.ObjectId(booking.bookingId)).populate('roomId').exec();
      const rDoc: any = bDoc?.roomId;
      finalRoomNumber = rDoc?.roomNumber || `Room for ${booking.roomName}`;
    }

    // 4. Normalize service type
    const rawType = (params.serviceType || 'cleaning').toLowerCase();
    let normalizedType: ServiceType = 'cleaning';
    let displayService = 'Room Cleaning';

    if (rawType.includes('towel') || rawType.includes('linen') || rawType.includes('sheet') || rawType.includes('pillow')) {
      normalizedType = 'towels';
      displayService = 'Fresh Towels & Linens';
    } else if (rawType.includes('maintenance') || rawType.includes('fix') || rawType.includes('repair') || rawType.includes('plumb')) {
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
    const bRecord = await BookingModel.findById(new Types.ObjectId(booking.bookingId)).exec();
    const serviceRequest = new ServiceRequestModel({
      organizationId: bRecord?.organizationId || new Types.ObjectId(),
      businessId: new Types.ObjectId(hotelId),
      bookingId: new Types.ObjectId(booking.bookingId),
      guestId: bRecord?.guestId,
      roomNumber: finalRoomNumber,
      roomName: booking.roomName,
      serviceType: normalizedType,
      details,
      status: 'scheduled',
      priority: 'normal',
      requestedTime: params.requestedTime || 'ASAP'
    });

    await serviceRequest.save();

    const shortId = serviceRequest._id.toString().slice(-6).toUpperCase();
    const requestId = `SR-${shortId}`;

    return {
      requestId,
      bookingId: booking.confirmationCode,
      roomNumber: finalRoomNumber,
      roomName: booking.roomName,
      guestName: booking.guest.name,
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
    const query: any = { businessId: new Types.ObjectId(hotelId) };
    if (bookingId) {
      if (Types.ObjectId.isValid(bookingId)) {
        query.bookingId = new Types.ObjectId(bookingId);
      }
    }
    return ServiceRequestModel.find(query).sort({ createdAt: -1 }).limit(10).exec();
  }
}

export const serviceRequestService = new ServiceRequestService();
export default serviceRequestService;
