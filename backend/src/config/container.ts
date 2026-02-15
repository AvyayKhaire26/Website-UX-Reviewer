import dotenv from 'dotenv';

import { ScraperService } from '../services/ScraperService';
import { LLMService } from '../services/LLMService';
import { ReviewService } from '../services/ReviewService';
import { ReviewRepository } from '../repositories/ReviewRepository';
import { ReviewController } from '../controllers/ReviewController';
import { HealthController } from '../controllers/HealthController';

dotenv.config();
// Initialize all dependencies
const scraperService = new ScraperService();
const llmService = new LLMService();
const reviewRepository = new ReviewRepository();

// Inject dependencies into ReviewService
const reviewService = new ReviewService(
  scraperService,
  llmService,
  reviewRepository
);

// Inject dependencies into Controllers
export const reviewController = new ReviewController(reviewService);
export const healthController = new HealthController(llmService, reviewRepository);
