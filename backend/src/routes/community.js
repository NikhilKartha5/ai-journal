import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { createPost, getFeed, likePost } from '../controllers/communityController.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getFeed);
router.post('/', createPost);
router.post('/:id/like', likePost);

export default router;
