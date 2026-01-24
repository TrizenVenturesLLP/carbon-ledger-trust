import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITransaction extends Document {
  transactionId: string;
  type: 'issued' | 'transferred' | 'retired';
  fromUserId?: Types.ObjectId;
  toUserId?: Types.ObjectId;
  creditId: Types.ObjectId;
  amount: number;
  blockchainTxHash?: string;
  blockNumber?: number;
  status: 'pending' | 'confirmed' | 'failed';
  retirementReason?: string;
  createdAt: Date;
  confirmedAt?: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['issued', 'transferred', 'retired'],
      required: true,
    },
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    creditId: {
      type: Schema.Types.ObjectId,
      ref: 'CarbonCredit',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    blockchainTxHash: {
      type: String,
    },
    blockNumber: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed'],
      default: 'pending',
    },
    retirementReason: {
      type: String,
    },
    confirmedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
TransactionSchema.index({ fromUserId: 1 });
TransactionSchema.index({ toUserId: 1 });
TransactionSchema.index({ creditId: 1 });
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ blockchainTxHash: 1 });
TransactionSchema.index({ status: 1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);

// Auto-generate transactionId before save
TransactionSchema.pre('save', async function (next) {
  if (!this.transactionId) {
    const count = await mongoose.models.Transaction?.countDocuments() || 0;
    this.transactionId = `TXN-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});
