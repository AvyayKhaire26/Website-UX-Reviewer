import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { useServices } from '../contexts/ServiceContext';
import { ReviewData } from '../types/review.types';
import { formatDate, getScoreColor } from '../utils/formatters';
import { API_CONFIG } from '../config/api.config';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { reviewService } = useServices();
  const navigate = useNavigate();

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    
    const result = await reviewService.getReviewHistory();
    
    if (result.success && result.data) {
      setHistory(result.data);
    } else {
      setError(result.error || 'Failed to load history');
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleViewReview = (review: ReviewData) => {
    navigate('/review', { state: { reviewData: review } });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Review History</h1>
        <Card>
          <LoadingSpinner size="md" text="Loading history..." />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Review History</h1>
        <ErrorMessage message={error} onRetry={fetchHistory} />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Review History</h1>
        <Card>
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📋</span>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              No Reviews Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Your last 5 reviews will appear here.
            </p>
            <Button variant="primary" onClick={() => navigate('/')}>
              Analyze Your First Website
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Review History</h1>
        <Button variant="secondary" onClick={fetchHistory}>
          Refresh
        </Button>
      </div>

      <div className="grid gap-6">
        {history.map((review) => (
          <Card
            key={review.id}
            hoverable
            onClick={() => handleViewReview(review)}
            className="cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-3xl font-bold ${getScoreColor(review.score)}`}>
                    {review.score}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {review.url}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap mb-2">
                  {review.topThreeIssues.slice(0, 3).map((issue, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded"
                    >
                      {issue.title}
                    </span>
                  ))}
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {review.issues.length} issues found
                  </span>
                </div>
              </div>

              {review.screenshotPath && (
                <img
                  src={`${API_CONFIG.BASE_URL}${review.screenshotPath}`}
                  alt="Screenshot"
                  className="w-32 h-24 object-cover rounded-lg border border-gray-200 ml-4"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
