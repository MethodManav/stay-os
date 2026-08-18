import { IBooking, IBookingDocument } from '../models/BookingModel';

export interface IBookingRepository {
  create(booking: Partial<IBooking>): Promise<IBookingDocument>;
  findById(organizationId: string, id: string): Promise<IBookingDocument | null>;
  findMany(organizationId: string, filter?: Record<string, any>): Promise<IBookingDocument[]>;
  update(organizationId: string, id: string, data: Partial<IBooking>): Promise<IBookingDocument | null>;
  delete(organizationId: string, id: string): Promise<boolean>;
  findConflictingBookings(
    roomId: string,
    checkIn: Date,
    checkOut: Date,
    excludeBookingId?: string
  ): Promise<IBookingDocument[]>;
}
