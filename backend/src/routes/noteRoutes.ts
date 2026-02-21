import { Router } from 'express';
import { getNotes, createNote, updateNote, deleteNote, reorderNotes } from '../controllers/noteController';
import { authenticate } from '../middleware/authMiddleware';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validate';
import {
  noteParamsSchema,
  noteIdParamsSchema,
  createNoteSchema,
  updateNoteSchema,
  reorderNotesSchema,
} from '../validators';

const router = Router();

router.get(
  '/notebooks/:notebookId/notes',
  authenticate,
  validate(noteParamsSchema),
  asyncHandler(getNotes)
);

router.post(
  '/notebooks/:notebookId/notes',
  authenticate,
  validate(createNoteSchema),
  asyncHandler(createNote)
);

// reorder must come BEFORE /:noteId to avoid "reorder" being parsed as a noteId
router.put(
  '/notebooks/:notebookId/notes/reorder',
  authenticate,
  validate(reorderNotesSchema),
  asyncHandler(reorderNotes)
);

router.put(
  '/notebooks/:notebookId/notes/:noteId',
  authenticate,
  validate(updateNoteSchema),
  asyncHandler(updateNote)
);

router.delete(
  '/notebooks/:notebookId/notes/:noteId',
  authenticate,
  validate(noteIdParamsSchema),
  asyncHandler(deleteNote)
);

export default router;
