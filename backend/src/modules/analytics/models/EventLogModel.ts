import { Schema, model, Document, Types } from 'mongoose';

export interface IEventLog {
  organizationId: Types.ObjectId;
  businessId: Types.ObjectId;
  eventType: 'WEBSITE_VISIT' | 'AI_CONVERSATION' | 'BOOKING_CREATED' | 'BOOKING_COMPLETED' | 'PAYMENT_RECEIVED';
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface IEventLogDocument extends IEventLog, Document {}

const EventLogSchema = new Schema<IEventLogDocument>(
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
    eventType: {
      type: String,
      enum: ['WEBSITE_VISIT', 'AI_CONVERSATION', 'BOOKING_CREATED', 'BOOKING_COMPLETED', 'PAYMENT_RECEIVED'],
      required: true,
      index: true
    },
    metadata: {
      type: Schema.Types.Mixed
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false
  }
);

// Compound index for querying events within range
EventLogSchema.index({ organizationId: 1, businessId: 1, eventType: 1, timestamp: 1 });

export const EventLogModel = model<IEventLogDocument>('EventLog', EventLogSchema);
export default EventLogModel;
