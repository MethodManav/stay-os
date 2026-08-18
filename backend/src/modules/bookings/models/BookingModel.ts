import { Schema, model, Document, Types } from 'mongoose';

export interface IBookingPricing {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}

export interface IBooking {
  organizationId: Types.ObjectId;
  businessId: Types.ObjectId;
  guestId: Types.ObjectId;
  roomId: Types.ObjectId;
  roomTypeId: Types.ObjectId;
  checkIn: Date;
  checkOut: Date;
  numberOfGuests: number;
  pricing: IBookingPricing;
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED' | 'FAILED';
  bookingStatus: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
  source: 'DASHBOARD' | 'WEBSITE' | 'AI';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBookingDocument extends IBooking, Document {}

const BookingPricingSchema = new Schema<IBookingPricing>({
  subtotal: { type: Number, required: true, min: 0 },
  tax: { type: Number, required: true, min: 0, default: 0 },
  discount: { type: Number, required: true, min: 0, default: 0 },
  total: { type: Number, required: true, min: 0 }
}, { _id: false });

const BookingSchema = new Schema<IBookingDocument>(
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
    guestId: {
      type: Schema.Types.ObjectId,
      ref: 'Guest',
      required: true,
      index: true
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true
    },
    roomTypeId: {
      type: Schema.Types.ObjectId,
      ref: 'RoomType',
      required: true,
      index: true
    },
    checkIn: {
      type: Date,
      required: true,
      index: true
    },
    checkOut: {
      type: Date,
      required: true,
      index: true
    },
    numberOfGuests: {
      type: Number,
      required: true,
      min: 1
    },
    pricing: {
      type: BookingPricingSchema,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PARTIAL', 'PAID', 'REFUNDED', 'FAILED'],
      default: 'PENDING',
      index: true
    },
    bookingStatus: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'],
      default: 'PENDING',
      index: true
    },
    source: {
      type: String,
      enum: ['DASHBOARD', 'WEBSITE', 'AI'],
      default: 'DASHBOARD'
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes accounting for tenant isolation
BookingSchema.index({ organizationId: 1, businessId: 1, bookingStatus: 1 });
BookingSchema.index({ organizationId: 1, businessId: 1, checkIn: 1, checkOut: 1 });
BookingSchema.index({ organizationId: 1, businessId: 1, guestId: 1 });
BookingSchema.index({ organizationId: 1, businessId: 1, roomId: 1 });

export const BookingModel = model<IBookingDocument>('Booking', BookingSchema);
export default BookingModel;
