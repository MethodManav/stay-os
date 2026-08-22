import { Schema, model, Document, Types } from 'mongoose';

export interface IBusiness {
  organizationId: Types.ObjectId;
  name: string;
  slug: string;
  type: 'HOTEL' | 'RESORT' | 'HOMESTAY' | 'BOUTIQUE' | 'OTHER';
  description?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  currency: string;
  timezone: string;
  checkInTime: string;
  checkOutTime: string;
  wifiPassword?: string;
  breakfastPolicy: 'included' | 'paid' | 'none';
  cancellationPolicy?: string;
  amenities: string[];
  logo?: string;
  images: string[];
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

export interface IBusinessDocument extends IBusiness, Document {}

const BusinessSchema = new Schema<IBusinessDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    type: {
      type: String,
      enum: ['HOTEL', 'RESORT', 'HOMESTAY', 'BOUTIQUE', 'OTHER'],
      default: 'HOTEL'
    },
    description: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true
    },
    currency: {
      type: String,
      required: true,
      default: 'USD'
    },
    timezone: {
      type: String,
      required: true,
      default: 'UTC'
    },
    checkInTime: {
      type: String,
      required: true,
      default: '14:00'
    },
    checkOutTime: {
      type: String,
      required: true,
      default: '11:00'
    },
    wifiPassword: {
      type: String
    },
    breakfastPolicy: {
      type: String,
      enum: ['included', 'paid', 'none'],
      default: 'none'
    },
    cancellationPolicy: {
      type: String
    },
    amenities: {
      type: [String],
      default: []
    },
    logo: {
      type: String
    },
    images: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACTIVE', 'INACTIVE'],
      default: 'PENDING'
    }
  },
  {
    timestamps: true
  }
);

// Compounding indexes with organizationId for tenant isolation
BusinessSchema.index({ organizationId: 1, status: 1 });

export const BusinessModel = model<IBusinessDocument>('Business', BusinessSchema);
export default BusinessModel;
