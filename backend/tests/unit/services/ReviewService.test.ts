import { ReviewService } from '../../../src/services/ReviewService';
import fs from 'fs';

// Mock fs module
jest.mock('fs', () => ({
  readFileSync: jest.fn().mockReturnValue(Buffer.from('fake-image-data')),
  existsSync: jest.fn().mockReturnValue(true),
}));

// Mock logger
jest.mock('../../../src/config', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

// --- Mock dependencies ---
const mockScraperService = {
  scrapeWebsite: jest.fn(),
  captureScreenshot: jest.fn(),
};

const mockLLMService = {
  generateUXReview: jest.fn(),
  checkHealth: jest.fn(),
};

const mockReviewRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findLastFive: jest.fn(),
  deleteOldestIfMoreThanFive: jest.fn(),
  checkHealth: jest.fn(),
};

// --- Shared test data ---
const mockExtractedContent = {
  title: 'Example Domain',
  headings: ['Example Heading'],
  forms: [],
  buttons: ['Learn More'],
  mainText: 'This is example content',
};

const mockLLMResult = {
  score: 72,
  issues: [
    {
      title: 'Poor contrast',
      description: 'Low contrast ratio',
      whyIssue: 'Hard to read',
      proof: { content: 'Gray on white' },
      category: 'accessibility',
    },
  ],
  topThreeIssues: [
    {
      title: 'Poor contrast',
      description: 'Low contrast ratio',
      beforeSuggestion: 'Gray text on white',
      afterSuggestion: 'Dark text on white',
    },
  ],
};

const mockSavedReview = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  url: 'https://example.com',
  title: 'Example Domain',
  score: 72,
  issues: mockLLMResult.issues,
  topThreeIssues: mockLLMResult.topThreeIssues,
  extractedContent: mockExtractedContent,
  screenshotPath: '/screenshots/screenshot_123.png',
  createdAt: new Date('2026-01-01'),
};

// --- Tests ---
describe('ReviewService', () => {
  let reviewService: ReviewService;

  beforeEach(() => {
    // Manually reset mocks without losing default implementations
    jest.clearAllMocks();

    // Re-set fs defaults after clearAllMocks
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('fake-image-data'));

    reviewService = new ReviewService(
      mockScraperService as any,
      mockLLMService as any,
      mockReviewRepository as any
    );
  });

  // ─── createReview ────────────────────────────────────────────

  describe('createReview', () => {
    beforeEach(() => {
      mockScraperService.scrapeWebsite.mockResolvedValue(mockExtractedContent);
      mockScraperService.captureScreenshot.mockResolvedValue('/screenshots/screenshot_123.png');
      mockLLMService.generateUXReview.mockResolvedValue(mockLLMResult);
      mockReviewRepository.create.mockResolvedValue(mockSavedReview);
      mockReviewRepository.deleteOldestIfMoreThanFive.mockResolvedValue(undefined);
    });

    it('should create a review successfully', async () => {
      const result = await reviewService.createReview('https://example.com');

      expect(result).toBeDefined();
      expect(result.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result.url).toBe('https://example.com');
      expect(result.score).toBe(72);
    });

    it('should return screenshot as base64 data URI', async () => {
      const result = await reviewService.createReview('https://example.com');

      expect(result.screenshotPath).toMatch(/^data:image\/png;base64,/);
    });

    it('should call scrapeWebsite with correct URL', async () => {
      await reviewService.createReview('https://example.com');

      expect(mockScraperService.scrapeWebsite).toHaveBeenCalledWith('https://example.com');
      expect(mockScraperService.scrapeWebsite).toHaveBeenCalledTimes(1);
    });

    it('should call generateUXReview with extracted content', async () => {
      await reviewService.createReview('https://example.com');

      expect(mockLLMService.generateUXReview).toHaveBeenCalledWith(mockExtractedContent);
    });

    it('should call deleteOldestIfMoreThanFive after creating review', async () => {
      await reviewService.createReview('https://example.com');

      expect(mockReviewRepository.deleteOldestIfMoreThanFive).toHaveBeenCalledTimes(1);
    });

    it('should throw error when scraper fails', async () => {
      mockScraperService.scrapeWebsite.mockRejectedValue(new Error('Scraper failed'));

      await expect(reviewService.createReview('https://example.com'))
        .rejects.toThrow('Scraper failed');
    });

    it('should throw error when LLM fails', async () => {
      mockLLMService.generateUXReview.mockRejectedValue(new Error('LLM unavailable'));

      await expect(reviewService.createReview('https://example.com'))
        .rejects.toThrow('LLM unavailable');
    });

    it('should throw error when repository fails', async () => {
      mockReviewRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(reviewService.createReview('https://example.com'))
        .rejects.toThrow('Database error');
    });
  });

  // ─── getReviewById ───────────────────────────────────────────

  describe('getReviewById', () => {
    it('should return review with base64 screenshot when found', async () => {
      mockReviewRepository.findById.mockResolvedValue(mockSavedReview);

      const result = await reviewService.getReviewById('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toBeDefined();
      expect(result?.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result?.screenshotPath).toMatch(/^data:image\/png;base64,/);
    });

    it('should return null when review not found', async () => {
      mockReviewRepository.findById.mockResolvedValue(null);

      const result = await reviewService.getReviewById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should return empty screenshotPath when file does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      mockReviewRepository.findById.mockResolvedValue(mockSavedReview);

      const result = await reviewService.getReviewById('123e4567-e89b-12d3-a456-426614174000');

      expect(result?.screenshotPath).toBe('');
    });

    it('should throw error when repository fails', async () => {
      mockReviewRepository.findById.mockRejectedValue(new Error('DB connection lost'));

      await expect(reviewService.getReviewById('some-id'))
        .rejects.toThrow('DB connection lost');
    });
  });

  // ─── getLastFiveReviews ──────────────────────────────────────

  describe('getLastFiveReviews', () => {
    it('should return list of reviews with base64 screenshots', async () => {
      mockReviewRepository.findLastFive.mockResolvedValue([mockSavedReview, mockSavedReview]);

      const result = await reviewService.getLastFiveReviews();

      expect(result).toHaveLength(2);
      expect(result[0].screenshotPath).toMatch(/^data:image\/png;base64,/);
    });

    it('should return empty array when no reviews exist', async () => {
      mockReviewRepository.findLastFive.mockResolvedValue([]);

      const result = await reviewService.getLastFiveReviews();

      expect(result).toEqual([]);
    });

    it('should handle missing screenshot files gracefully', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      mockReviewRepository.findLastFive.mockResolvedValue([mockSavedReview]);

      const result = await reviewService.getLastFiveReviews();

      expect(result[0].screenshotPath).toBe('');
    });

    it('should throw error when repository fails', async () => {
      mockReviewRepository.findLastFive.mockRejectedValue(new Error('Query failed'));

      await expect(reviewService.getLastFiveReviews())
        .rejects.toThrow('Query failed');
    });
  });
});
