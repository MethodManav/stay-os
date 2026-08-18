import { Schema, model, Document, Types } from 'mongoose';

export interface IRoom {
  organizationId: Types.ObjectId;
  businessId: Types.ObjectId;
  roomTypeId: Types.ObjectId;
  roomNumber: string;
  status: 'available' | 'occupied' | 'maintenance';
  floor?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRoomDocument extends IRoom, Document {}

const RoomSchema = new Schema<IRoomDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true
    },
    roomTypeId: {
      type: Schema.Types.ObjectId,
      ref: 'RoomType',
      required: true,
      index: true
    },
    roomNumber: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'maintenance'],
      default: 'available'
    },
    floor: {
      type: Number
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure room numbers are unique within a business under an organization
RoomSchema.index({ organizationId: 1, businessId: 1, roomNumber: 1 }, { unique: true });

export const RoomModel = model<IRoomDocument>('Room', RoomSchema);
export default RoomModel;
