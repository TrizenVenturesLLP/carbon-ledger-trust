import { Router } from 'express';
import {
  getPendingReviews,
  getReviewById,
  approveReport,
  rejectReport,
  getApprovedReports,
} from '../controllers/reviews.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication and regulator role
router.use(authenticate);
router.use(authorize('regulator', 'admin'));

router.get('/pending', getPendingReviews);
router.get('/approved', getApprovedReports);
router.get('/:id', getReviewById);
router.post('/:id/approve', approveReport);
router.post('/:id/reject', rejectReport);

export default router;
