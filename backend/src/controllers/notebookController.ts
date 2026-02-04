import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../types';
import { NotFoundError, ForbiddenError, BadRequestError } from '../middleware/errorHandler';

export const getAllNotebooks = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;

  const notebooks = await prisma.notebook.findMany({
    where: { userId },
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
};

export const getNotebook = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const id = req.params.id as string;

  const notebook = await prisma.notebook.findUnique({
    where: { id },
  });

  if (!notebook) {
    throw new NotFoundError('Notebook');
  }

  if (notebook.userId !== userId) {
    throw new ForbiddenError();
  }

  res.json({ notebook });
};

export const createNotebook = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { title, content = '' } = req.body;

  if (!title) {
    throw new BadRequestError('Title is required');
  }

  const notebook = await prisma.notebook.create({
    data: {
      title,
      content,
      userId,
    },
  });

  res.status(201).json({ notebook });
};

export const updateNotebook = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const id = req.params.id as string;
  const { title, content } = req.body;

  const notebook = await prisma.notebook.findUnique({
    where: { id },
  });

  if (!notebook) {
    throw new NotFoundError('Notebook');
  }

  if (notebook.userId !== userId) {
    throw new ForbiddenError();
  }

  const updatedNotebook = await prisma.notebook.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
    },
  });

  res.json({ notebook: updatedNotebook });
};

export const deleteNotebook = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const id = req.params.id as string;

  const notebook = await prisma.notebook.findUnique({
    where: { id },
  });

  if (!notebook) {
    throw new NotFoundError('Notebook');
  }

  if (notebook.userId !== userId) {
    throw new ForbiddenError();
  }

  await prisma.notebook.delete({
    where: { id },
  });

  res.json({ message: 'Notebook deleted successfully' });
};
