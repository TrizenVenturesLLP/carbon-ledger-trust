import { Response } from 'express';
import { AuditLog } from '../models/AuditLog';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query: any = {};

    // Filter by action if provided
    if (req.query.action) {
      query.action = req.query.action;
    }

    // Filter by verifier if provided
    if (req.query.verifierId) {
      query.verifierId = req.query.verifierId;
    }

    const logs = await AuditLog.find(query)
      .populate('reportId', 'reportId title')
      .populate('companyId', 'email companyName')
      .populate('verifierId', 'email')
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAuditStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const total = await AuditLog.countDocuments();
    const approved = await AuditLog.countDocuments({ action: 'approved' });
    const rejected = await AuditLog.countDocuments({ action: 'rejected' });
    const reviewed = await AuditLog.countDocuments({ action: 'reviewed' });

    const creditsIssued = await AuditLog.aggregate([
      { $match: { creditsIssued: { $exists: true, $ne: null } } },
      { $group: { _id: null, total: { $sum: '$creditsIssued' } } },
    ]);

    res.json({
      total,
      approved,
      rejected,
      reviewed,
      creditsIssued: creditsIssued[0]?.total || 0,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
