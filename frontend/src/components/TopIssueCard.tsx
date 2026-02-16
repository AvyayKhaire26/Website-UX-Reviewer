import React from 'react';
import { TopIssue } from '../types/review.types';

interface TopIssueCardProps {
  issue: TopIssue;
  index: number;
}

export const TopIssueCard: React.FC<TopIssueCardProps> = ({ issue, index }) => {
  return (
    <div className="bg-white border-2 border-orange-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-orange-500">#{index + 1}</span>
          <h3 className="text-xl font-bold text-gray-800">{issue.title}</h3>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-800">
          {issue.category.toUpperCase()}
        </span>
      </div>
      
      <p className="text-gray-700 mb-3">{issue.description}</p>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-4">
        <p className="text-sm font-medium text-yellow-900 mb-1">⚠️ Why This Matters:</p>
        <p className="text-sm text-yellow-800">{issue.whyIssue}</p>
      </div>

      {/* Before/After Suggestions */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-red-50 p-3 rounded border border-red-200">
          <p className="text-xs font-semibold text-red-800 mb-2">❌ Before:</p>
          <p className="text-xs text-gray-700">{issue.beforeSuggestion}</p>
        </div>
        <div className="bg-green-50 p-3 rounded border border-green-200">
          <p className="text-xs font-semibold text-green-800 mb-2">✅ After:</p>
          <p className="text-xs text-gray-700">{issue.afterSuggestion}</p>
        </div>
      </div>
    </div>
  );
};
