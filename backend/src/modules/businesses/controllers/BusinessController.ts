import { Request, Response, NextFunction } from 'express';
import { BusinessService } from '../services/BusinessService';

export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const organizationId = req.organizationId;
      if (!organizationId) {
        throw new Error('Organization context not established');
      }

      const business = await this.businessService.createBusiness(organizationId, req.body);
      res.status(201).json({
        success: true,
        data: business,
        message: 'Business configured successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  public getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const organizationId = req.organizationId;
      if (!organizationId) {
        throw new Error('Organization context not established');
      }

      const business = await this.businessService.getBusinessByOrganization(organizationId);
      res.status(200).json({
        success: true,
        data: business
      });
    } catch (error) {
      next(error);
    }
  };

  public updateMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const organizationId = req.organizationId;
      if (!organizationId) {
        throw new Error('Organization context not established');
      }

      const business = await this.businessService.updateBusinessByOrganization(organizationId, req.body);
      res.status(200).json({
        success: true,
        data: business,
        message: 'Business details updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
export default BusinessController;
