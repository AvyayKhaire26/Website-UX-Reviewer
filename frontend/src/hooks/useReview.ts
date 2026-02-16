import { useState } from 'react';
import { useServices } from '../contexts/ServiceContext';
import { ReviewData } from '../types/review.types';
import { formatUrl } from '../utils/validators';

export const useReview = () => {
  const { reviewService } = useServices();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);

  const submitReview = async (url: string): Promise<ReviewData> => {
    setLoading(true);
    setError(null);
    setReviewData(null);

    const formattedUrl = formatUrl(url);
    const response = await reviewService.createReview({ url: formattedUrl });

    if (response.success && response.data) {
      setReviewData(response.data);
      setLoading(false);
      return response.data; // Return the data
    } else {
      const errorMsg = response.error || 'Failed to review website';
      setError(errorMsg);
      setLoading(false);
      throw new Error(errorMsg);
    }
  };

  return { loading, error, reviewData, submitReview };
};
