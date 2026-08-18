import { Schema, model, Document } from 'mongoose';

export interface IUserOrganization {
  organizationId: Schema.Types.ObjectId;
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF';
}

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  status: 'ACTIVE' | 'SUSPENDED';
  organizations: IUserOrganization[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {}

const UserOrganizationSchema = new Schema<IUserOrganization>({
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  role: {
    type: String,
    enum: ['OWNER', 'ADMIN', 'MANAGER', 'STAFF'],
    required: true
  }
}, { _id: false });

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED'],
      default: 'ACTIVE'
    },
    organizations: [UserOrganizationSchema]
  },
  {
    timestamps: true
  }
);

// Prevent returning password hash when transforming documents to JSON
UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const json = ret as Record<string, any>;
    delete json.passwordHash;
    delete json.__v;
    return json;
  }
});

export const UserModel = model<IUserDocument>('User', UserSchema);
export default UserModel;
