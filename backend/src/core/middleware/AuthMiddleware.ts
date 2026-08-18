import { Request, Response, NextFunction } from 'express';
import { TokenUtility } from '../../shared/utils/TokenUtility';
import { UnauthorizedError } from '../errors/UnauthorizedError';

export const AuthMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token is required');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Authentication token is invalid');
    }

    const decoded = TokenUtility.verifyAccessToken(token);
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      organizations: decoded.organizations
    };

    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired authentication token'));
  }
};

export default AuthMiddleware;
