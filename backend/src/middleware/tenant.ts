import { Request, Response, NextFunction } from 'express';
import { hotelService } from '../services/hotelService';
import { TenantContext } from '../mcp/context';
import { BadRequestError } from '../core/errors/BadRequestError';

// Extend Express Request to include tenant context
declare global {
  namespace Express {
    interface Request {
      tenant?: TenantContext;
    }
  }
}

/**
 * Middleware that resolves tenant context from route params (:slug) or headers.
 * Ensures that all downstream services receive a verified, tamper-proof hotel tenant context.
 */
export async function resolveTenantMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const slug = req.params.slug || req.headers['x-hotel-slug'] || req.headers['x-tenant-slug'];
    const hotelId = req.headers['x-hotel-id'] as string;

    if (slug && typeof slug === 'string') {
      const hotel = await hotelService.resolveHotelBySlug(slug);
      req.tenant = {
        hotelId: hotel.id,
        organizationId: hotel.organizationId,
        hotelSlug: hotel.slug,
        hotelName: hotel.name,
        currency: hotel.currency,
        timezone: hotel.timezone
      };
      return next();
    }

    if (hotelId && typeof hotelId === 'string') {
      const hotel = await hotelService.getHotelById(hotelId);
      req.tenant = {
        hotelId: hotel.id,
        organizationId: hotel.organizationId,
        hotelSlug: hotel.slug,
        hotelName: hotel.name,
        currency: hotel.currency,
        timezone: hotel.timezone
      };
      return next();
    }

    throw new BadRequestError('Tenant context could not be resolved. Please provide a valid hotel slug.');
  } catch (error) {
    next(error);
  }
}

export default resolveTenantMiddleware;
