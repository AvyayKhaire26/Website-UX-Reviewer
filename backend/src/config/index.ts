export { AppDataSource, initializeDatabase } from './database.config';
export { logger } from './logger.config';
export { reviewController, healthController } from './container';
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
};
