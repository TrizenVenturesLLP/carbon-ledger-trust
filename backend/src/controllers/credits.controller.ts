import { Response } from 'express';
import { CarbonCredit } from '../models/CarbonCredit';
import { Transaction } from '../models/Transaction';
import { User } from '../models/User';
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

export const transferCredit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { toWalletAddress, blockchainTxHash } = req.body;

    if (!toWalletAddress || !blockchainTxHash) {
      res.status(400).json({ error: 'Recipient wallet address and blockchainTxHash are required' });
      return;
    }

    // Validate wallet address format (basic check)
    if (!toWalletAddress.startsWith('0x') || toWalletAddress.length !== 42) {
      res.status(400).json({ error: 'Invalid wallet address format' });
      return;
    }

    const credit = await CarbonCredit.findById(id);

    if (!credit) {
      res.status(404).json({ error: 'Credit not found' });
      return;
    }

    // Check ownership
    if (credit.currentOwner.toString() !== req.user?.id) {
      res.status(403).json({ error: 'You do not own this credit' });
      return;
    }

    // Check if credit is active
    if (credit.status !== 'active') {
      res.status(400).json({ error: 'Only active credits can be transferred' });
      return;
    }

    // Check if user has wallet address
    const currentUser = await User.findById(req.user?.id);
    if (!currentUser?.walletAddress) {
      res.status(400).json({ error: 'Your wallet address is not linked. Please link your wallet first.' });
      return;
    }

    // Find recipient user by wallet address
    const recipientUser = await User.findOne({ walletAddress: toWalletAddress.toLowerCase() });
    if (!recipientUser) {
      res.status(404).json({ error: 'Recipient not found. The wallet address must be linked to a registered user.' });
      return;
    }

    // Cannot transfer to self
    if (recipientUser._id.toString() === req.user?.id) {
      res.status(400).json({ error: 'Cannot transfer credits to yourself' });
      return;
    }

    // Update credit ownership
    credit.currentOwner = recipientUser._id as any;
    credit.status = 'transferred';
    await credit.save();

    // Create transaction record
    await Transaction.create({
      type: 'transferred',
      fromUserId: req.user?.id as any,
      toUserId: recipientUser._id,
      creditId: credit._id,
      amount: credit.amount,
      blockchainTxHash,
      status: 'confirmed',
      confirmedAt: new Date(),
    });

    res.json({
      message: 'Credit transferred successfully',
      credit,
      blockchainTxHash,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const retireCredit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { retirementReason, blockchainTxHash } = req.body;

    if (!retirementReason || !blockchainTxHash) {
      res.status(400).json({ error: 'Retirement reason and blockchainTxHash are required' });
      return;
    }

    const credit = await CarbonCredit.findById(id);

    if (!credit) {
      res.status(404).json({ error: 'Credit not found' });
      return;
    }

    // Check ownership
    if (credit.currentOwner.toString() !== req.user?.id) {
      res.status(403).json({ error: 'You do not own this credit' });
      return;
    }

    // Check if credit is active
    if (credit.status !== 'active') {
      res.status(400).json({ error: 'Only active credits can be retired' });
      return;
    }

    // Update credit status
    credit.status = 'retired';
    credit.retiredAt = new Date();
    credit.retirementReason = retirementReason;
    credit.blockchainTxHash = blockchainTxHash;
    await credit.save();

    // Create transaction record
    await Transaction.create({
      type: 'retired',
      fromUserId: req.user?.id as any,
      creditId: credit._id,
      amount: credit.amount,
      retirementReason,
      blockchainTxHash,
      status: 'confirmed',
      confirmedAt: new Date(),
    });

    res.json({
      message: 'Credit retired successfully',
      credit,
      blockchainTxHash,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
