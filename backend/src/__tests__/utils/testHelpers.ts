import prisma from '../../utils/prisma';

export const clearDatabase = async () => {
  await prisma.notebook.deleteMany({});
  await prisma.user.deleteMany({});
};

export const createTestUser = async (
  email: string = 'test@example.com',
  password: string = 'password123',
  name?: string
) => {
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash(password, 10);

  return await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });
};

export const generateValidToken = (userId: string) => {
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

export const createTestNotebook = async (
  userId: string,
  title: string = 'Test Notebook',
  content: string = 'Test content'
) => {
  return await prisma.notebook.create({
    data: {
      title,
      content,
      userId,
    },
  });
};
