import { Router } from 'express';
import {
  upload,
  uploadSource,
  getSources,
  deleteSource,
  downloadSource,
} from '../controllers/sourceController';
import { authenticate } from '../middleware/authMiddleware';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validate';
import { sourceParamsSchema, sourceIdParamSchema } from '../validators';

const router = Router();

router.post(
  '/notebooks/:notebookId/sources',
  authenticate,
  validate(sourceParamsSchema),
  upload.single('file'),
  asyncHandler(uploadSource)
);

router.get(
  '/notebooks/:notebookId/sources',
  authenticate,
  validate(sourceParamsSchema),
  asyncHandler(getSources)
);

router.delete(
  '/sources/:id',
  authenticate,
  validate(sourceIdParamSchema),
  asyncHandler(deleteSource)
);

router.get(
  '/sources/:id/download',
  authenticate,
  validate(sourceIdParamSchema),
  asyncHandler(downloadSource)
);

export default router;
