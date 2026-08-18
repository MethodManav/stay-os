import { Request, Response, NextFunction } from 'express';
import { BookingService } from '../services/BookingService';

export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const businessId = req.businessId!;
      const booking = await this.bookingService.createBooking(orgId, businessId, req.body);
      
      res.status(201).json({
        success: true,
        data: booking,
        message: 'Booking created successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  public getMany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const filter: Record<string, any> = {};
      
      if (req.query.roomId) filter.roomId = req.query.roomId;
      if (req.query.bookingStatus) filter.bookingStatus = req.query.bookingStatus;
      if (req.query.guestId) filter.guestId = req.query.guestId;

      const bookings = await this.bookingService.getBookings(orgId, filter);
      res.status(200).json({
        success: true,
        data: bookings
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const { id } = req.params;
      const booking = await this.bookingService.getBookingById(orgId, id);
      
      res.status(200).json({
        success: true,
        data: booking
      });
    } catch (error) {
      next(error);
    }
  };

  public checkIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const { id } = req.params;
      const booking = await this.bookingService.checkIn(orgId, id);
      
      res.status(200).json({
        success: true,
        data: booking,
        message: 'Guest checked in successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  public checkOut = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const { id } = req.params;
      const booking = await this.bookingService.checkOut(orgId, id);
      
      res.status(200).json({
        success: true,
        data: booking,
        message: 'Guest checked out successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  public cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const { id } = req.params;
      const booking = await this.bookingService.cancel(orgId, id);
      
      res.status(200).json({
        success: true,
        data: booking,
        message: 'Booking cancelled successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const { id } = req.params;
      const booking = await this.bookingService.updateBooking(orgId, id, req.body);
      
      res.status(200).json({
        success: true,
        data: booking,
        message: 'Booking updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const { id } = req.params;
      await this.bookingService.deleteBooking(orgId, id);
      
      res.status(200).json({
        success: true,
        message: 'Booking deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
export default BookingController;
