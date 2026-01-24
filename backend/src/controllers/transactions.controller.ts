import { Response } from 'express';
import { Transaction } from '../models/Transaction';
import { AuthRequest } from '../middleware/auth.middleware';

export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query: any = {
      $or: [
        { fromUserId: req.user?.id },
        { toUserId: req.user?.id },
      ],
    };

    // Filter by type if provided
    if (req.query.type) {
      query.type = req.query.type;
    }

    const transactions = await Transaction.find(query)
      .populate('fromUserId', 'email companyName')
      .populate('toUserId', 'email companyName')
      .populate('creditId', 'creditId amount')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTransactionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findById(id)
      .populate('fromUserId', 'email companyName')
      .populate('toUserId', 'email companyName')
      .populate('creditId', 'creditId amount');

    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    // Check if user is involved in transaction
    const isFromUser = transaction.fromUserId?.toString() === req.user?.id;
    const isToUser = transaction.toUserId?.toString() === req.user?.id;

    if (!isFromUser && !isToUser) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.json(transaction);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
