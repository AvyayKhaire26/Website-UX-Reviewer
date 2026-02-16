import { Router } from 'express';
import { HealthController } from '../controllers/HealthController';

export const createHealthRoutes = (healthController: HealthController): Router => {
  const router = Router();

  // Basic health check (backend + screenshot only)
  router.get('/health', healthController.checkHealth.bind(healthController));

  // Explicit service checks
  router.get('/health/llm', healthController.checkLLMHealth.bind(healthController));
  router.get('/health/database', healthController.checkDatabaseHealth.bind(healthController));
  router.get('/health/screenshot', healthController.checkScreenshotHealth.bind(healthController));

  return router;
};
