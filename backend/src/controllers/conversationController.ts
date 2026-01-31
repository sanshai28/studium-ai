import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import aiService from '../services/aiService';

interface AuthRequest extends Request {
  userId?: string;
}

export const createConversation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const notebookId = req.params.notebookId as string;

    const notebook = await prisma.notebook.findUnique({
      where: { id: notebookId },
    });

    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }

    if (notebook.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const conversation = await prisma.conversation.create({
      data: { notebookId },
    });

    res.status(201).json({ conversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const notebookId = req.params.notebookId as string;

    const notebook = await prisma.notebook.findUnique({
      where: { id: notebookId },
    });

    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }

    if (notebook.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

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
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const id = req.params.id as string;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Check ownership via notebook
    const notebook = await prisma.notebook.findUnique({
      where: { id: conversation.notebookId },
    });

    if (!notebook || notebook.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ messages });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const id = req.params.id as string;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Check ownership via notebook
    const notebook = await prisma.notebook.findUnique({
      where: { id: conversation.notebookId },
    });

    if (!notebook || notebook.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

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

      return res.status(201).json({
        userMessage,
        assistantMessage: noSourcesMessage,
      });
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
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteConversation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const id = req.params.id as string;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Check ownership via notebook
    const notebook = await prisma.notebook.findUnique({
      where: { id: conversation.notebookId },
    });

    if (!notebook || notebook.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.conversation.delete({
      where: { id },
    });

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
