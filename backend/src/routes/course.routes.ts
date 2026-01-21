import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Only TEACHERS can manage courses
router.post('/', authenticate, authorize(['TEACHER', 'ADMIN']), CourseController.create);
router.get('/', authenticate, authorize(['TEACHER', 'ADMIN']), CourseController.getMyCourses);
router.get('/:id', authenticate, authorize(['TEACHER', 'ADMIN']), CourseController.getById);

export default router;
