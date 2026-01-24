import { Response } from 'express';
import { CarbonCredit } from '../models/CarbonCredit';
import { AuthRequest } from '../middleware/auth.middleware';

export const getCredits = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query: any = { currentOwner: req.user?.id };

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    const credits = await CarbonCredit.find(query)
      .populate('reportId', 'title reportId')
      .populate('companyId', 'email companyName')
      .populate('currentOwner', 'email companyName')
      .sort({ issuedAt: -1 });

    res.json(credits);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCreditById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const credit = await CarbonCredit.findById(id)
      .populate('reportId', 'title reportId')
      .populate('companyId', 'email companyName')
      .populate('currentOwner', 'email companyName')
      .populate('originalOwner', 'email companyName');

    if (!credit) {
      res.status(404).json({ error: 'Credit not found' });
      return;
    }

    // Check ownership
    if (credit.currentOwner.toString() !== req.user?.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.json(credit);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getWalletBalance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const activeCredits = await CarbonCredit.find({
      currentOwner: req.user?.id,
      status: 'active',
    });

    const totalActive = activeCredits.reduce((sum, credit) => sum + credit.amount, 0);

    const retiredCredits = await CarbonCredit.find({
      currentOwner: req.user?.id,
      status: 'retired',
    });

    const totalRetired = retiredCredits.reduce((sum, credit) => sum + credit.amount, 0);

    res.json({
      active: totalActive,
      retired: totalRetired,
      total: totalActive + totalRetired,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
