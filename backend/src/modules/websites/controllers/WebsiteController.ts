import { Request, Response, NextFunction } from 'express';
import { WebsiteService } from '../services/WebsiteService';

export class WebsiteController {
  constructor(private readonly websiteService: WebsiteService) {}

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const businessId = req.businessId!;
      const website = await this.websiteService.createWebsite(orgId, businessId, req.body);
      
      res.status(201).json({
        success: true,
        data: website,
        message: 'Website configuration created successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  public getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const businessId = req.businessId!;
      const website = await this.websiteService.getWebsiteByBusiness(orgId, businessId);
      
      res.status(200).json({
        success: true,
        data: website
      });
    } catch (error) {
      next(error);
    }
  };

  public updateMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const businessId = req.businessId!;
      const website = await this.websiteService.updateWebsiteByBusiness(orgId, businessId, req.body);
      
      res.status(200).json({
        success: true,
        data: website,
        message: 'Website configuration updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
export default WebsiteController;
