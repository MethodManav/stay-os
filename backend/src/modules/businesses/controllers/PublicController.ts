import { Request, Response, NextFunction } from 'express';
import { BusinessService } from '../services/BusinessService';
import { WebsiteService } from '../../websites/services/WebsiteService';
import { RoomService } from '../../rooms/services/RoomService';
import { BookingService } from '../../bookings/services/BookingService';
import { IRoomRepository } from '../../rooms/repositories/IRoomRepository';
import { IBookingRepository } from '../../bookings/repositories/IBookingRepository';
import { BadRequestError } from '../../../core/errors/BadRequestError';
import { ConflictError } from '../../../core/errors/ConflictError';

export class PublicController {
  constructor(
    private readonly businessService: BusinessService,
    private readonly websiteService: WebsiteService,
    private readonly roomService: RoomService,
    private readonly bookingService: BookingService,
    private readonly roomRepository: IRoomRepository,
    private readonly bookingRepository: IBookingRepository
  ) {}

  public getBusinessBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const business = await this.businessService.getBusinessBySlug(slug);

      // Find website for this business
      let website: any = null;
      try {
        website = await this.websiteService.getWebsiteByBusiness(
          business.organizationId.toString(),
          business.id
        );
      } catch (err) {
        // Ignore if website is not yet configured for this business
      }

      // Sanitize business profile details (omit organizationId, wifiPassword, etc.)
      const sanitizedBusiness = {
        name: business.name,
        type: business.type,
        description: business.description,
        email: business.email,
        phone: business.phone,
        address: business.address,
        city: business.city,
        state: business.state,
        country: business.country,
        currency: business.currency,
        timezone: business.timezone,
        checkInTime: business.checkInTime,
        checkOutTime: business.checkOutTime,
        amenities: business.amenities,
        logo: business.logo,
        images: business.images
      };

      const sanitizedWebsite = website ? {
        templateId: website.templateId,
        theme: website.theme,
        sections: website.sections.filter((s: any) => s.visible),
        published: website.published
      } : null;

      res.status(200).json({
        success: true,
        data: {
          business: sanitizedBusiness,
          website: sanitizedWebsite
        }
      });
    } catch (error) {
      next(error);
    }
  };

  public getRoomTypes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const business = await this.businessService.getBusinessBySlug(slug);
      
      const roomTypes = await this.roomService.getRoomTypes(business.organizationId.toString(), {
        businessId: business.id
      });

      // Return only public room type fields
      const sanitized = roomTypes.map(rt => ({
        id: rt.id,
        name: rt.name,
        description: rt.description,
        capacity: rt.capacity,
        pricePerNight: rt.pricePerNight,
        amenities: rt.amenities,
        images: rt.images
      }));

      res.status(200).json({
        success: true,
        data: sanitized
      });
    } catch (error) {
      next(error);
    }
  };

  public checkAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const { checkIn, checkOut } = req.query as { checkIn: string; checkOut: string };

      if (!checkIn || !checkOut) {
        throw new BadRequestError('checkIn and checkOut query parameters are required');
      }

      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        throw new BadRequestError('Invalid checkIn or checkOut date format');
      }

      if (checkInDate >= checkOutDate) {
        throw new BadRequestError('checkIn date must be strictly before checkOut date');
      }

      const business = await this.businessService.getBusinessBySlug(slug);
      const orgId = business.organizationId.toString();

      // Retrieve all room types & all available physical rooms
      const roomTypes = await this.roomService.getRoomTypes(orgId, { businessId: business.id });
      const rooms = await this.roomRepository.findMany(orgId, { businessId: business.id, status: 'available' });

      // Map room availability counts
      const counts: Record<string, number> = {};
      for (const room of rooms) {
        const conflicts = await this.bookingRepository.findConflictingBookings(
          room.id,
          checkInDate,
          checkOutDate
        );
        if (conflicts.length === 0) {
          const typeId = room.roomTypeId.toString();
          counts[typeId] = (counts[typeId] || 0) + 1;
        }
      }

      const availableRoomTypes = roomTypes
        .map(rt => ({
          id: rt.id,
          name: rt.name,
          description: rt.description,
          capacity: rt.capacity,
          pricePerNight: rt.pricePerNight,
          amenities: rt.amenities,
          images: rt.images,
          availableCount: counts[rt.id] || 0
        }))
        .filter(rt => rt.availableCount > 0);

      res.status(200).json({
        success: true,
        data: availableRoomTypes
      });
    } catch (error) {
      next(error);
    }
  };

  public createBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const { checkIn, checkOut, numberOfGuests, roomTypeId, guestDetails } = req.body;

      if (!roomTypeId || !guestDetails) {
        throw new BadRequestError('roomTypeId and guestDetails are required');
      }

      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      const business = await this.businessService.getBusinessBySlug(slug);
      const orgId = business.organizationId.toString();

      // Find physical rooms of this room type
      const rooms = await this.roomRepository.findMany(orgId, {
        businessId: business.id,
        roomTypeId,
        status: 'available'
      });

      let selectedRoomId: string | null = null;
      for (const room of rooms) {
        const conflicts = await this.bookingRepository.findConflictingBookings(
          room.id,
          checkInDate,
          checkOutDate
        );
        if (conflicts.length === 0) {
          selectedRoomId = room.id;
          break;
        }
      }

      if (!selectedRoomId) {
        throw new ConflictError('No rooms of this category are available for the selected dates');
      }

      const booking = await this.bookingService.createBooking(orgId, business.id, {
        guestDetails,
        roomId: selectedRoomId,
        checkIn,
        checkOut,
        numberOfGuests,
        source: 'WEBSITE'
      });

      // Sanitize Booking payload response
      const sanitized = {
        bookingId: booking.id,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        numberOfGuests: booking.numberOfGuests,
        pricing: booking.pricing,
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus
      };

      res.status(201).json({
        success: true,
        data: sanitized,
        message: 'Room booked successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
export default PublicController;
