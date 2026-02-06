import { Router } from 'express';
import { register, login, getMe, linkWallet, unlinkWallet } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.post('/link-wallet', authenticate, linkWallet);
router.post('/unlink-wallet', authenticate, unlinkWallet);

export default router;
