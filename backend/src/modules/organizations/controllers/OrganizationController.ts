import { Request, Response, NextFunction } from 'express';
import { OrganizationService } from '../services/OrganizationService';

export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, slug } = req.body;
      const ownerId = req.user?.id;
      if (!ownerId) {
        throw new Error('User context not established');
      }

      const org = await this.organizationService.createOrganization(name, slug, ownerId);
      res.status(201).json({
        success: true,
        data: org,
        message: 'Organization created successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  public get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userOrgs = req.user?.organizations;
      if (!userOrgs) {
        throw new Error('User context not established');
      }

      const org = await this.organizationService.getOrganization(id, userOrgs);
      res.status(200).json({
        success: true,
        data: org
      });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const org = await this.organizationService.updateOrganization(id, req.body);
      res.status(200).json({
        success: true,
        data: org,
        message: 'Organization updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.organizationService.deleteOrganization(id);
      res.status(200).json({
        success: true,
        message: 'Organization deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
export default OrganizationController;
