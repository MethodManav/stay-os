import { Schema, model, Document, Types } from 'mongoose';

export interface IRoomType {
  organizationId: Types.ObjectId;
  businessId: Types.ObjectId;
  name: string;
  description?: string;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IRoomTypeDocument extends IRoomType, Document {}

const RoomTypeSchema = new Schema<IRoomTypeDocument>(
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
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    capacity: {
      type: Number,
      required: true,
      min: 1
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: 0
    },
    amenities: {
      type: [String],
      default: []
    },
    images: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes with organizationId for tenant isolation
RoomTypeSchema.index({ organizationId: 1, businessId: 1, name: 1 });

export const RoomTypeModel = model<IRoomTypeDocument>('RoomType', RoomTypeSchema);
export default RoomTypeModel;
