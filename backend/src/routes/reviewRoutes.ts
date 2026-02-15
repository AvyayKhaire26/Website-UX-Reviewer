import { Router } from 'express';
import { ReviewController } from '../controllers/ReviewController';

export const createReviewRoutes = (reviewController: ReviewController): Router => {
  const router = Router();

  router.post('/review', (req, res) => reviewController.createReview(req, res));
  router.get('/reviews', (req, res) => reviewController.getLastFiveReviews(req, res));
  router.get('/reviews/:id', (req, res) => reviewController.getReviewById(req, res));

  return router;
};
