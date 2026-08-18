import { Types } from 'mongoose';
import { IBookingRepository } from './IBookingRepository';
import { BookingModel, IBooking, IBookingDocument } from '../models/BookingModel';

export class MongoBookingRepository implements IBookingRepository {
  public async create(booking: Partial<IBooking>): Promise<IBookingDocument> {
    const newBooking = new BookingModel(booking);
    return newBooking.save();
  }

  public async findById(organizationId: string, id: string): Promise<IBookingDocument | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(organizationId)) return null;
    return BookingModel.findOne({
      _id: new Types.ObjectId(id),
      organizationId: new Types.ObjectId(organizationId)
    })
      .populate('guestId')
      .populate('roomId')
      .populate('roomTypeId')
      .exec();
  }

  public async findMany(organizationId: string, filter?: Record<string, any>): Promise<IBookingDocument[]> {
    if (!Types.ObjectId.isValid(organizationId)) return [];
    return BookingModel.find({
      ...filter,
      organizationId: new Types.ObjectId(organizationId)
    })
      .populate('guestId')
      .populate('roomId')
      .populate('roomTypeId')
      .sort({ createdAt: -1 })
      .exec();
  }

  public async update(
    organizationId: string,
    id: string,
    data: Partial<IBooking>
  ): Promise<IBookingDocument | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(organizationId)) return null;
    return BookingModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        organizationId: new Types.ObjectId(organizationId)
      },
      data,
      { new: true }
    ).exec();
  }

  public async delete(organizationId: string, id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(organizationId)) return false;
    const result = await BookingModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      organizationId: new Types.ObjectId(organizationId)
    }).exec();
    return result !== null;
  }

  public async findConflictingBookings(
    roomId: string,
    checkIn: Date,
    checkOut: Date,
    excludeBookingId?: string
  ): Promise<IBookingDocument[]> {
    if (!Types.ObjectId.isValid(roomId)) return [];

    const query: any = {
      roomId: new Types.ObjectId(roomId),
      bookingStatus: { $in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
      checkIn: { $lt: checkOut },
      checkOut: { $gt: checkIn }
    };

    if (excludeBookingId && Types.ObjectId.isValid(excludeBookingId)) {
      query._id = { $ne: new Types.ObjectId(excludeBookingId) };
    }

    return BookingModel.find(query).exec();
  }
}
export default MongoBookingRepository;
