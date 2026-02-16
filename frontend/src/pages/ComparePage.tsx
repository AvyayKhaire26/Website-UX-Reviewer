import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { ScoreCard } from '../components/ScoreCard';
import { useReview } from '../hooks/useReview';
import { isValidUrl, formatUrl } from '../utils/validators';
import { ReviewData } from '../types/review.types';

export const ComparePage: React.FC = () => {
  const [url1, setUrl1] = useState('');
  const [url2, setUrl2] = useState('');
  const [error1, setError1] = useState('');
  const [error2, setError2] = useState('');
  const [review1, setReview1] = useState<ReviewData | null>(null);
  const [review2, setReview2] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [overallError, setOverallError] = useState('');

  const { submitReview } = useReview();

  const handleCompare = async () => {
    // Validate both URLs
    if (!url1.trim() || !url2.trim()) {
      setOverallError('Please enter both URLs');
      return;
    }

    const formattedUrl1 = formatUrl(url1.trim());
    const formattedUrl2 = formatUrl(url2.trim());

    if (!isValidUrl(formattedUrl1)) {
      setError1('Invalid URL');
      return;
    }

    if (!isValidUrl(formattedUrl2)) {
      setError2('Invalid URL');
      return;
    }

    setError1('');
    setError2('');
    setOverallError('');
    setLoading(true);

    try {
      // Review first URL
      const result1 = await submitReview(formattedUrl1);
      
      // Review second URL
      const result2 = await submitReview(formattedUrl2);

      setReview1(result1);
      setReview2(result2);
    } catch (error: any) {
      setOverallError(error.message || 'Failed to compare websites');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUrl1('');
    setUrl2('');
    setReview1(null);
    setReview2(null);
    setError1('');
    setError2('');
    setOverallError('');
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Compare Websites</h1>
        <Card>
          <LoadingSpinner size="lg" text="Analyzing both websites... This may take 2-4 minutes" />
        </Card>
      </div>
    );
  }

  if (!review1 || !review2) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Compare Websites</h1>
        <p className="text-gray-600 mb-8">
          Enter two website URLs to compare their UX side-by-side
        </p>

        <Card>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website 1
              </label>
              <Input
                value={url1}
                onChange={setUrl1}
                placeholder="https://example.com"
                type="url"
                error={error1}
                fullWidth
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website 2
              </label>
              <Input
                value={url2}
                onChange={setUrl2}
                placeholder="https://another-example.com"
                type="url"
                error={error2}
                fullWidth
              />
            </div>

            {overallError && <ErrorMessage message={overallError} />}

            <Button
              type="button"
              variant="primary"
              fullWidth
              onClick={handleCompare}
              disabled={!url1 || !url2}
            >
              Compare Websites
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Comparison Results</h1>
        <Button variant="secondary" onClick={handleReset}>
          Compare Different URLs
        </Button>
      </div>

      {/* Score Comparison */}
      <Card className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Overall Scores
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3 text-center">{review1.title}</h3>
            <ScoreCard score={review1.score} />
            <a
              href={review1.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm block text-center mt-2"
            >
              {review1.url}
            </a>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3 text-center">{review2.title}</h3>
            <ScoreCard score={review2.score} />
            <a
              href={review2.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm block text-center mt-2"
            >
              {review2.url}
            </a>
          </div>
        </div>
      </Card>

      {/* Screenshots Comparison */}
      <Card className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Screenshots</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">{review1.title}</h3>
            {review1.screenshotPath && (
              <img
                src={review1.screenshotPath}
                alt={`${review1.title} Screenshot`}
                className="w-full rounded-lg border border-gray-200"
              />
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">{review2.title}</h3>
            {review2.screenshotPath && (
              <img
                src={review2.screenshotPath}
                alt={`${review2.title} Screenshot`}
                className="w-full rounded-lg border border-gray-200"
              />
            )}
          </div>
        </div>
      </Card>

      {/* Top Issues Comparison */}
      <Card className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Top Priority Issues</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{review1.title}</h3>
            <div className="space-y-3">
              {review1.topThreeIssues.map((issue, idx) => (
                <div key={idx} className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-start gap-2">
                    <span className="text-lg font-bold text-orange-600">#{idx + 1}</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">{issue.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{review2.title}</h3>
            <div className="space-y-3">
              {review2.topThreeIssues.map((issue, idx) => (
                <div key={idx} className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-start gap-2">
                    <span className="text-lg font-bold text-orange-600">#{idx + 1}</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">{issue.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Issue Count Comparison */}
      <Card>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Issues Summary</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">{review1.title}</h3>
            <p className="text-3xl font-bold text-gray-900">{review1.issues.length}</p>
            <p className="text-sm text-gray-600">Total Issues Found</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">{review2.title}</h3>
            <p className="text-3xl font-bold text-gray-900">{review2.issues.length}</p>
            <p className="text-sm text-gray-600">Total Issues Found</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
