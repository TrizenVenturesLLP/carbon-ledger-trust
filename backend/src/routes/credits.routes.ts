import { Router } from 'express';
import { getCredits, getCreditById, getWalletBalance } from '../controllers/credits.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Company routes
router.get('/', authorize('company'), getCredits);
router.get('/wallet', authorize('company'), getWalletBalance);
router.get('/:id', authorize('company'), getCreditById);

export default router;
