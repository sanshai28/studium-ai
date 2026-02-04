import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../utils/prisma';
import { AuthRequest } from '../types';
import { NotFoundError, ForbiddenError, BadRequestError } from '../middleware/errorHandler';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'image/png',
  'image/jpeg',
  'image/jpg',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const notebookId = req.params.notebookId as string;
    const uploadPath = path.join(__dirname, '../../uploads', notebookId);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

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

export const uploadSource = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const notebookId = req.params.notebookId as string;

  await verifyNotebookOwnership(notebookId, userId);

  if (!req.file) {
    throw new BadRequestError('No file uploaded');
  }

  const source = await prisma.source.create({
    data: {
      notebookId,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      filePath: path.join(notebookId, req.file.filename),
    },
  });

  res.status(201).json({ source });
};

export const getSources = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const notebookId = req.params.notebookId as string;

  await verifyNotebookOwnership(notebookId, userId);

  const sources = await prisma.source.findMany({
    where: { notebookId },
    orderBy: { uploadedAt: 'desc' },
  });

  res.json({ sources });
};

export const deleteSource = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const id = req.params.id as string;

  const source = await prisma.source.findUnique({
    where: { id },
  });

  if (!source) {
    throw new NotFoundError('Source');
  }

  await verifyNotebookOwnership(source.notebookId, userId);

  // Delete file from filesystem
  const filePath = path.join(__dirname, '../../uploads', source.filePath);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await prisma.source.delete({
    where: { id },
  });

  res.json({ message: 'Source deleted successfully' });
};

export const downloadSource = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const id = req.params.id as string;

  const source = await prisma.source.findUnique({
    where: { id },
  });

  if (!source) {
    throw new NotFoundError('Source');
  }

  await verifyNotebookOwnership(source.notebookId, userId);

  const filePath = path.join(__dirname, '../../uploads', source.filePath);

  if (!fs.existsSync(filePath)) {
    throw new NotFoundError('File');
  }

  res.setHeader('Content-Disposition', `attachment; filename="${source.fileName}"`);
  res.setHeader('Content-Type', source.fileType);
  res.sendFile(filePath);
};
