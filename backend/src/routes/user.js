import express from 'express';
import { getUser, updateUser } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getUser);
router.put('/', updateUser);

export default router;
