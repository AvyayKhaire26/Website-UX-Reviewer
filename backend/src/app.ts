import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config, initializeDatabase, logger, reviewController, healthController } from './config';
import { createReviewRoutes, createHealthRoutes } from './routes';
import path from 'path';

const app: Application = express();

// Helmet with CORS support
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Simple CORS - Just whitelist both URLs
const allowedOrigins = [
  'http://localhost:5173',
  'https://website-ux-reviewer.vercel.app'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// CORS middleware for static files (screenshots)
app.use('/screenshots', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

// Serve screenshots as static files
app.use('/screenshots', express.static(path.join(__dirname, '../screenshots')));

// Routes
app.use('/api/v1', createReviewRoutes(reviewController));
app.use('/api/v1', createHealthRoutes(healthController));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Website UX Reviewer API',
    version: '1.0.0',
    endpoints: {
      health: '/api/v1/health',
      createReview: 'POST /api/v1/review',
      getReviews: 'GET /api/v1/reviews',
      getReviewById: 'GET /api/v1/review/:id'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`CORS: Allowing ${allowedOrigins.join(', ')}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();

export default app;
