import { Request, Response, NextFunction } from 'express';
import { BusinessModel } from '../../modules/businesses/models/BusinessModel';
import { NotFoundError } from '../errors/NotFoundError';

export const BusinessContextMiddleware = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.organizationId) {
      return next();
    }

    const business = await BusinessModel.findOne({ organizationId: req.organizationId }).exec();
    if (!business) {
      throw new NotFoundError('No business registered for this organization. Please configure a business property first.');
    }

    // Attach business context
    req.businessId = business.id;
    next();
  } catch (error) {
    next(error);
  }
};

export default BusinessContextMiddleware;
