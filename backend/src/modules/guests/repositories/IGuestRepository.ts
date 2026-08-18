import { IGuest, IGuestDocument } from '../models/GuestModel';

export interface GuestListResult {
  guests: IGuestDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IGuestRepository {
  create(guest: Partial<IGuest>): Promise<IGuestDocument>;
  findById(organizationId: string, id: string): Promise<IGuestDocument | null>;
  findByEmail(organizationId: string, email: string): Promise<IGuestDocument | null>;
  findByPhone(organizationId: string, phone: string): Promise<IGuestDocument | null>;
  update(organizationId: string, id: string, data: Partial<IGuest>): Promise<IGuestDocument | null>;
  delete(organizationId: string, id: string): Promise<boolean>;
  findMany(
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
  ): Promise<GuestListResult>;
}
