import { Request, Response, NextFunction } from 'express';
import { GuestService } from '../services/GuestService';

export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const businessId = req.businessId!;
      const guest = await this.guestService.createGuest(orgId, businessId, req.body);
      
      res.status(201).json({
        success: true,
        data: guest,
        message: 'Guest profile created successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  public getMany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const { search, tags, country, page, limit, sortBy, sortOrder } = req.query as any;

      const result = await this.guestService.getGuests(orgId, {
        search,
        tags,
        country,
        page,
        limit,
        sortBy,
        sortOrder
      });

      res.status(200).json({
        success: true,
        data: result.guests,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const { id } = req.params;
      const guest = await this.guestService.getGuestById(orgId, id);
      
      res.status(200).json({
        success: true,
        data: guest
      });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const { id } = req.params;
      const guest = await this.guestService.updateGuest(orgId, id, req.body);
      
      res.status(200).json({
        success: true,
        data: guest,
        message: 'Guest profile updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const { id } = req.params;
      await this.guestService.deleteGuest(orgId, id);
      
      res.status(200).json({
        success: true,
        message: 'Guest profile deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
export default GuestController;
