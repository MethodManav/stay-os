import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';

export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  public getMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.organizationId!;
      const businessId = req.businessId!;
      const { startDate, endDate } = req.query as { startDate: string; endDate: string };

      const metrics = await this.analyticsService.getMetrics(orgId, businessId, startDate, endDate);

      res.status(200).json({
        success: true,
        data: metrics
      });
    } catch (error) {
      next(error);
    }
  };
}
export default AnalyticsController;
