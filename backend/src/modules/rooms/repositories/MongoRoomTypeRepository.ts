import { Types } from 'mongoose';
import { IRoomTypeRepository } from './IRoomTypeRepository';
import { RoomTypeModel, IRoomType, IRoomTypeDocument } from '../models/RoomTypeModel';

export class MongoRoomTypeRepository implements IRoomTypeRepository {
  public async create(roomType: Partial<IRoomType>): Promise<IRoomTypeDocument> {
    const newRoomType = new RoomTypeModel(roomType);
    return newRoomType.save();
  }

  public async findById(organizationId: string, id: string): Promise<IRoomTypeDocument | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(organizationId)) return null;
    return RoomTypeModel.findOne({
      _id: new Types.ObjectId(id),
      organizationId: new Types.ObjectId(organizationId)
    }).exec();
  }

  public async findMany(organizationId: string, filter?: Record<string, any>): Promise<IRoomTypeDocument[]> {
    if (!Types.ObjectId.isValid(organizationId)) return [];
    return RoomTypeModel.find({
      ...filter,
      organizationId: new Types.ObjectId(organizationId)
    }).exec();
  }

  public async update(
    organizationId: string,
    id: string,
    data: Partial<IRoomType>
  ): Promise<IRoomTypeDocument | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(organizationId)) return null;
    return RoomTypeModel.findOneAndUpdate(
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
    const result = await RoomTypeModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      organizationId: new Types.ObjectId(organizationId)
    }).exec();
    return result !== null;
  }
}
export default MongoRoomTypeRepository;
