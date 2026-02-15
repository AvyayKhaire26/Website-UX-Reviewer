import { Repository } from 'typeorm';
import { AppDataSource } from '../config';
import { Review } from '../entities/Review.entity';
import { logger } from '../config';

export class ReviewRepository {
  private repository: Repository<Review>;

  constructor() {
    this.repository = AppDataSource.getRepository(Review);
  }

  async create(reviewData: Partial<Review>): Promise<Review> {
    try {
      const review = this.repository.create(reviewData);
      return await this.repository.save(review);
    } catch (error) {
      logger.error('Error creating review in repository', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Review | null> {
    try {
      return await this.repository.findOne({ where: { id } });
    } catch (error) {
      logger.error('Error finding review by id', error);
      throw error;
    }
  }

  async findLastFive(): Promise<Review[]> {
    try {
      return await this.repository.find({
        order: { createdAt: 'DESC' },
        take: 5,
      });
    } catch (error) {
      logger.error('Error finding last 5 reviews', error);
      throw error;
    }
  }

  async deleteOldestIfMoreThanFive(): Promise<void> {
    try {
      const count = await this.repository.count();
      if (count > 5) {
        const oldest = await this.repository.find({
          order: { createdAt: 'ASC' },
          take: count - 5,
        });
        await this.repository.remove(oldest);
      }
    } catch (error) {
      logger.error('Error deleting old reviews', error);
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      await this.repository.query('SELECT 1');
      return true;
    } catch (error) {
      logger.error('Database health check failed', error);
      return false;
    }
  }
}
