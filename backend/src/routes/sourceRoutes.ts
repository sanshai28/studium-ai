import { Router } from 'express';
import {
  upload,
  uploadSource,
  getSources,
  deleteSource,
  downloadSource,
} from '../controllers/sourceController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/notebooks/:notebookId/sources', authenticate, upload.single('file'), uploadSource);
router.get('/notebooks/:notebookId/sources', authenticate, getSources);
router.delete('/sources/:id', authenticate, deleteSource);
router.get('/sources/:id/download', authenticate, downloadSource);

export default router;
