import { Schema, model, Document, Types } from 'mongoose';

export interface IAIKnowledgeBase {
  organizationId: Types.ObjectId;
  businessId: Types.ObjectId;
  category: 'FAQ' | 'POLICY' | 'DETAILS';
  question: string;
  answer: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAIKnowledgeBaseDocument extends IAIKnowledgeBase, Document {}

const AIKnowledgeBaseSchema = new Schema<IAIKnowledgeBaseDocument>(
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
    category: {
      type: String,
      enum: ['FAQ', 'POLICY', 'DETAILS'],
      required: true
    },
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index with organizationId for tenant isolation
AIKnowledgeBaseSchema.index({ organizationId: 1, businessId: 1, category: 1 });

export const AIKnowledgeBaseModel = model<IAIKnowledgeBaseDocument>('AIKnowledgeBase', AIKnowledgeBaseSchema);
export default AIKnowledgeBaseModel;
