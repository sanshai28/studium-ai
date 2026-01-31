import express from 'express';
import cors from 'cors';
import authRoutes from '../../routes/authRoutes';
import notebookRoutes from '../../routes/notebookRoutes';

export const createTestServer = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Support both /api/auth and /api/v1/auth routes
  app.use('/api/auth', authRoutes);
  app.use('/api/v1/auth', authRoutes);

  // Support both /api/notebooks and /api/v1/notebooks routes
  app.use('/api/notebooks', notebookRoutes);
  app.use('/api/v1/notebooks', notebookRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
  });

  return app;
};
