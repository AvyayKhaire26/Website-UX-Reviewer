import { Router } from 'express';
import { ReviewController } from '../controllers/ReviewController';
import {
  validateCreateReview,
  validateReviewId,
  handleValidationErrors,
} from '../middleware/validateRequest';

export const createReviewRoutes = (reviewController: ReviewController): Router => {
  const router = Router();

  router.post(
    '/review',
    validateCreateReview,         // Run validation rules
    handleValidationErrors,       // Check results, return 400 if invalid
    reviewController.createReview.bind(reviewController)
  );

  router.get(
    '/reviews',
    reviewController.getLastFiveReviews.bind(reviewController)
  );

  router.get(
    '/review/:id',
    validateReviewId,             // Validate UUID param
    handleValidationErrors,
    reviewController.getReviewById.bind(reviewController)
  );

  return router;
};
