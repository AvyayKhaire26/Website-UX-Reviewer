import { IReviewService } from '../interfaces/IReviewService';
import { IScraperService } from '../interfaces/IScraperService';
import { ILLMService } from '../interfaces/ILLMService';
import { ReviewRepository } from '../repositories/ReviewRepository';
import { IReviewResponse } from '../interfaces/IReview';
import { logger } from '../config';

export class ReviewService implements IReviewService {
  constructor(
    private scraperService: IScraperService,
    private llmService: ILLMService,
    private reviewRepository: ReviewRepository
  ) {}

  async createReview(url: string): Promise<IReviewResponse> {
    try {
      logger.info(`Creating review for URL: ${url}`);

      // Step 1: Scrape website content
      const extractedContent = await this.scraperService.scrapeWebsite(url);

      // Step 2: Capture screenshot
      const screenshotPath = await this.scraperService.captureScreenshot(url);

      // Step 3: Generate UX review using LLM
      const { issues, topThreeIssues, score } = await this.llmService.generateUXReview(extractedContent);

      // Step 4: Save to database
      const review = await this.reviewRepository.create({
        url,
        title: extractedContent.title,
        score,
        issues,
        topThreeIssues,
        extractedContent,
        screenshotPath,
      });

      // Step 5: Delete old reviews if more than 5
      await this.reviewRepository.deleteOldestIfMoreThanFive();

      logger.info(`Review created successfully with ID: ${review.id}`);

      return {
        id: review.id,
        url: review.url,
        title: review.title,
        score: review.score,
        issues: review.issues,
        topThreeIssues: review.topThreeIssues,
        extractedContent: review.extractedContent,
        screenshotPath: review.screenshotPath,
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

      return {
        id: review.id,
        url: review.url,
        title: review.title,
        score: review.score,
        issues: review.issues,
        topThreeIssues: review.topThreeIssues,
        extractedContent: review.extractedContent,
        screenshotPath: review.screenshotPath,
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

      return reviews.map((review) => ({
        id: review.id,
        url: review.url,
        title: review.title,
        score: review.score,
        issues: review.issues,
        topThreeIssues: review.topThreeIssues,
        extractedContent: review.extractedContent,
        screenshotPath: review.screenshotPath,
        createdAt: review.createdAt,
      }));

    } catch (error) {
      logger.error('Error fetching last 5 reviews', error);
      throw error;
    }
  }
}
