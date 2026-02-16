import { IReviewService } from '../interfaces/IReviewService';
import { IScraperService } from '../interfaces/IScraperService';
import { ILLMService } from '../interfaces/ILLMService';
import { ReviewRepository } from '../repositories/ReviewRepository';
import { IReviewResponse } from '../interfaces/IReview';
import { logger } from '../config';
import fs from 'fs';
import path from 'path';

export class ReviewService implements IReviewService {
  constructor(
    private scraperService: IScraperService,
    private llmService: ILLMService,
    private reviewRepository: ReviewRepository
  ) {}

  async createReview(url: string): Promise<IReviewResponse> {
    try {
      logger.info(`Creating review for URL: ${url}`);

      const extractedContent = await this.scraperService.scrapeWebsite(url);
      const screenshotPath = await this.scraperService.captureScreenshot(url);

      // Read screenshot and convert to base64
      const screenshotBuffer = fs.readFileSync(screenshotPath);
      const screenshotBase64 = screenshotBuffer.toString('base64');

      const { issues, topThreeIssues, score } = await this.llmService.generateUXReview(extractedContent);

      const review = await this.reviewRepository.create({
        url,
        title: extractedContent.title,
        score,
        issues,
        topThreeIssues,
        extractedContent,
        screenshotPath, // Keep path for database
      });

      await this.reviewRepository.deleteOldestIfMoreThanFive();

      logger.info(`Review created successfully with ID: ${review.id}`);

      // Return with base64 screenshot
      return {
        id: review.id,
        url: review.url,
        title: review.title,
        score: review.score,
        issues: review.issues,
        topThreeIssues: review.topThreeIssues,
        extractedContent: review.extractedContent,
        screenshotPath: `data:image/png;base64,${screenshotBase64}`, // Return as base64
        createdAt: review.createdAt,
      };

    } catch (error) {
      logger.error('Error creating review', error);
      throw error;
    }
  }

  async getReviewById(id: string): Promise<IReviewResponse | null> {
    try {
      logger.info(`Fetching review with ID: ${id}`);
      const review = await this.reviewRepository.findById(id);

      if (!review) {
        return null;
      }

      // Convert screenshot to base64
      let screenshotBase64 = '';
      if (review.screenshotPath && fs.existsSync(review.screenshotPath)) {
        const screenshotBuffer = fs.readFileSync(review.screenshotPath);
        screenshotBase64 = `data:image/png;base64,${screenshotBuffer.toString('base64')}`;
      }

      return {
        id: review.id,
        url: review.url,
        title: review.title,
        score: review.score,
        issues: review.issues,
        topThreeIssues: review.topThreeIssues,
        extractedContent: review.extractedContent,
        screenshotPath: screenshotBase64,
        createdAt: review.createdAt,
      };

    } catch (error) {
      logger.error('Error fetching review by ID', error);
      throw error;
    }
  }

  async getLastFiveReviews(): Promise<IReviewResponse[]> {
    try {
      logger.info('Fetching last 5 reviews');
      const reviews = await this.reviewRepository.findLastFive();

      return reviews.map((review) => {
        // Convert screenshot to base64
        let screenshotBase64 = '';
        if (review.screenshotPath && fs.existsSync(review.screenshotPath)) {
          const screenshotBuffer = fs.readFileSync(review.screenshotPath);
          screenshotBase64 = `data:image/png;base64,${screenshotBuffer.toString('base64')}`;
        }

        return {
          id: review.id,
          url: review.url,
          title: review.title,
          score: review.score,
          issues: review.issues,
          topThreeIssues: review.topThreeIssues,
          extractedContent: review.extractedContent,
          screenshotPath: screenshotBase64,
          createdAt: review.createdAt,
        };
      });

    } catch (error) {
      logger.error('Error fetching last 5 reviews', error);
      throw error;
    }
  }
}
