import { IRoom, IRoomDocument } from '../models/RoomModel';

export interface IRoomRepository {
  create(room: Partial<IRoom>): Promise<IRoomDocument>;
  findById(organizationId: string, id: string): Promise<IRoomDocument | null>;
  findMany(organizationId: string, filter?: Record<string, any>): Promise<IRoomDocument[]>;
  update(organizationId: string, id: string, data: Partial<IRoom>): Promise<IRoomDocument | null>;
  delete(organizationId: string, id: string): Promise<boolean>;
  findByRoomNumber(organizationId: string, businessId: string, roomNumber: string): Promise<IRoomDocument | null>;
}
