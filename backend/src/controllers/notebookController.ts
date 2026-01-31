import { Request, Response } from 'express';
import prisma from '../utils/prisma';

interface AuthRequest extends Request {
  userId?: string;
}

export const getAllNotebooks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const notebooks = await prisma.notebook.findMany({
      where: { userId: userId! },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ notebooks });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getNotebook = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const notebook = await prisma.notebook.findUnique({
      where: { id: id as string },
    });

    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }

    if (notebook.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ notebook });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createNotebook = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { title, content } = req.body;

    console.log('createNotebook called:', { userId, title, content });

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const notebook = await prisma.notebook.create({
      data: {
        title,
        content,
        userId: userId!,
      },
    });

    console.log('Notebook created successfully:', notebook.id);
    res.status(201).json({ notebook });
  } catch (error) {
    console.error('Error creating notebook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateNotebook = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { title, content } = req.body;

    const notebook = await prisma.notebook.findUnique({
      where: { id: id as string },
    });

    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }

    if (notebook.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedNotebook = await prisma.notebook.update({
      where: { id: id as string },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
      },
    });

    res.json({ notebook: updatedNotebook });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteNotebook = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const notebook = await prisma.notebook.findUnique({
      where: { id: id as string },
    });

    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }

    if (notebook.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.notebook.delete({
      where: { id: id as string },
    });

    res.json({ message: 'Notebook deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
