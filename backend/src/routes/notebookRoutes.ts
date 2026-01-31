import { Router } from 'express';
import {
  getAllNotebooks,
  getNotebook,
  createNotebook,
  updateNotebook,
  deleteNotebook,
} from '../controllers/notebookController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticate, getAllNotebooks);
router.get('/:id', authenticate, getNotebook);
router.post('/', authenticate, createNotebook);
router.put('/:id', authenticate, updateNotebook);
router.delete('/:id', authenticate, deleteNotebook);

export default router;
