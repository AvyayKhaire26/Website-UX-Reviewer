import React from 'react';
import { getScoreColor } from '../utils/formatters';

interface ScoreCardProps {
  score: number;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ score }) => {
  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 text-center border border-blue-200">
      <h3 className="text-lg font-medium text-gray-700 mb-2">Overall UX Score</h3>
      <div className={`text-6xl font-bold ${getScoreColor(score)} mb-2`}>
        {score}
      </div>
      <p className="text-sm text-gray-600">{getScoreLabel(score)}</p>
    </div>
  );
};
