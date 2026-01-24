import { Router } from 'express';
import { submitReport, getReports, getReportById, uploadDocuments } from '../controllers/reports.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { upload } from '../services/file.service';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Company routes
router.post('/', authorize('company'), upload.array('documents', 10), submitReport);
router.get('/', getReports);
router.get('/:id', getReportById);
router.post('/:id/documents', authorize('company'), upload.array('documents', 10), uploadDocuments);

export default router;
