import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICarbonCredit extends Document {
  creditId: string;
  reportId: Types.ObjectId;
  companyId: Types.ObjectId;
  amount: number;
  status: 'active' | 'retired' | 'transferred';
  currentOwner: Types.ObjectId;
  originalOwner: Types.ObjectId;
  retiredAt?: Date;
  retirementReason?: string;
  blockchainTxHash?: string;
  tokenId?: number;
  contractAddress?: string;
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CarbonCreditSchema = new Schema<ICarbonCredit>(
  {
    creditId: {
      type: String,
      required: true,
      unique: true,
    },
    reportId: {
      type: Schema.Types.ObjectId,
      ref: 'EmissionReport',
      required: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'retired', 'transferred'],
      default: 'active',
    },
    currentOwner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalOwner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    retiredAt: {
      type: Date,
    },
    retirementReason: {
      type: String,
    },
    blockchainTxHash: {
      type: String,
    },
    tokenId: {
      type: Number,
    },
    contractAddress: {
      type: String,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
CarbonCreditSchema.index({ companyId: 1 });
CarbonCreditSchema.index({ currentOwner: 1 });
CarbonCreditSchema.index({ status: 1 });
CarbonCreditSchema.index({ creditId: 1 });
CarbonCreditSchema.index({ tokenId: 1 });
CarbonCreditSchema.index({ blockchainTxHash: 1 });

export const CarbonCredit = mongoose.model<ICarbonCredit>('CarbonCredit', CarbonCreditSchema);

// Auto-generate creditId before save
CarbonCreditSchema.pre('save', async function (next) {
  if (!this.creditId) {
    const count = await mongoose.models.CarbonCredit?.countDocuments() || 0;
    this.creditId = `CC-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});
