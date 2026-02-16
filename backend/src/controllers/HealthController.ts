import { Request, Response } from 'express';
import { ILLMService } from '../interfaces/ILLMService';
import { ReviewRepository } from '../repositories/ReviewRepository';
import { logger } from '../config';

export class HealthController {
  constructor(
    private llmService: ILLMService,
    private reviewRepository: ReviewRepository
  ) {}

  // Basic health check (backend + screenshot service only)
  async checkHealth(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Basic health check requested');

      const backendHealth = true; // If this executes, backend is healthy
      
      // Check if Playwright is installed (doesn't actually run it)
      const screenshotHealth = await this.checkScreenshotService();

      const healthStatus = {
        backend: backendHealth ? 'ok' : 'error',
        screenshot: screenshotHealth ? 'ok' : 'error',
        overall: backendHealth && screenshotHealth ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
      };

      logger.info('Basic health check completed', healthStatus);

      res.status(backendHealth && screenshotHealth ? 200 : 503).json(healthStatus);

    } catch (error: any) {
      logger.error('Error in basic health check', error);
      res.status(503).json({
        backend: 'error',
        screenshot: 'error',
        overall: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Explicit LLM health check
  async checkLLMHealth(req: Request, res: Response): Promise<void> {
    try {
      logger.info('LLM health check requested');

      const llmHealth = await this.llmService.checkHealth();

      const healthStatus = {
        llm: llmHealth ? 'ok' : 'error',
        status: llmHealth ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
      };

      logger.info('LLM health check completed', healthStatus);

      res.status(llmHealth ? 200 : 503).json(healthStatus);

    } catch (error: any) {
      logger.error('Error in LLM health check', error);
      res.status(503).json({
        llm: 'error',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Explicit Database health check
  async checkDatabaseHealth(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Database health check requested');

      const databaseHealth = await this.reviewRepository.checkHealth();

      const healthStatus = {
        database: databaseHealth ? 'ok' : 'error',
        status: databaseHealth ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
      };

      logger.info('Database health check completed', healthStatus);

      res.status(databaseHealth ? 200 : 503).json(healthStatus);

    } catch (error: any) {
      logger.error('Error in database health check', error);
      res.status(503).json({
        database: 'error',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Explicit Screenshot service health check
  async checkScreenshotHealth(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Screenshot service health check requested');

      const screenshotHealth = await this.checkScreenshotService();

      const healthStatus = {
        screenshot: screenshotHealth ? 'ok' : 'error',
        status: screenshotHealth ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
      };

      logger.info('Screenshot service health check completed', healthStatus);

      res.status(screenshotHealth ? 200 : 503).json(healthStatus);

    } catch (error: any) {
      logger.error('Error in screenshot service health check', error);
      res.status(503).json({
        screenshot: 'error',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Helper method to check screenshot service
  private async checkScreenshotService(): Promise<boolean> {
    try {
      // Check if playwright chromium is available
      const { chromium } = await import('playwright');
      return true;
    } catch (error) {
      logger.error('Screenshot service check failed', error);
      return false;
    }
  }
}
