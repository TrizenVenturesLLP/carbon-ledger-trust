import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAuditLog extends Document {
  action: 'approved' | 'rejected' | 'reviewed';
  reportId: Types.ObjectId;
  reportTitle: string;
  companyId: Types.ObjectId;
  companyName: string;
  verifierId: Types.ObjectId;
  verifierName: string;
  notes: string;
  creditsIssued?: number;
  previousStatus: string;
  newStatus: string;
  timestamp: Date;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      enum: ['approved', 'rejected', 'reviewed'],
      required: true,
    },
    reportId: {
      type: Schema.Types.ObjectId,
      ref: 'EmissionReport',
      required: true,
    },
    reportTitle: {
      type: String,
      required: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    verifierId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    verifierName: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      required: true,
    },
    creditsIssued: {
      type: Number,
      min: 0,
    },
    previousStatus: {
      type: String,
      required: true,
    },
    newStatus: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
AuditLogSchema.index({ verifierId: 1 });
AuditLogSchema.index({ reportId: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ timestamp: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
