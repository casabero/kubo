import { Router } from 'express';
import { ExamController } from '../controllers/exam.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Student routes
router.post('/start', authenticate, authorize(['STUDENT', 'TEACHER', 'ADMIN']), ExamController.startSession);
router.post('/answer', authenticate, authorize(['STUDENT', 'TEACHER', 'ADMIN']), ExamController.submitAnswer);

export default router;
