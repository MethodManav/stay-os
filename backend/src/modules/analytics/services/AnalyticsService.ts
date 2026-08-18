import { Types } from 'mongoose';
import { IBookingRepository } from '../../bookings/repositories/IBookingRepository';
import { IRoomRepository } from '../../rooms/repositories/IRoomRepository';
import { EventLogModel } from '../models/EventLogModel';

export class AnalyticsService {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly roomRepository: IRoomRepository
  ) {}

  public async trackEvent(
    organizationId: string,
    businessId: string,
    eventType: 'WEBSITE_VISIT' | 'AI_CONVERSATION' | 'BOOKING_CREATED' | 'BOOKING_COMPLETED' | 'PAYMENT_RECEIVED',
    metadata?: Record<string, any>
  ): Promise<void> {
    const log = new EventLogModel({
      organizationId: new Types.ObjectId(organizationId),
      businessId: new Types.ObjectId(businessId),
      eventType,
      metadata,
      timestamp: new Date()
    });
    await log.save();
  }

  public async getMetrics(
    organizationId: string,
    businessId: string,
    startDateStr: string,
    endDateStr: string
  ) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    // Calculate duration in days (minimum 1 day)
    const diffDays = Math.ceil(Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;

    // 1. Calculate capacity: Total Room Nights Available
    const rooms = await this.roomRepository.findMany(organizationId, { businessId });
    const totalRooms = rooms.length;
    const totalRoomNightsAvailable = totalRooms * diffDays;

    // 2. Fetch bookings overlapping this period
    const bookings = await this.bookingRepository.findMany(organizationId, {
      businessId,
      bookingStatus: { $in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] },
      checkIn: { $lt: endDate },
      checkOut: { $gt: startDate }
    });

    // 3. Calculate occupied room-nights & revenue
    let roomNightsBooked = 0;
    let totalRevenue = 0;

    for (const booking of bookings) {
      // Find overlap boundaries
      const overlapStart = booking.checkIn > startDate ? booking.checkIn : startDate;
      const overlapEnd = booking.checkOut < endDate ? booking.checkOut : endDate;
      const overlapDays = Math.ceil(Math.abs(overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) || 1;

      roomNightsBooked += overlapDays;
      totalRevenue += booking.pricing.total;
    }

    const occupancyRate = totalRoomNightsAvailable > 0
      ? parseFloat(((roomNightsBooked / totalRoomNightsAvailable) * 100).toFixed(2))
      : 0;

    const abv = bookings.length > 0
      ? parseFloat((totalRevenue / bookings.length).toFixed(2))
      : 0;

    // 4. Retrieve event logs in the period for conversion computations
    const logs = await EventLogModel.find({
      organizationId: new Types.ObjectId(organizationId),
      businessId: new Types.ObjectId(businessId),
      timestamp: { $gte: startDate, $lte: endDate }
    }).exec();

    const visitsCount = logs.filter(l => l.eventType === 'WEBSITE_VISIT').length;
    const aiConvsCount = logs.filter(l => l.eventType === 'AI_CONVERSATION').length;
    const webBookingsCount = bookings.filter(b => b.source === 'WEBSITE').length;
    const aiBookingsCount = bookings.filter(b => b.source === 'AI').length;

    const websiteConversionRate = visitsCount > 0
      ? parseFloat(((webBookingsCount / visitsCount) * 100).toFixed(2))
      : 0;

    const aiConversionRate = aiConvsCount > 0
      ? parseFloat(((aiBookingsCount / aiConvsCount) * 100).toFixed(2))
      : 0;

    return {
      occupancyRate,
      totalRevenue,
      averageBookingValue: abv,
      totalBookings: bookings.length,
      conversionRates: {
        website: websiteConversionRate,
        ai: aiConversionRate
      },
      traffic: {
        websiteVisits: visitsCount,
        aiConversations: aiConvsCount
      }
    };
  }
}
export default AnalyticsService;
