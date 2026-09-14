import { Types } from 'mongoose';
import { BookingModel } from '../modules/bookings/models/BookingModel';
import { RoomTypeModel } from '../modules/rooms/models/RoomTypeModel';
import { RoomModel } from '../modules/rooms/models/RoomModel';
import { GuestModel } from '../modules/guests/models/GuestModel';
import { BusinessModel } from '../modules/businesses/models/BusinessModel';
import { roomService } from './roomService';
import { BadRequestError } from '../core/errors/BadRequestError';
import { NotFoundError } from '../core/errors/NotFoundError';
import { ConflictError } from '../core/errors/ConflictError';

export interface CreateBookingParams {
  hotelId: string;
  organizationId?: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guest: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface BookingResponse {
  bookingId: string;
  confirmationCode: string;
  hotelId: string;
  hotelName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  numberOfGuests: number;
  pricing: {
    pricePerNight: number;
    subtotal: number;
    tax: number;
    total: number;
    currency: string;
  };
  guest: {
    name: string;
    email: string;
    phone: string;
  };
  bookingStatus: string;
  paymentStatus: string;
  cancellationPolicy: string;
}

export class BookingService {
  /**
   * Create a hotel booking with strict backend validation, pricing, and double-booking prevention.
   */
  public async createBooking(params: CreateBookingParams): Promise<BookingResponse> {
    const { hotelId, roomId, checkIn, checkOut, guest } = params;
    const guests = params.guests && params.guests > 0 ? Number(params.guests) : 1;

    if (!Types.ObjectId.isValid(hotelId)) {
      throw new BadRequestError('Invalid hotel identifier');
    }
    if (!roomId || !Types.ObjectId.isValid(roomId)) {
      throw new BadRequestError('Invalid room identifier');
    }
    if (!guest || !guest.name || !guest.email || !guest.phone) {
      throw new BadRequestError('Guest name, email, and phone number are all required for booking');
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      throw new BadRequestError('Invalid check-in or check-out date format');
    }
    if (checkInDate >= checkOutDate) {
      throw new BadRequestError('Check-in date must be strictly before check-out date');
    }

    // 1. Resolve hotel business record for organizationId and metadata
    const hotel = await BusinessModel.findOne({
      _id: new Types.ObjectId(hotelId),
      status: 'ACTIVE'
    }).exec();

    if (!hotel) {
      throw new NotFoundError('Hotel property not found or inactive');
    }
    const organizationId = hotel.organizationId;

    // 2. Verify room category belongs to this hotel
    let roomType = await RoomTypeModel.findOne({
      _id: new Types.ObjectId(roomId),
      businessId: new Types.ObjectId(hotelId)
    }).exec();

    if (!roomType) {
      // Check if roomId is a physical room
      const physical = await RoomModel.findOne({
        _id: new Types.ObjectId(roomId),
        businessId: new Types.ObjectId(hotelId)
      }).exec();

      if (physical) {
        roomType = await RoomTypeModel.findOne({
          _id: physical.roomTypeId,
          businessId: new Types.ObjectId(hotelId)
        }).exec();
      }
    }

    if (!roomType) {
      throw new NotFoundError('Selected room category does not exist at this hotel');
    }

    if (roomType.capacity < guests) {
      throw new BadRequestError(`This room accommodates up to ${roomType.capacity} guests, but ${guests} were requested`);
    }

    // 3. Allocate physical room and prevent double booking
    const allocatedRoomId = await roomService.allocatePhysicalRoom(
      hotelId,
      roomType._id.toString(),
      checkInDate,
      checkOutDate
    );

    if (!allocatedRoomId) {
      throw new ConflictError(`No ${roomType.name} rooms are available for the dates ${checkIn} to ${checkOut}`);
    }

    // 4. Calculate pricing on backend (Never trust LLM for pricing)
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const subtotal = roomType.pricePerNight * nights;
    const tax = Math.round(subtotal * 0.12); // Standard 12% hospitality tax
    const total = subtotal + tax;

    // 5. Resolve or create Guest
    const [firstName, ...rest] = guest.name.trim().split(' ');
    const lastName = rest.join(' ') || 'Guest';

    let guestDoc = await GuestModel.findOne({
      organizationId,
      email: guest.email.trim().toLowerCase()
    }).exec();

    if (!guestDoc) {
      guestDoc = new GuestModel({
        organizationId,
        businessId: new Types.ObjectId(hotelId),
        firstName,
        lastName,
        email: guest.email.trim().toLowerCase(),
        phone: guest.phone.trim(),
        country: 'India',
        totalBookings: 0,
        totalSpent: 0
      });
      await guestDoc.save();
    }

    // 6. Create Booking in database
    const booking = new BookingModel({
      organizationId,
      businessId: new Types.ObjectId(hotelId),
      guestId: guestDoc._id,
      roomId: new Types.ObjectId(allocatedRoomId),
      roomTypeId: roomType._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      numberOfGuests: guests,
      pricing: {
        subtotal,
        discount: 0,
        tax,
        total
      },
      paymentStatus: 'PENDING',
      bookingStatus: 'CONFIRMED',
      source: 'AI',
      notes: `Booked via StayOS AI Concierge for ${guest.name}`
    });

    await booking.save();

    // Update guest stats
    await GuestModel.findByIdAndUpdate(guestDoc._id, {
      $inc: { totalBookings: 1, totalSpent: total },
      $set: { lastVisit: checkInDate }
    }).exec();

    const shortId = booking._id.toString().slice(-6).toUpperCase();
    const confirmationCode = `STY-${shortId}`;

    return {
      bookingId: booking._id.toString(),
      confirmationCode,
      hotelId,
      hotelName: hotel.name,
      roomName: roomType.name,
      checkIn,
      checkOut,
      nights,
      numberOfGuests: guests,
      pricing: {
        pricePerNight: roomType.pricePerNight,
        subtotal,
        tax,
        total,
        currency: hotel.currency || 'INR'
      },
      guest: {
        name: `${guestDoc.firstName} ${guestDoc.lastName}`.trim(),
        email: guestDoc.email,
        phone: guestDoc.phone
      },
      bookingStatus: booking.bookingStatus,
      paymentStatus: booking.paymentStatus,
      cancellationPolicy: hotel.cancellationPolicy || 'Free cancellation up to 24 hours prior to check-in.'
    };
  }

  /**
   * Retrieve booking with multi-tenant scoping and guest verification.
   */
  public async getBooking(params: {
    hotelId: string;
    bookingId: string;
    email?: string;
    phone?: string;
  }): Promise<BookingResponse> {
    const { hotelId, bookingId, email, phone } = params;

    if (!Types.ObjectId.isValid(hotelId)) {
      throw new BadRequestError('Invalid hotel identifier');
    }

    let bookingQuery: any = {
      businessId: new Types.ObjectId(hotelId)
    };

    if (Types.ObjectId.isValid(bookingId)) {
      bookingQuery._id = new Types.ObjectId(bookingId);
    } else {
      // Handle STY-XXXXXX format or mongo ID
      const cleaned = bookingId.replace(/^STY-/, '');
      if (cleaned.length === 6) {
        // Find matching by regex of the trailing ID
        const match = await BookingModel.findOne({
          businessId: new Types.ObjectId(hotelId),
          _id: { $regex: new RegExp(`${cleaned}$`, 'i') }
        }).exec();
        if (match) {
          bookingQuery._id = match._id;
        } else {
          throw new NotFoundError(`Booking '${bookingId}' not found at this hotel`);
        }
      } else {
        throw new BadRequestError('Invalid booking ID format');
      }
    }

    const booking = await BookingModel.findOne(bookingQuery)
      .populate('guestId')
      .populate('roomTypeId')
      .populate('businessId')
      .exec();

    if (!booking) {
      throw new NotFoundError(`Booking '${bookingId}' not found at this hotel`);
    }

    const guestDoc: any = booking.guestId;
    const roomType: any = booking.roomTypeId;
    const hotel: any = booking.businessId;

    // Verify guest identity if provided
    if (email && guestDoc?.email && guestDoc.email.toLowerCase() !== email.trim().toLowerCase()) {
      throw new BadRequestError('The provided email does not match the booking record');
    }
    if (phone && guestDoc?.phone && !guestDoc.phone.includes(phone.trim().replace(/\D/g, ''))) {
      throw new BadRequestError('The provided phone number does not match the booking record');
    }

    const diffTime = new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime();
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const shortId = booking._id.toString().slice(-6).toUpperCase();

    return {
      bookingId: booking._id.toString(),
      confirmationCode: `STY-${shortId}`,
      hotelId: hotel?._id?.toString() || hotelId,
      hotelName: hotel?.name || 'Hotel Property',
      roomName: roomType?.name || 'Standard Room',
      checkIn: booking.checkIn.toISOString().split('T')[0],
      checkOut: booking.checkOut.toISOString().split('T')[0],
      nights,
      numberOfGuests: booking.numberOfGuests,
      pricing: {
        pricePerNight: roomType?.pricePerNight || Math.round(booking.pricing.total / nights),
        subtotal: booking.pricing.subtotal,
        tax: booking.pricing.tax,
        total: booking.pricing.total,
        currency: hotel?.currency || 'INR'
      },
      guest: {
        name: guestDoc ? `${guestDoc.firstName} ${guestDoc.lastName}`.trim() : 'Guest',
        email: guestDoc?.email || '',
        phone: guestDoc?.phone || ''
      },
      bookingStatus: booking.bookingStatus,
      paymentStatus: booking.paymentStatus,
      cancellationPolicy: hotel?.cancellationPolicy || 'Standard hotel cancellation policy applies.'
    };
  }

  /**
   * Cancel booking with tenant scoping, guest verification, and policy enforcement.
   */
  public async cancelBooking(params: {
    hotelId: string;
    bookingId: string;
    email?: string;
    phone?: string;
    reason?: string;
  }): Promise<{
    success: boolean;
    bookingId: string;
    bookingStatus: string;
    refundStatus: string;
    policyMessage: string;
  }> {
    const { hotelId, bookingId, email, phone } = params;

    const booking = await this.getBooking({ hotelId, bookingId, email, phone });

    if (booking.bookingStatus === 'CANCELLED') {
      return {
        success: true,
        bookingId: booking.bookingId,
        bookingStatus: 'CANCELLED',
        refundStatus: 'ALREADY_CANCELLED',
        policyMessage: 'This booking was already cancelled.'
      };
    }

    if (booking.bookingStatus === 'CHECKED_IN' || booking.bookingStatus === 'CHECKED_OUT') {
      throw new ConflictError(`Cannot cancel a booking that has status: ${booking.bookingStatus}`);
    }

    // Enforce hotel cancellation policy check
    const checkInDate = new Date(booking.checkIn);
    const now = new Date();
    const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    let refundStatus = 'FULL_REFUND_APPLICABLE';
    let policyMessage = 'Booking cancelled successfully with full refund according to hotel policy.';

    if (hoursUntilCheckIn < 24) {
      refundStatus = 'PARTIAL_OR_NO_REFUND';
      policyMessage = 'Booking cancelled within 24 hours of check-in. Late cancellation fee applies per policy.';
    }

    // Update booking in DB
    await BookingModel.findByIdAndUpdate(new Types.ObjectId(booking.bookingId), {
      $set: {
        bookingStatus: 'CANCELLED',
        notes: `Cancelled via AI concierge on ${now.toISOString()}. Reason: ${params.reason || 'Guest requested'}`
      }
    }).exec();

    return {
      success: true,
      bookingId: booking.bookingId,
      bookingStatus: 'CANCELLED',
      refundStatus,
      policyMessage
    };
  }
}

export const bookingService = new BookingService();
export default bookingService;
