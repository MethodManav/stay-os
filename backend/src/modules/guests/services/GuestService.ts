import { IGuestRepository, GuestListResult } from '../repositories/IGuestRepository';
import { IGuest, IGuestDocument } from '../models/GuestModel';
import { NotFoundError } from '../../../core/errors/NotFoundError';
import { ConflictError } from '../../../core/errors/ConflictError';

export class GuestService {
  constructor(private readonly guestRepository: IGuestRepository) {}

  public async createGuest(organizationId: string, businessId: string, data: Partial<IGuest>): Promise<IGuestDocument> {
    if (data.email) {
      const existing = await this.guestRepository.findByEmail(organizationId, data.email);
      if (existing) {
        throw new ConflictError(`A guest with email '${data.email}' is already registered`);
      }
    }

    if (data.phone) {
      const existingPhone = await this.guestRepository.findByPhone(organizationId, data.phone);
      if (existingPhone) {
        throw new ConflictError(`A guest with phone number '${data.phone}' is already registered`);
      }
    }

    return this.guestRepository.create({
      ...data,
      organizationId: organizationId as any,
      businessId: businessId as any,
      totalBookings: 0,
      totalSpent: 0
    });
  }

  public async getGuests(
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
    return this.guestRepository.findMany(organizationId, options);
  }

  public async getGuestById(organizationId: string, id: string): Promise<IGuestDocument> {
    const guest = await this.guestRepository.findById(organizationId, id);
    if (!guest) {
      throw new NotFoundError('Guest profile not found');
    }
    return guest;
  }

  public async updateGuest(organizationId: string, id: string, data: Partial<IGuest>): Promise<IGuestDocument> {
    const guest = await this.guestRepository.findById(organizationId, id);
    if (!guest) {
      throw new NotFoundError('Guest profile not found');
    }

    if (data.email && data.email !== guest.email) {
      const existing = await this.guestRepository.findByEmail(organizationId, data.email);
      if (existing) {
        throw new ConflictError(`A guest with email '${data.email}' is already registered`);
      }
    }

    if (data.phone && data.phone !== guest.phone) {
      const existingPhone = await this.guestRepository.findByPhone(organizationId, data.phone);
      if (existingPhone) {
        throw new ConflictError(`A guest with phone number '${data.phone}' is already registered`);
      }
    }

    const updated = await this.guestRepository.update(organizationId, id, data);
    if (!updated) {
      throw new NotFoundError('Guest profile not found');
    }
    return updated;
  }

  public async deleteGuest(organizationId: string, id: string): Promise<void> {
    const success = await this.guestRepository.delete(organizationId, id);
    if (!success) {
      throw new NotFoundError('Guest profile not found');
    }
  }
}
export default GuestService;
