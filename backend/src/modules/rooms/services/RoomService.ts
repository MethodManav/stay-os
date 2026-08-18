import { IRoomRepository } from '../repositories/IRoomRepository';
import { IRoomTypeRepository } from '../repositories/IRoomTypeRepository';
import { IRoom, IRoomDocument } from '../models/RoomModel';
import { IRoomType, IRoomTypeDocument } from '../models/RoomTypeModel';
import { NotFoundError } from '../../../core/errors/NotFoundError';
import { ConflictError } from '../../../core/errors/ConflictError';

export class RoomService {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly roomTypeRepository: IRoomTypeRepository
  ) {}

  // -------------------------------------------------------------
  // RoomType Domain Logic
  // -------------------------------------------------------------
  
  public async createRoomType(
    organizationId: string,
    businessId: string,
    data: Partial<IRoomType>
  ): Promise<IRoomTypeDocument> {
    return this.roomTypeRepository.create({
      ...data,
      organizationId: organizationId as any,
      businessId: businessId as any
    });
  }

  public async getRoomTypes(organizationId: string, filter?: Record<string, any>): Promise<IRoomTypeDocument[]> {
    return this.roomTypeRepository.findMany(organizationId, filter);
  }

  public async getRoomTypeById(organizationId: string, id: string): Promise<IRoomTypeDocument> {
    const roomType = await this.roomTypeRepository.findById(organizationId, id);
    if (!roomType) {
      throw new NotFoundError('Room Type not found');
    }
    return roomType;
  }

  public async updateRoomType(
    organizationId: string,
    id: string,
    data: Partial<IRoomType>
  ): Promise<IRoomTypeDocument> {
    const updated = await this.roomTypeRepository.update(organizationId, id, data);
    if (!updated) {
      throw new NotFoundError('Room Type not found');
    }
    return updated;
  }

  public async deleteRoomType(organizationId: string, id: string): Promise<void> {
    // Prevent deletion if rooms are associated with this type
    const rooms = await this.roomRepository.findMany(organizationId, { roomTypeId: id });
    if (rooms.length > 0) {
      throw new ConflictError('Cannot delete Room Type: rooms are currently assigned to this category');
    }

    const success = await this.roomTypeRepository.delete(organizationId, id);
    if (!success) {
      throw new NotFoundError('Room Type not found');
    }
  }

  // -------------------------------------------------------------
  // Room Domain Logic
  // -------------------------------------------------------------

  public async createRoom(organizationId: string, businessId: string, data: Partial<IRoom>): Promise<IRoomDocument> {
    if (!data.roomTypeId) {
      throw new ConflictError('Room Type mapping is required');
    }

    // Verify room type exists and belongs to the same business
    const roomType = await this.roomTypeRepository.findById(organizationId, data.roomTypeId.toString());
    if (!roomType || roomType.businessId.toString() !== businessId) {
      throw new NotFoundError('Selected Room Type not found for this business property');
    }

    // Prevent duplicate room numbers in the same property
    const existing = await this.roomRepository.findByRoomNumber(organizationId, businessId, data.roomNumber || '');
    if (existing) {
      throw new ConflictError(`Room number '${data.roomNumber}' already exists at this property`);
    }

    return this.roomRepository.create({
      ...data,
      organizationId: organizationId as any,
      businessId: businessId as any
    });
  }

  public async getRooms(organizationId: string, filter?: Record<string, any>): Promise<IRoomDocument[]> {
    return this.roomRepository.findMany(organizationId, filter);
  }

  public async getRoomById(organizationId: string, id: string): Promise<IRoomDocument> {
    const room = await this.roomRepository.findById(organizationId, id);
    if (!room) {
      throw new NotFoundError('Room not found');
    }
    return room;
  }

  public async updateRoom(organizationId: string, id: string, data: Partial<IRoom>): Promise<IRoomDocument> {
    const room = await this.roomRepository.findById(organizationId, id);
    if (!room) {
      throw new NotFoundError('Room not found');
    }

    // If room number changes, check unique constraint
    if (data.roomNumber && data.roomNumber !== room.roomNumber) {
      const existing = await this.roomRepository.findByRoomNumber(organizationId, room.businessId.toString(), data.roomNumber);
      if (existing) {
        throw new ConflictError(`Room number '${data.roomNumber}' already exists at this property`);
      }
    }

    // If room type changes, check validity
    if (data.roomTypeId && data.roomTypeId.toString() !== room.roomTypeId.toString()) {
      const roomType = await this.roomTypeRepository.findById(organizationId, data.roomTypeId.toString());
      if (!roomType || roomType.businessId.toString() !== room.businessId.toString()) {
        throw new NotFoundError('Selected Room Type not found');
      }
    }

    const updated = await this.roomRepository.update(organizationId, id, data);
    if (!updated) {
      throw new NotFoundError('Room not found');
    }
    return updated;
  }

  public async deleteRoom(organizationId: string, id: string): Promise<void> {
    const success = await this.roomRepository.delete(organizationId, id);
    if (!success) {
      throw new NotFoundError('Room not found');
    }
  }
}
export default RoomService;
