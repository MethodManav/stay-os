import { IRoomType, IRoomTypeDocument } from '../models/RoomTypeModel';

export interface IRoomTypeRepository {
  create(roomType: Partial<IRoomType>): Promise<IRoomTypeDocument>;
  findById(organizationId: string, id: string): Promise<IRoomTypeDocument | null>;
  findMany(organizationId: string, filter?: Record<string, any>): Promise<IRoomTypeDocument[]>;
  update(organizationId: string, id: string, data: Partial<IRoomType>): Promise<IRoomTypeDocument | null>;
  delete(organizationId: string, id: string): Promise<boolean>;
}
