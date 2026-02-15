import { IReviewResponse } from "./IReview";

export interface IReviewService {
  createReview(url: string): Promise<IReviewResponse>;
  getReviewById(id: string): Promise<IReviewResponse | null>;
  getLastFiveReviews(): Promise<IReviewResponse[]>;
}