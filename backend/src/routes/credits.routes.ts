import { Router } from 'express';
import { getCredits, getCreditById, getWalletBalance, transferCredit, retireCredit } from '../controllers/credits.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Company routes
router.get('/', authorize('company'), getCredits);
router.get('/wallet', authorize('company'), getWalletBalance);
router.get('/:id', authorize('company'), getCreditById);
router.post('/:id/transfer', authorize('company'), transferCredit);
router.post('/:id/retire', authorize('company'), retireCredit);

export default router;
