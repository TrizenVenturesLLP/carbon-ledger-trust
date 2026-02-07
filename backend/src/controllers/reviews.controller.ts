import { Response } from 'express';
import { EmissionReport } from '../models/EmissionReport';
import { CarbonCredit } from '../models/CarbonCredit';
import { Transaction } from '../models/Transaction';
import { AuditLog } from '../models/AuditLog';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';
import { issueCredits } from '../services/blockchain.service';

export const getPendingReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reports = await EmissionReport.find({ status: 'pending' })
      .populate('companyId', 'email companyName')
      .sort({ submittedAt: 1 });

    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getReviewById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const report = await EmissionReport.findById(id)
      .populate('companyId', 'email companyName walletAddress')
      .populate('reviewedBy', 'email');

    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const approveReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { issuedCredits, notes } = req.body;

    const report = await EmissionReport.findById(id).populate('companyId', 'email companyName walletAddress');

    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    if (report.status !== 'pending') {
      res.status(400).json({ error: 'Report is not pending' });
      return;
    }

    const creditsToIssue = issuedCredits || report.estimatedCredits;
    const company = report.companyId as any;

    if (!company.walletAddress) {
      res.status(400).json({ error: 'Company wallet address not linked' });
      return;
    }

    // Issue credits on blockchain
    let blockchainTxHash: string | undefined;
    let tokenId: number | undefined;

    try {
      const result = await issueCredits(
        company.walletAddress,
        creditsToIssue,
        JSON.stringify({
          reportId: report.reportId,
          title: report.title,
          company: company.email,
        })
      );
      blockchainTxHash = result.txHash;
      tokenId = result.tokenId;
    } catch (blockchainError: any) {
      console.error('Blockchain error:', blockchainError);
      res.status(500).json({ error: `Blockchain error: ${blockchainError.message}` });
      return;
    }

    // Update report
    report.status = 'approved';
    report.issuedCredits = creditsToIssue;
    report.reviewedAt = new Date();
    report.reviewedBy = req.user?.id as any;
    report.blockchainTxHash = blockchainTxHash;
    await report.save();

    // Generate unique creditId (required by schema)
    const creditCount = await CarbonCredit.countDocuments();
    const creditId = `CC-${new Date().getFullYear()}-${String(creditCount + 1).padStart(3, '0')}`;

    // Create carbon credit record
    const credit = await CarbonCredit.create({
      creditId,
      reportId: report._id,
      companyId: report.companyId,
      amount: creditsToIssue,
      status: 'active',
      currentOwner: report.companyId,
      originalOwner: report.companyId,
      blockchainTxHash,
      tokenId,
      contractAddress: process.env.CARBON_CREDIT_TOKEN_ADDRESS,
    });

    // Generate unique transactionId (required by schema)
    const txnCount = await Transaction.countDocuments();
    const transactionId = `TXN-${new Date().getFullYear()}-${String(txnCount + 1).padStart(3, '0')}`;

    // Create transaction record
    await Transaction.create({
      transactionId,
      type: 'issued',
      toUserId: report.companyId,
      creditId: credit._id,
      amount: creditsToIssue,
      blockchainTxHash,
      status: 'confirmed',
      confirmedAt: new Date(),
    });

    // Create audit log (ensure required string fields are never undefined)
    const companyName = (company && ((company as any).companyName ?? (company as any).email)) || 'Unknown Company';
    const verifierName = req.user?.email || 'Unknown';
    await AuditLog.create({
      action: 'approved',
      reportId: report._id,
      reportTitle: report.title || 'Untitled Report',
      companyId: report.companyId,
      companyName,
      verifierId: req.user?.id as any,
      verifierName,
      notes: notes || 'Report approved and credits issued',
      creditsIssued: creditsToIssue,
      previousStatus: 'pending',
      newStatus: 'approved',
    });

    res.json({
      message: 'Report approved and credits issued',
      report,
      credit,
      blockchainTxHash,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const rejectReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rejectionReason, notes } = req.body;

    if (!rejectionReason) {
      res.status(400).json({ error: 'Rejection reason is required' });
      return;
    }

    const report = await EmissionReport.findById(id).populate('companyId', 'email companyName');

    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    if (report.status !== 'pending') {
      res.status(400).json({ error: 'Report is not pending' });
      return;
    }

    // Update report
    report.status = 'rejected';
    report.rejectionReason = rejectionReason;
    report.reviewedAt = new Date();
    report.reviewedBy = req.user?.id as any;
    await report.save();

    // Create audit log (ensure required string fields are never undefined)
    const company = report.companyId as any;
    const companyName = (company && (company.companyName ?? company.email)) || 'Unknown Company';
    const verifierName = req.user?.email || 'Unknown';
    await AuditLog.create({
      action: 'rejected',
      reportId: report._id,
      reportTitle: report.title || 'Untitled Report',
      companyId: report.companyId,
      companyName,
      verifierId: req.user?.id as any,
      verifierName,
      notes: notes || rejectionReason || 'Rejected',
      previousStatus: 'pending',
      newStatus: 'rejected',
    });

    res.json({
      message: 'Report rejected',
      report,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getApprovedReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reports = await EmissionReport.find({ status: 'approved' })
      .populate('companyId', 'email companyName')
      .populate('reviewedBy', 'email')
      .sort({ reviewedAt: -1 });

    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
