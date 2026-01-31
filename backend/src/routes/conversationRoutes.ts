import { Router } from 'express';
import {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
  deleteConversation,
} from '../controllers/conversationController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/notebooks/:notebookId/conversations', authenticate, createConversation);
router.get('/notebooks/:notebookId/conversations', authenticate, getConversations);
router.get('/conversations/:id/messages', authenticate, getMessages);
router.post('/conversations/:id/messages', authenticate, sendMessage);
router.delete('/conversations/:id', authenticate, deleteConversation);

export default router;
