import { Router } from 'express';
import { validate } from '../middleware/validateMiddleware';
import { authenticateToken } from '../middleware/authMiddleware';
import { RegisterUserDto, LoginUserDto } from '../dtos/userDto';
import * as userController from '../controllers/userController';

const router = Router();

router.post('/register', validate(RegisterUserDto), userController.register);
router.post('/login', validate(LoginUserDto), userController.login);
router.get('/profile', authenticateToken, userController.getProfile);

export default router;