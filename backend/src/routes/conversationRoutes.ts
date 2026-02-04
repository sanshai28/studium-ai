import { Router } from 'express';
import {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
  deleteConversation,
} from '../controllers/conversationController';
import { authenticate } from '../middleware/authMiddleware';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validate';
import {
  conversationParamsSchema,
  conversationIdParamSchema,
  sendMessageSchema,
} from '../validators';

const router = Router();

router.post(
  '/notebooks/:notebookId/conversations',
  authenticate,
  validate(conversationParamsSchema),
  asyncHandler(createConversation)
);

router.get(
  '/notebooks/:notebookId/conversations',
  authenticate,
  validate(conversationParamsSchema),
  asyncHandler(getConversations)
);

router.get(
  '/conversations/:id/messages',
  authenticate,
  validate(conversationIdParamSchema),
  asyncHandler(getMessages)
);

router.post(
  '/conversations/:id/messages',
  authenticate,
  validate(sendMessageSchema),
  asyncHandler(sendMessage)
);

router.delete(
  '/conversations/:id',
  authenticate,
  validate(conversationIdParamSchema),
  asyncHandler(deleteConversation)
);

export default router;
