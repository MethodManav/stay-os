import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../../modules/users/models/UserModel';
import { ForbiddenError } from '../errors/ForbiddenError';
import { UnauthorizedError } from '../errors/UnauthorizedError';

export const SuperAdminMiddleware = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('User context is missing');
    }

    const user = await UserModel.findById(req.user.id);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.isSuperAdmin) {
      throw new ForbiddenError('Access denied: Super Admin privileges required');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default SuperAdminMiddleware;
