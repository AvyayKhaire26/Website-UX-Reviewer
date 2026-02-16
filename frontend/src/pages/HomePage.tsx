import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { useReview } from '../hooks/useReview';
import { isValidUrl, formatUrl } from '../utils/validators';

export const HomePage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [inputError, setInputError] = useState('');
  const { loading, error, reviewData, submitReview } = useReview();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate URL
    if (!url.trim()) {
      setInputError('Please enter a URL');
      return;
    }

    const formattedUrl = formatUrl(url.trim());
    
    if (!isValidUrl(formattedUrl)) {
      setInputError('Please enter a valid URL');
      return;
    }

    setInputError('');
    await submitReview(formattedUrl);
  };

  // Navigate when review is complete
  React.useEffect(() => {
    if (reviewData) {
      navigate('/review', { state: { reviewData } });
    }
  }, [reviewData, navigate]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Website UX Reviewer
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          Get instant AI-powered UX insights for any website
        </p>
        <p className="text-gray-500">
          Analyze clarity, layout, navigation, accessibility, and trust signals
        </p>
      </div>

      {/* Main Card */}
      <Card className="mb-8">
        {!loading && !error && (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Enter Website URL
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                value={url}
                onChange={setUrl}
                placeholder="https://example.com"
                type="url"
                error={inputError}
                fullWidth
                disabled={loading}
              />
              
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                Analyze Website
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Analysis takes 30-60 seconds. We'll capture screenshots and analyze UX issues.
              </p>
            </div>
          </>
        )}

        {loading && (
          <LoadingSpinner size="lg" text="Analyzing website UX... This may take up to 2 minutes" />
        )}

        {error && (
          <ErrorMessage
            message={error}
            onRetry={() => submitReview(formatUrl(url))}
          />
        )}
      </Card>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card>
          <div className="text-center">
            <span className="text-4xl mb-3 block">📊</span>
            <h3 className="font-semibold text-gray-800 mb-2">UX Score</h3>
            <p className="text-sm text-gray-600">
              Get an overall score with detailed breakdown
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <span className="text-4xl mb-3 block">🔍</span>
            <h3 className="font-semibold text-gray-800 mb-2">8-12 Issues</h3>
            <p className="text-sm text-gray-600">
              Categorized by clarity, layout, navigation & more
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <span className="text-4xl mb-3 block">📸</span>
            <h3 className="font-semibold text-gray-800 mb-2">Visual Proof</h3>
            <p className="text-sm text-gray-600">
              Screenshots and specific element references
            </p>
          </div>
        </Card>
      </div>

      {/* How it Works */}
      <Card>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">How It Works</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="bg-blue-100 text-blue-700 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">1</span>
            <p className="text-gray-700">Enter any website URL you want to analyze</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-blue-100 text-blue-700 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">2</span>
            <p className="text-gray-700">Our AI loads the page and captures key content</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-blue-100 text-blue-700 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">3</span>
            <p className="text-gray-700">Get detailed UX review with actionable recommendations</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-blue-100 text-blue-700 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">4</span>
            <p className="text-gray-700">View top issues with before/after suggestions</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
