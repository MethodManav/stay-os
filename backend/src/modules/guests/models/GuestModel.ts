import { Schema, model, Document, Types } from 'mongoose';

export interface IGuest {
  organizationId: Types.ObjectId;
  businessId: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country?: string;
  tags: string[];
  preferences?: string;
  notes?: string;
  totalBookings: number;
  totalSpent: number;
  lastVisit?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGuestDocument extends IGuest, Document {
  readonly name: string;
}

const GuestSchema = new Schema<IGuestDocument>(
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
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      trim: true
    },
    tags: {
      type: [String],
      default: []
    },
    preferences: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    totalBookings: {
      type: Number,
      default: 0,
      min: 0
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0
    },
    lastVisit: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for full name (supports frontend 'name' property)
GuestSchema.virtual('name').get(function (this: IGuestDocument) {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Compound indexes with organizationId for tenant isolation
GuestSchema.index({ organizationId: 1, businessId: 1, email: 1 });
GuestSchema.index({ organizationId: 1, businessId: 1, phone: 1 });

export const GuestModel = model<IGuestDocument>('Guest', GuestSchema);
export default GuestModel;
