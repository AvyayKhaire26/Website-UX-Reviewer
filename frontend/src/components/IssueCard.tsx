import React from 'react';
import { Issue } from '../types/review.types';

interface IssueCardProps {
  issue: Issue;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-gray-800 flex-1">{issue.title}</h4>
        <span className="text-xs font-medium px-3 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
          {issue.category.toUpperCase()}
        </span>
      </div>
      
      <p className="text-sm text-gray-700 mb-2"><strong>Issue:</strong> {issue.description}</p>
      <p className="text-sm text-gray-600 mb-3"><strong>Why:</strong> {issue.whyIssue}</p>
      
      {issue.proof && (
        <div className="bg-gray-50 p-3 rounded text-xs text-gray-700 border border-gray-200">
          <strong>Proof:</strong> {issue.proof.content}
        </div>
      )}
    </div>
  );
};
