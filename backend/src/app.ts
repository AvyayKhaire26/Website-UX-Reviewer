import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config, initializeDatabase, logger, reviewController, healthController } from './config';
import { createReviewRoutes, createHealthRoutes } from './routes';

const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// Routes
app.use('/api/v1', createReviewRoutes(reviewController));
app.use('/api/v1', createHealthRoutes(healthController));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Website UX Reviewer API',
    version: '1.0.0',
    endpoints: {
      health: '/api/status',
      createReview: 'POST /api/review',
      getReviews: 'GET /api/reviews',
      getReviewById: 'GET /api/reviews/:id'
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
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();

export default app;
