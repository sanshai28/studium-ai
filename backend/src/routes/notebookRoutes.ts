import { Router } from 'express';
import {
  getAllNotebooks,
  getNotebook,
  createNotebook,
  updateNotebook,
  deleteNotebook,
} from '../controllers/notebookController';
import { authenticate } from '../middleware/authMiddleware';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validate';
import {
  createNotebookSchema,
  updateNotebookSchema,
  notebookIdParamSchema,
} from '../validators';

const router = Router();

router.get('/', authenticate, asyncHandler(getAllNotebooks));

router.get(
  '/:id',
  authenticate,
  validate(notebookIdParamSchema),
  asyncHandler(getNotebook)
);

router.post(
  '/',
  authenticate,
  validate(createNotebookSchema),
  asyncHandler(createNotebook)
);

router.put(
  '/:id',
  authenticate,
  validate(updateNotebookSchema),
  asyncHandler(updateNotebook)
);

router.delete(
  '/:id',
  authenticate,
  validate(notebookIdParamSchema),
  asyncHandler(deleteNotebook)
);

export default router;
