import { Schema, model, Document, Types } from 'mongoose';

export interface IOrganization {
  name: string;
  slug: string;
  ownerId: Types.ObjectId;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrganizationDocument extends IOrganization, Document {}

const OrganizationSchema = new Schema<IOrganizationDocument>(
  {
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
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED'],
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true
  }
);

export const OrganizationModel = model<IOrganizationDocument>('Organization', OrganizationSchema);
export default OrganizationModel;
