import { Router } from 'express';
import { GroupController } from '../controllers/group.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, authorize(['TEACHER', 'ADMIN']), GroupController.create);
router.get('/course/:courseId', authenticate, authorize(['TEACHER', 'ADMIN']), GroupController.getByCourse);

export default router;
