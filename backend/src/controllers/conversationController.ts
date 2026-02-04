import { Response } from 'express';
import prisma from '../utils/prisma';
import aiService from '../services/aiService';
import { AuthRequest } from '../types';
import { NotFoundError, ForbiddenError, BadRequestError } from '../middleware/errorHandler';

// Helper function to verify notebook ownership
const verifyNotebookOwnership = async (
  notebookId: string,
  userId: string
): Promise<void> => {
  const notebook = await prisma.notebook.findUnique({
    where: { id: notebookId },
  });

  if (!notebook) {
    throw new NotFoundError('Notebook');
  }

  if (notebook.userId !== userId) {
    throw new ForbiddenError();
  }
};

// Helper function to get conversation with ownership check
const getConversationWithOwnershipCheck = async (
  conversationId: string,
  userId: string
) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new NotFoundError('Conversation');
  }

  await verifyNotebookOwnership(conversation.notebookId, userId);

  return conversation;
};

export const createConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const notebookId = req.params.notebookId as string;

  await verifyNotebookOwnership(notebookId, userId);

  const conversation = await prisma.conversation.create({
    data: { notebookId },
  });

  res.status(201).json({ conversation });
};

export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const notebookId = req.params.notebookId as string;

  await verifyNotebookOwnership(notebookId, userId);

  const conversations = await prisma.conversation.findMany({
    where: { notebookId },
    orderBy: { updatedAt: 'desc' },
    include: {
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  res.json({ conversations });
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const id = req.params.id as string;

  await getConversationWithOwnershipCheck(id, userId);

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: 'asc' },
  });

  res.json({ messages });
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const id = req.params.id as string;
  const { content } = req.body;

  if (!content) {
    throw new BadRequestError('Message content is required');
  }

  const conversation = await getConversationWithOwnershipCheck(id, userId);

  // Save user message
  const userMessage = await prisma.message.create({
    data: {
      conversationId: id,
      role: 'user',
      content,
    },
  });

  // Get sources for this notebook
  const sources = await prisma.source.findMany({
    where: { notebookId: conversation.notebookId },
  });

  if (sources.length === 0) {
    const noSourcesMessage = await prisma.message.create({
      data: {
        conversationId: id,
        role: 'assistant',
        content: 'Please upload some source documents first before asking questions.',
      },
    });

    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    res.status(201).json({
      userMessage,
      assistantMessage: noSourcesMessage,
    });
    return;
  }

  // Get conversation history
  const previousMessages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: 'asc' },
  });

  // Generate AI response
  let aiResponse: string;
  try {
    aiResponse = await aiService.generateAnswer(
      content,
      sources,
      previousMessages.slice(0, -1) // Exclude the just-added user message
    );
  } catch (error) {
    console.error('AI Service error:', error);
    aiResponse = 'Sorry, I encountered an error processing your question. Please try again.';
  }

  // Save assistant message
  const assistantMessage = await prisma.message.create({
    data: {
      conversationId: id,
      role: 'assistant',
      content: aiResponse,
    },
  });

  // Update conversation timestamp
  await prisma.conversation.update({
    where: { id },
    data: { updatedAt: new Date() },
  });

  res.status(201).json({
    userMessage,
    assistantMessage,
  });
};

export const deleteConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const id = req.params.id as string;

  await getConversationWithOwnershipCheck(id, userId);

  await prisma.conversation.delete({
    where: { id },
  });

  res.json({ message: 'Conversation deleted successfully' });
};
