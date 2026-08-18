import { IBookingRepository } from '../repositories/IBookingRepository';
import { IRoomRepository } from '../../rooms/repositories/IRoomRepository';
import { IRoomTypeRepository } from '../../rooms/repositories/IRoomTypeRepository';
import { IGuestRepository } from '../../guests/repositories/IGuestRepository';
import { IBooking, IBookingDocument } from '../models/BookingModel';
import { BadRequestError } from '../../../core/errors/BadRequestError';
import { NotFoundError } from '../../../core/errors/NotFoundError';
import { ConflictError } from '../../../core/errors/ConflictError';

export class BookingService {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly roomTypeRepository: IRoomTypeRepository,
    private readonly guestRepository: IGuestRepository
  ) {}

  public async createBooking(
    organizationId: string,
    businessId: string,
    data: {
      guestId?: string;
      guestDetails?: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        country?: string;
      };
      roomId: string;
      checkIn: string;
      checkOut: string;
      numberOfGuests: number;
      pricing?: {
        discount?: number;
        tax?: number;
      };
      notes?: string;
      source?: 'DASHBOARD' | 'WEBSITE' | 'AI';
    }
  ): Promise<IBookingDocument> {
    const checkInDate = new Date(data.checkIn);
    const checkOutDate = new Date(data.checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      throw new BadRequestError('Invalid check-in or check-out date format');
    }

    if (checkInDate >= checkOutDate) {
      throw new BadRequestError('Check-in date must be strictly before check-out date');
    }

    // 1. Resolve room & check status
    const room = await this.roomRepository.findById(organizationId, data.roomId);
    if (!room || room.businessId.toString() !== businessId) {
      throw new NotFoundError('Selected room does not exist at this property');
    }

    if (room.status === 'maintenance') {
      throw new ConflictError('Selected room is currently blocked for maintenance');
    }

    // 2. Prevent double booking (Check for active overlapping bookings)
    const conflicts = await this.bookingRepository.findConflictingBookings(
      data.roomId,
      checkInDate,
      checkOutDate
    );
    if (conflicts.length > 0) {
      throw new ConflictError('The selected room is already booked for this date range');
    }

    // 3. Resolve Guest context
    let guestId: string = data.guestId || '';
    if (!guestId) {
      if (!data.guestDetails) {
        throw new BadRequestError('Either guestId or guestDetails must be provided to complete the booking');
      }

      // Check if guest already exists by email
      let guest = await this.guestRepository.findByEmail(organizationId, data.guestDetails.email);
      if (!guest) {
        guest = await this.guestRepository.create({
          ...data.guestDetails,
          organizationId: organizationId as any,
          businessId: businessId as any,
          tags: [],
          totalBookings: 0,
          totalSpent: 0
        });
      }
      guestId = guest.id;
    } else {
      const guestExists = await this.guestRepository.findById(organizationId, guestId);
      if (!guestExists) {
        throw new NotFoundError('The selected guest profile was not found');
      }
    }

    // 4. Resolve room type details & calculate total price
    const roomType = await this.roomTypeRepository.findById(organizationId, room.roomTypeId.toString());
    if (!roomType) {
      throw new NotFoundError('Associated room type structure not found');
    }

    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    
    const subtotal = roomType.pricePerNight * nights;
    const discount = data.pricing?.discount || 0;
    const tax = data.pricing?.tax || Math.round(subtotal * 0.12); // Default 12% tax
    const total = Math.max(0, subtotal - discount + tax);

    // 5. Persist the Booking document
    const booking = await this.bookingRepository.create({
      organizationId: organizationId as any,
      businessId: businessId as any,
      guestId: guestId as any,
      roomId: room.id as any,
      roomTypeId: roomType.id as any,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      numberOfGuests: data.numberOfGuests,
      pricing: { subtotal, discount, tax, total },
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'PENDING',
      source: data.source || 'DASHBOARD',
      notes: data.notes
    });

    // 6. Update Guest CRM statistics
    await this.guestRepository.update(organizationId, guestId, {
      $inc: { totalBookings: 1, totalSpent: total },
      $set: { lastVisit: checkInDate }
    } as any);

    return booking;
  }

  public async checkIn(organizationId: string, id: string): Promise<IBookingDocument> {
    const booking = await this.bookingRepository.findById(organizationId, id);
    if (!booking) {
      throw new NotFoundError('Booking record not found');
    }

    if (booking.bookingStatus !== 'CONFIRMED' && booking.bookingStatus !== 'PENDING') {
      throw new ConflictError(`Cannot check in booking with status: ${booking.bookingStatus}`);
    }

    const updated = await this.bookingRepository.update(organizationId, id, { bookingStatus: 'CHECKED_IN' });
    await this.roomRepository.update(organizationId, booking.roomId.toString(), { status: 'occupied' });

    return updated!;
  }

  public async checkOut(organizationId: string, id: string): Promise<IBookingDocument> {
    const booking = await this.bookingRepository.findById(organizationId, id);
    if (!booking) {
      throw new NotFoundError('Booking record not found');
    }

    if (booking.bookingStatus !== 'CHECKED_IN') {
      throw new ConflictError(`Cannot check out booking with status: ${booking.bookingStatus}`);
    }

    const updated = await this.bookingRepository.update(organizationId, id, {
      bookingStatus: 'CHECKED_OUT',
      paymentStatus: 'PAID'
    });
    
    await this.roomRepository.update(organizationId, booking.roomId.toString(), { status: 'available' });

    return updated!;
  }

  public async cancel(organizationId: string, id: string): Promise<IBookingDocument> {
    const booking = await this.bookingRepository.findById(organizationId, id);
    if (!booking) {
      throw new NotFoundError('Booking record not found');
    }

    if (booking.bookingStatus === 'CANCELLED' || booking.bookingStatus === 'CHECKED_OUT') {
      throw new ConflictError(`Booking is already finalized with status: ${booking.bookingStatus}`);
    }

    const updated = await this.bookingRepository.update(organizationId, id, { bookingStatus: 'CANCELLED' });
    await this.roomRepository.update(organizationId, booking.roomId.toString(), { status: 'available' });

    // Deduct bookings stats from Guest profile
    await this.guestRepository.update(organizationId, booking.guestId.toString(), {
      $inc: { totalBookings: -1, totalSpent: -booking.pricing.total }
    } as any);

    return updated!;
  }

  public async getBookings(organizationId: string, filter?: Record<string, any>): Promise<IBookingDocument[]> {
    return this.bookingRepository.findMany(organizationId, filter);
  }

  public async getBookingById(organizationId: string, id: string): Promise<IBookingDocument> {
    const booking = await this.bookingRepository.findById(organizationId, id);
    if (!booking) {
      throw new NotFoundError('Booking record not found');
    }
    return booking;
  }

  public async updateBooking(
    organizationId: string,
    id: string,
    data: Partial<IBooking>
  ): Promise<IBookingDocument> {
    const booking = await this.bookingRepository.findById(organizationId, id);
    if (!booking) {
      throw new NotFoundError('Booking record not found');
    }

    const updated = await this.bookingRepository.update(organizationId, id, data);
    if (!updated) {
      throw new NotFoundError('Booking record could not be updated');
    }
    return updated;
  }

  public async deleteBooking(organizationId: string, id: string): Promise<void> {
    const success = await this.bookingRepository.delete(organizationId, id);
    if (!success) {
      throw new NotFoundError('Booking record not found');
    }
  }
}
export default BookingService;
