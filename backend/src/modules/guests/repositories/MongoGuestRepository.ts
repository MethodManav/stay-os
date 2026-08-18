import { Types } from 'mongoose';
import { IGuestRepository, GuestListResult } from './IGuestRepository';
import { GuestModel, IGuest, IGuestDocument } from '../models/GuestModel';

export class MongoGuestRepository implements IGuestRepository {
  public async create(guest: Partial<IGuest>): Promise<IGuestDocument> {
    const newGuest = new GuestModel(guest);
    return newGuest.save();
  }

  public async findById(organizationId: string, id: string): Promise<IGuestDocument | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(organizationId)) return null;
    return GuestModel.findOne({
      _id: new Types.ObjectId(id),
      organizationId: new Types.ObjectId(organizationId)
    }).exec();
  }

  public async findByEmail(organizationId: string, email: string): Promise<IGuestDocument | null> {
    if (!Types.ObjectId.isValid(organizationId)) return null;
    return GuestModel.findOne({
      organizationId: new Types.ObjectId(organizationId),
      email: email.toLowerCase()
    }).exec();
  }

  public async findByPhone(organizationId: string, phone: string): Promise<IGuestDocument | null> {
    if (!Types.ObjectId.isValid(organizationId)) return null;
    return GuestModel.findOne({
      organizationId: new Types.ObjectId(organizationId),
      phone
    }).exec();
  }

  public async update(
    organizationId: string,
    id: string,
    data: Partial<IGuest>
  ): Promise<IGuestDocument | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(organizationId)) return null;
    return GuestModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        organizationId: new Types.ObjectId(organizationId)
      },
      data,
      { new: true }
    ).exec();
  }

  public async delete(organizationId: string, id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(organizationId)) return false;
    const result = await GuestModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      organizationId: new Types.ObjectId(organizationId)
    }).exec();
    return result !== null;
  }

  public async findMany(
    organizationId: string,
    options: {
      search?: string;
      tags?: string[];
      country?: string;
      page: number;
      limit: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<GuestListResult> {
    if (!Types.ObjectId.isValid(organizationId)) {
      return { guests: [], total: 0, page: options.page, limit: options.limit, totalPages: 0 };
    }

    const query: any = {
      organizationId: new Types.ObjectId(organizationId)
    };

    // Regex text search on firstName, lastName, email, phone
    if (options.search) {
      const searchRegex = new RegExp(options.search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }

    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      query.tags = { $in: options.tags };
    }

    // Filter by country
    if (options.country) {
      query.country = options.country;
    }

    // Sorting
    const sort: any = {};
    if (options.sortBy) {
      const field = options.sortBy === 'name' ? 'firstName' : options.sortBy;
      sort[field] = options.sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default
    }

    // Pagination skip/limit
    const skip = (options.page - 1) * options.limit;
    
    const total = await GuestModel.countDocuments(query).exec();
    const guests = await GuestModel.find(query)
      .sort(sort)
      .skip(skip)
      .limit(options.limit)
      .exec();

    const totalPages = Math.ceil(total / options.limit);

    return {
      guests,
      total,
      page: options.page,
      limit: options.limit,
      totalPages
    };
  }
}
export default MongoGuestRepository;
