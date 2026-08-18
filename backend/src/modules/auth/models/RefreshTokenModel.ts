import { Schema, model, Document } from 'mongoose';

export interface IRefreshToken {
  userId: Schema.Types.ObjectId;
  token: string;
  expiresAt: Date;
  revokedAt?: Date;
  replacedByToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRefreshTokenDocument extends IRefreshToken, Document {
  isExpired(): boolean;
  isActive(): boolean;
}

const RefreshTokenSchema = new Schema<IRefreshTokenDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    revokedAt: {
      type: Date
    },
    replacedByToken: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Virtual methods to check token status
RefreshTokenSchema.methods.isExpired = function (): boolean {
  return new Date() >= this.expiresAt;
};

RefreshTokenSchema.methods.isActive = function (): boolean {
  return !this.revokedAt && !this.isExpired();
};

export const RefreshTokenModel = model<IRefreshTokenDocument>('RefreshToken', RefreshTokenSchema);
export default RefreshTokenModel;
