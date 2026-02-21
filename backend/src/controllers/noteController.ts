import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../types';
import { NotFoundError, ForbiddenError } from '../middleware/errorHandler';

const verifyNotebookOwnership = async (notebookId: string, userId: string): Promise<void> => {
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

export const getNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const notebookId = req.params.notebookId as string;

  await verifyNotebookOwnership(notebookId, userId);

  const notes = await prisma.note.findMany({
    where: { notebookId },
    orderBy: { order: 'asc' },
  });

  res.json({ notes });
};

export const createNote = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const notebookId = req.params.notebookId as string;

  await verifyNotebookOwnership(notebookId, userId);

  const { title = 'Untitled Note', content = '' } = req.body;

  const maxOrder = await prisma.note.aggregate({
    where: { notebookId },
    _max: { order: true },
  });
  const newOrder = (maxOrder._max.order ?? -1) + 1;

  const note = await prisma.note.create({
    data: { title, content, order: newOrder, notebookId },
  });

  res.status(201).json({ note });
};

export const updateNote = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const notebookId = req.params.notebookId as string;
  const noteId = req.params.noteId as string;

  await verifyNotebookOwnership(notebookId, userId);

  const note = await prisma.note.findFirst({
    where: { id: noteId, notebookId },
  });

  if (!note) {
    throw new NotFoundError('Note');
  }

  const { title, content } = req.body;
  const updated = await prisma.note.update({
    where: { id: noteId },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
    },
  });

  res.json({ note: updated });
};

export const deleteNote = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const notebookId = req.params.notebookId as string;
  const noteId = req.params.noteId as string;

  await verifyNotebookOwnership(notebookId, userId);

  const note = await prisma.note.findFirst({
    where: { id: noteId, notebookId },
  });

  if (!note) {
    throw new NotFoundError('Note');
  }

  await prisma.note.delete({ where: { id: noteId } });

  res.json({ message: 'Note deleted successfully' });
};

export const reorderNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const notebookId = req.params.notebookId as string;

  await verifyNotebookOwnership(notebookId, userId);

  const { noteIds } = req.body as { noteIds: string[] };

  await prisma.$transaction(
    noteIds.map((id, index) =>
      prisma.note.update({ where: { id }, data: { order: index } })
    )
  );

  const notes = await prisma.note.findMany({
    where: { notebookId },
    orderBy: { order: 'asc' },
  });

  res.json({ notes });
};
