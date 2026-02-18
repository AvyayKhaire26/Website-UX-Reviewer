import { Request, Response } from 'express';
import { IReviewService } from '../interfaces/IReviewService';
import { logger } from '../config';

export class ReviewController {
  constructor(private reviewService: IReviewService) {}

  async createReview(req: Request, res: Response): Promise<void> {
    try {
      const { url } = req.body;

      // No manual validation needed - middleware handles it!
      logger.info(`Received request to create review for: ${url}`);

      const review = await this.reviewService.createReview(url);

      res.status(201).json({
        success: true,
        data: review,
      });

    } catch (error: any) {
      logger.error('Error in createReview controller', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create review',
      });
    }
  }

  async getReviewById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };

      logger.info(`Received request to fetch review with ID: ${id}`);

      const review = await this.reviewService.getReviewById(id);

      if (!review) {
        res.status(404).json({
          success: false,
          error: 'Review not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: review,
      });

    } catch (error: any) {
      logger.error('Error in getReviewById controller', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch review',
      });
    }
  }

  async getLastFiveReviews(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Received request to fetch last 5 reviews');

      const reviews = await this.reviewService.getLastFiveReviews();

      res.status(200).json({
        success: true,
        data: reviews,
      });

    } catch (error: any) {
      logger.error('Error in getLastFiveReviews controller', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch reviews',
      });
    }
  }
}
