import { Schema, model, Document, Types } from 'mongoose';

export interface IPaymentTransaction {
  organizationId: Types.ObjectId;
  businessId: Types.ObjectId;
  bookingId: Types.ObjectId;
  amount: number;
  currency: string;
  provider: 'stripe' | 'razorpay';
  providerTransactionId?: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  method?: string;
  rawResponse?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPaymentTransactionDocument extends IPaymentTransaction, Document {}

const PaymentTransactionSchema = new Schema<IPaymentTransactionDocument>(
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
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      required: true
    },
    provider: {
      type: String,
      enum: ['stripe', 'razorpay'],
      required: true
    },
    providerTransactionId: {
      type: String,
      index: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED'],
      default: 'PENDING',
      index: true
    },
    method: {
      type: String
    },
    rawResponse: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes with organizationId for tenant isolation
PaymentTransactionSchema.index({ organizationId: 1, businessId: 1, status: 1 });
PaymentTransactionSchema.index({ organizationId: 1, bookingId: 1 });

export const PaymentTransactionModel = model<IPaymentTransactionDocument>('PaymentTransaction', PaymentTransactionSchema);
export default PaymentTransactionModel;
