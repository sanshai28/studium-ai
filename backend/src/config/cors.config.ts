import { CorsOptions } from 'cors';

const allowedOrigins = [
  'http://localhost:3000', // Web development
  'http://localhost:5173', // Vite default port
  'https://studium-ai.com', // Production web
  'https://www.studium-ai.com', // Production web with www
  'capacitor://localhost', // iOS app
  'ionic://localhost', // Ionic app
  'http://localhost', // Android local
  // Add your production mobile app schemes here
];

// Allow all localhost ports for development
const isLocalhost = (origin: string) => {
  return origin?.includes('localhost') || origin?.includes('127.0.0.1');
};

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in allowed list or is localhost in development
    if (
      allowedOrigins.includes(origin) ||
      (process.env.NODE_ENV === 'development' && isLocalhost(origin))
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Client-Type', // To identify web/mobile/tablet
    'X-App-Version', // For version compatibility
    'X-Device-ID', // For device tracking
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'], // For pagination
  maxAge: 86400, // 24 hours
};

export default corsOptions;
