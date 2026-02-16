// Backend's Issue structure (detailedIssues)
export interface Issue {
  proof: {
    type: string;
    content: string;
  };
  title: string;
  category: string;
  whyIssue: string;
  description: string;
}

// Backend's TopIssue structure (topThreeIssues)
export interface TopIssue {
  proof: {
    type: string;
    content: string;
  };
  title: string;
  category: string;
  whyIssue: string;
  description: string;
  afterSuggestion: string;
  beforeSuggestion: string;
}

// Backend's single review response
export interface BackendReviewData {
  id: string;
  url: string;
  title: string;
  score: number;
  issues: Issue[];
  topThreeIssues: TopIssue[];
  extractedContent: {
    forms: string[];
    title: string;
    buttons: string[];
    headings: string[];
    mainText: string;
  };
  screenshotPath: string;
  createdAt: string;
}

// Backend response wrapper
export interface ReviewResponse {
  success: boolean;
  data?: BackendReviewData;
  error?: string;
}

// Backend list response
export interface ReviewListResponse {
  success: boolean;
  data?: BackendReviewData[];
  error?: string;
}

export interface ReviewData extends BackendReviewData {}

// Review request
export interface ReviewRequest {
  url: string;
}
