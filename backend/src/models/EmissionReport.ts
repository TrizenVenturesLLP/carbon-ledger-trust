import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IDocument {
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimetype: string;
  uploadedAt: Date;
}

export interface IEmissionReport extends Document {
  reportId: string;
  companyId: Types.ObjectId;
  title: string;
  type: 'quarterly' | 'project' | 'annual';
  description: string;
  methodology: string;
  baselineEmissions: number;
  reportedEmissions: number;
  estimatedCredits: number;
  issuedCredits?: number;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  documents: IDocument[];
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: Types.ObjectId;
  blockchainTxHash?: string;
  blockchainReportId?: number;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
  mimetype: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const EmissionReportSchema = new Schema<IEmissionReport>(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['quarterly', 'project', 'annual'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    methodology: {
      type: String,
      required: true,
    },
    baselineEmissions: {
      type: Number,
      required: true,
      min: 0,
    },
    reportedEmissions: {
      type: Number,
      required: true,
      min: 0,
    },
    estimatedCredits: {
      type: Number,
      required: true,
      min: 0,
    },
    issuedCredits: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
    },
    documents: {
      type: [DocumentSchema],
      default: [],
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    blockchainTxHash: {
      type: String,
    },
    blockchainReportId: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
EmissionReportSchema.index({ companyId: 1 });
EmissionReportSchema.index({ status: 1 });
EmissionReportSchema.index({ reportId: 1 });
EmissionReportSchema.index({ reviewedBy: 1 });

export const EmissionReport = mongoose.model<IEmissionReport>('EmissionReport', EmissionReportSchema);

// Auto-generate reportId before save
EmissionReportSchema.pre('save', async function (next) {
  if (!this.reportId) {
    const count = await mongoose.models.EmissionReport?.countDocuments() || 0;
    this.reportId = `RPT-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});
