import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../utils/prisma';

interface AuthRequest extends Request {
  userId?: string;
}

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

export const uploadSource = async (req: AuthRequest, res: Response) => {
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

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
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
  } catch (error) {
    console.error('Error uploading source:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSources = async (req: AuthRequest, res: Response) => {
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

    const sources = await prisma.source.findMany({
      where: { notebookId },
      orderBy: { uploadedAt: 'desc' },
    });

    res.json({ sources });
  } catch (error) {
    console.error('Error getting sources:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteSource = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const id = req.params.id as string;

    const source = await prisma.source.findUnique({
      where: { id },
    });

    if (!source) {
      return res.status(404).json({ error: 'Source not found' });
    }

    // Check ownership via notebook
    const notebook = await prisma.notebook.findUnique({
      where: { id: source.notebookId },
    });

    if (!notebook || notebook.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../../uploads', source.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.source.delete({
      where: { id },
    });

    res.json({ message: 'Source deleted successfully' });
  } catch (error) {
    console.error('Error deleting source:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const downloadSource = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const id = req.params.id as string;

    const source = await prisma.source.findUnique({
      where: { id },
    });

    if (!source) {
      return res.status(404).json({ error: 'Source not found' });
    }

    // Check ownership via notebook
    const notebook = await prisma.notebook.findUnique({
      where: { id: source.notebookId },
    });

    if (!notebook || notebook.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const filePath = path.join(__dirname, '../../uploads', source.filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${source.fileName}"`);
    res.setHeader('Content-Type', source.fileType);
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error downloading source:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
