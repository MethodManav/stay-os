import { Schema, model, Document, Types } from 'mongoose';

export type ServiceType = 'cleaning' | 'housekeeping' | 'room_service' | 'maintenance' | 'towels' | 'dining' | 'other';
export type ServiceStatus = 'requested' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type ServicePriority = 'low' | 'normal' | 'high';

export interface IServiceRequest {
  organizationId: Types.ObjectId;
  businessId: Types.ObjectId;
  bookingId: Types.ObjectId;
  guestId?: Types.ObjectId;
  roomNumber: string;
  roomName: string;
  serviceType: ServiceType;
  details: string;
  status: ServiceStatus;
  priority: ServicePriority;
  requestedTime?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IServiceRequestDocument extends IServiceRequest, Document {}

const ServiceRequestSchema = new Schema<IServiceRequestDocument>(
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
    guestId: {
      type: Schema.Types.ObjectId,
      ref: 'Guest'
    },
    roomNumber: {
      type: String,
      required: true,
      trim: true
    },
    roomName: {
      type: String,
      required: true,
      trim: true
    },
    serviceType: {
      type: String,
      enum: ['cleaning', 'housekeeping', 'room_service', 'maintenance', 'towels', 'dining', 'other'],
      default: 'cleaning',
      index: true
    },
    details: {
      type: String,
      trim: true,
      default: 'Room cleaning service requested'
    },
    status: {
      type: String,
      enum: ['requested', 'scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal'
    },
    requestedTime: {
      type: String,
      default: 'ASAP'
    }
  },
  {
    timestamps: true
  }
);

ServiceRequestSchema.index({ businessId: 1, bookingId: 1, status: 1 });

export const ServiceRequestModel = model<IServiceRequestDocument>('ServiceRequest', ServiceRequestSchema);
export default ServiceRequestModel;
