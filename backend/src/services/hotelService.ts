import { Types } from 'mongoose';
import { BusinessModel, IBusinessDocument } from '../modules/businesses/models/BusinessModel';
import { NotFoundError } from '../core/errors/NotFoundError';
import { BadRequestError } from '../core/errors/BadRequestError';

export interface HotelProfile {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  type: string;
  description?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  currency: string;
  timezone: string;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy?: string;
  amenities: string[];
}

export class HotelService {
  /**
   * Resolves a hotel by slug (e.g. "taj-example")
   * This is the trusted source of tenant resolution.
   */
  public async resolveHotelBySlug(slug: string): Promise<HotelProfile> {
    if (!slug || typeof slug !== 'string') {
      throw new BadRequestError('Invalid hotel slug provided');
    }

    const cleanSlug = slug.trim().toLowerCase();
    const business = await BusinessModel.findOne({
      slug: cleanSlug,
      status: 'ACTIVE'
    }).exec();

    if (!business) {
      throw new NotFoundError(`Hotel with slug '${slug}' not found or inactive`);
    }

    return this.mapToProfile(business);
  }

  /**
   * Resolves a hotel by ID.
   */
  public async getHotelById(hotelId: string): Promise<HotelProfile> {
    if (!Types.ObjectId.isValid(hotelId)) {
      throw new BadRequestError('Invalid hotel ID format');
    }

    const business = await BusinessModel.findOne({
      _id: new Types.ObjectId(hotelId),
      status: 'ACTIVE'
    }).exec();

    if (!business) {
      throw new NotFoundError(`Hotel not found with ID '${hotelId}'`);
    }

    return this.mapToProfile(business);
  }

  private mapToProfile(business: IBusinessDocument): HotelProfile {
    return {
      id: business._id.toString(),
      organizationId: business.organizationId.toString(),
      name: business.name,
      slug: business.slug,
      type: business.type,
      description: business.description,
      email: business.email,
      phone: business.phone,
      address: business.address,
      city: business.city,
      country: business.country,
      currency: business.currency || 'INR',
      timezone: business.timezone || 'Asia/Kolkata',
      checkInTime: business.checkInTime || '14:00',
      checkOutTime: business.checkOutTime || '11:00',
      cancellationPolicy: business.cancellationPolicy || 'Free cancellation up to 24 hours before check-in. Non-refundable thereafter.',
      amenities: business.amenities || []
    };
  }
}

export const hotelService = new HotelService();
export default hotelService;
