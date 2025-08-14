import express from 'express';
import {
  createEntry,
  getEntries,
  getEntry,
  updateEntry,
  deleteEntry,
} from '../controllers/diaryController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createEntry);
router.get('/', getEntries);
router.get('/:id', getEntry);
router.put('/:id', updateEntry);
router.delete('/:id', deleteEntry);

export default router;
