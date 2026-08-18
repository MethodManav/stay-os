import { Schema, model, Document, Types } from 'mongoose';

export interface IMessage {
  sender: 'guest' | 'staff' | 'ai';
  text: string;
  timestamp: Date;
}

export interface IConversationLeads {
  email?: string;
  notes?: string;
}

export interface IConversation {
  organizationId: Types.ObjectId;
  businessId: Types.ObjectId;
  guestName: string;
  guestPhone: string;
  status: 'active' | 'resolved' | 'escalated';
  unread: boolean;
  messages: IMessage[];
  leads?: IConversationLeads;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversationDocument extends IConversation, Document {}

const MessageSchema = new Schema<IMessage>({
  sender: {
    type: String,
    enum: ['guest', 'staff', 'ai'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: true }); // Enable id for frontend map keys

const ConversationLeadsSchema = new Schema<IConversationLeads>({
  email: { type: String, trim: true },
  notes: { type: String, trim: true }
}, { _id: false });

const ConversationSchema = new Schema<IConversationDocument>(
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
    guestName: {
      type: String,
      required: true,
      trim: true
    },
    guestPhone: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['active', 'resolved', 'escalated'],
      default: 'active',
      index: true
    },
    unread: {
      type: Boolean,
      default: true,
      index: true
    },
    messages: {
      type: [MessageSchema],
      default: []
    },
    leads: {
      type: ConversationLeadsSchema
    }
  },
  {
    timestamps: true
  }
);

// Compound index for tenant isolation and guest conversations sorting
ConversationSchema.index({ organizationId: 1, businessId: 1, guestPhone: 1 });
ConversationSchema.index({ organizationId: 1, businessId: 1, status: 1 });

export const ConversationModel = model<IConversationDocument>('Conversation', ConversationSchema);
export default ConversationModel;
