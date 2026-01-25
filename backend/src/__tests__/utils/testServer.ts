import express from 'express';
import cors from 'cors';
import authRoutes from '../../routes/authRoutes';

export const createTestServer = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
  });

  return app;
};
