import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import corsOptions from './config/cors.config';
import clientDetection from './middleware/clientDetection';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS - configured for web, mobile, and tablet apps
app.use(cors(corsOptions));

// Body parser - limit payload size for mobile networks
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Client detection middleware - detects web/mobile/tablet
app.use(clientDetection);

// API v1 routes
app.use('/api/v1/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API version info
app.get('/api/version', (req, res) => {
  res.json({
    version: '1.0.0',
    apiVersions: ['v1'],
    supportedPlatforms: ['web', 'ios', 'android', 'tablet'],
  });
});

// Backwards compatibility - redirect /api/auth to /api/v1/auth
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
