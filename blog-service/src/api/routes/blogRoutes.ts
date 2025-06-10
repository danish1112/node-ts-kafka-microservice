import { Router } from 'express';
import { validate } from '../middleware/validateMiddleware';
import { authenticateToken } from '../middleware/authMiddleware';
import { CreateBlogDto, UpdateBlogDto } from '../dtos/blogDto';
import * as blogController from '../controllers/blogController';

const router = Router();

router.post('/', authenticateToken, validate(CreateBlogDto), blogController.createBlog);
router.get('/:id', blogController.getBlog);
router.put('/:id', authenticateToken, validate(UpdateBlogDto), blogController.updateBlog);
router.delete('/:id', authenticateToken, blogController.deleteBlog);

export default router;