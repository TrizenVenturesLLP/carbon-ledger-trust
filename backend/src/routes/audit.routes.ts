import { Router } from 'express';
import { getAuditLogs, getAuditStats } from '../controllers/audit.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication and regulator role
router.use(authenticate);
router.use(authorize('regulator', 'admin'));

router.get('/', getAuditLogs);
router.get('/stats', getAuditStats);

export default router;
