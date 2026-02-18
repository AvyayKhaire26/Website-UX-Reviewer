import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config, initializeDatabase, logger, reviewController, healthController } from './config';
import { createReviewRoutes, createHealthRoutes } from './routes';
import path from 'path';
import fs from 'fs';
import { apiLimiter, reviewLimiter } from './middleware/rateLimiter';

const app: Application = express();

// Configure helmet
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Simple CORS
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

// Rate limiting
app.use('/api/', apiLimiter);
app.post('/api/v1/review', reviewLimiter);

// API endpoint to serve screenshots (FULL CONTROL over headers)
app.get('/screenshots/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, '../screenshots', filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Screenshot not found' });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000');

    res.sendFile(filepath);
  } catch (error) {
    logger.error('Error serving screenshot', error);
    res.status(500).json({ error: 'Failed to serve screenshot' });
  }
});

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
      getReviewById: 'GET /api/v1/review/:id',
      screenshot: 'GET /screenshots/:filename'
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
