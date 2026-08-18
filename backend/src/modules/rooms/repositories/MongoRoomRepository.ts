import { Types } from 'mongoose';
import { IRoomRepository } from './IRoomRepository';
import { RoomModel, IRoom, IRoomDocument } from '../models/RoomModel';

export class MongoRoomRepository implements IRoomRepository {
  public async create(room: Partial<IRoom>): Promise<IRoomDocument> {
    const newRoom = new RoomModel(room);
    return newRoom.save();
  }

  public async findById(organizationId: string, id: string): Promise<IRoomDocument | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(organizationId)) return null;
    return RoomModel.findOne({
      _id: new Types.ObjectId(id),
      organizationId: new Types.ObjectId(organizationId)
    }).exec();
  }

  public async findMany(organizationId: string, filter?: Record<string, any>): Promise<IRoomDocument[]> {
    if (!Types.ObjectId.isValid(organizationId)) return [];
    return RoomModel.find({
      ...filter,
      organizationId: new Types.ObjectId(organizationId)
    }).exec();
  }

  public async update(
    organizationId: string,
    id: string,
    data: Partial<IRoom>
  ): Promise<IRoomDocument | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(organizationId)) return null;
    return RoomModel.findOneAndUpdate(
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
    const result = await RoomModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      organizationId: new Types.ObjectId(organizationId)
    }).exec();
    return result !== null;
  }

  public async findByRoomNumber(
    organizationId: string,
    businessId: string,
    roomNumber: string
  ): Promise<IRoomDocument | null> {
    if (!Types.ObjectId.isValid(organizationId) || !Types.ObjectId.isValid(businessId)) return null;
    return RoomModel.findOne({
      organizationId: new Types.ObjectId(organizationId),
      businessId: new Types.ObjectId(businessId),
      roomNumber
    }).exec();
  }
}
export default MongoRoomRepository;
