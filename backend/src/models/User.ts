import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'company' | 'regulator' | 'admin';
  companyName?: string;
  walletAddress?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['company', 'regulator', 'admin'],
      required: true,
    },
    companyName: {
      type: String,
      required: function(this: IUser) {
        return this.role === 'company';
      },
    },
    walletAddress: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ walletAddress: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
