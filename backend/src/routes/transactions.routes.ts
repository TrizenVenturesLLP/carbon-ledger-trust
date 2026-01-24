import { Router } from 'express';
import { getTransactions, getTransactionById } from '../controllers/transactions.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Company routes
router.get('/', authorize('company'), getTransactions);
router.get('/:id', authorize('company'), getTransactionById);

export default router;
