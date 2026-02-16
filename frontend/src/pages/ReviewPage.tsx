import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ScoreCard } from '../components/ScoreCard';
import { IssueCard } from '../components/IssueCard';
import { TopIssueCard } from '../components/TopIssueCard';
import { ReviewData, Issue } from '../types/review.types';
import { formatDate } from '../utils/formatters';

export const ReviewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reviewData = location.state?.reviewData as ReviewData | undefined;

  const handleExportPDF = () => {
    window.print();
  };

  if (!reviewData) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <div className="text-center py-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              No Review Data Found
            </h2>
            <p className="text-gray-600 mb-6">
              Please analyze a website first to see results.
            </p>
            <Link to="/">
              <Button variant="primary">Go to Home</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Group issues by category
  const issuesByCategory = reviewData.issues.reduce((acc, issue) => {
    if (!acc[issue.category]) {
      acc[issue.category] = [];
    }
    acc[issue.category].push(issue);
    return acc;
  }, {} as Record<string, Issue[]>);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header with Back and Export buttons */}
      <div className="mb-8 flex justify-between items-center">
        <Button variant="secondary" onClick={() => navigate('/')}>
          ← Back to Home
        </Button>
        <Button variant="primary" onClick={handleExportPDF}>
          📄 Export PDF
        </Button>
      </div>

      {/* Website Info & Score */}
      <Card className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{reviewData.title}</h1>
            <a
              href={reviewData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-lg"
            >
              {reviewData.url}
            </a>
            <p className="text-sm text-gray-500 mt-2">
              Reviewed on {formatDate(reviewData.createdAt)}
            </p>
          </div>
          <ScoreCard score={reviewData.score} />
        </div>
      </Card>

      {/* Screenshot */}
      <Card className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Website Screenshot</h2>
        {reviewData.screenshotPath && (
          <img
            src={reviewData.screenshotPath}
            alt="Website Screenshot"
            className="w-full rounded-lg border border-gray-200"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/1200x800?text=Screenshot+Not+Available';
            }}
          />
        )}
      </Card>

      {/* Top 3 Issues */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          🔥 Top Priority Issues
        </h2>
        <div className="space-y-6">
          {reviewData.topThreeIssues.map((issue, index) => (
            <TopIssueCard key={index} issue={issue} index={index} />
          ))}
        </div>
      </div>

      {/* Detailed Issues by Category */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Detailed Issues by Category
        </h2>
        
        {Object.entries(issuesByCategory).map(([category, issues]) => (
          <Card key={category} className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 capitalize">
              {category} ({issues.length})
            </h3>
            <div className="grid gap-4">
              {issues.map((issue, index) => (
                <IssueCard key={index} issue={issue} />
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <Card className="print:hidden">
        <div className="flex gap-4 justify-center">
          <Button variant="primary" onClick={() => navigate('/')}>
            Analyze Another Website
          </Button>
          <Button variant="secondary" onClick={() => navigate('/history')}>
            View History
          </Button>
        </div>
      </Card>
    </div>
  );
};
