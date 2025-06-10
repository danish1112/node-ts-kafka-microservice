import { Router } from 'express';
import { validate } from '../middleware/validateMiddleware';
import { authenticateToken } from '../middleware/authMiddleware';
import { CreateNotificationDto } from '../dtos/notificationDto';
import * as notificationController from '../controllers/notificationController';

const router = Router();

router.post('/', authenticateToken, validate(CreateNotificationDto), notificationController.createNotification);
router.get('/user', authenticateToken, notificationController.getNotificationsByUser);

export default router;