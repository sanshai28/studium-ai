import express from 'express';
import cors from 'cors';
import authRoutes from '../../routes/authRoutes';

export const createTestServer = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Support both /api/auth and /api/v1/auth routes
  app.use('/api/auth', authRoutes);
  app.use('/api/v1/auth', authRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
  });

  return app;
};
