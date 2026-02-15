import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { logger } from './logger.config';
import { Review } from '../entities/Review.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '6543'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'postgres',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [Review],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: [],
  ssl: { rejectUnauthorized: false },
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    logger.info('Database connected');
  } catch (error) {
    logger.error('Database connection failed', error);
    process.exit(1);
  }
};
