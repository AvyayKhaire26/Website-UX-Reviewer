import { Request, Response } from 'express';
import { ILLMService } from '../interfaces/ILLMService';
import { ReviewRepository } from '../repositories/ReviewRepository';
import { logger } from '../config';

export class HealthController {
  constructor(
    private llmService: ILLMService,
    private reviewRepository: ReviewRepository
  ) {}

  async checkHealth(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Health check requested');

      const [databaseHealth, llmHealth] = await Promise.all([
        this.reviewRepository.checkHealth(),
        this.llmService.checkHealth(),
      ]);

      const backendHealth = true; // If this executes, backend is healthy

      const allHealthy = backendHealth && databaseHealth && llmHealth;

      const healthStatus = {
        backend: backendHealth ? 'ok' : 'error',
        database: databaseHealth ? 'ok' : 'error',
        llm: llmHealth ? 'ok' : 'error',
        overall: allHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
      };

      logger.info('Health check completed', healthStatus);

      res.status(allHealthy ? 200 : 503).json(healthStatus);

    } catch (error: any) {
      logger.error('Error in health check', error);
      res.status(503).json({
        backend: 'error',
        database: 'error',
        llm: 'error',
        overall: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
