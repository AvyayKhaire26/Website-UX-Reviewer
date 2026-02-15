export interface IIssue {
  category: 'clarity' | 'layout' | 'navigation' | 'accessibility' | 'trust';
  title: string;
  description: string;
  whyIssue: string;
  proof: {
    type: 'screenshot' | 'text';
    content: string;
  };
}

export interface ITopIssue extends IIssue {
  beforeSuggestion: string;
  afterSuggestion: string;
}

export interface IExtractedContent {
  title: string;
  headings: string[];
  forms: string[];
  buttons: string[];
  mainText: string;
}

export interface IReviewResponse {
  id: string;
  url: string;
  title: string;
  score: number | null;
  issues: IIssue[];
  topThreeIssues: ITopIssue[];
  extractedContent: IExtractedContent;
  screenshotPath: string | null;
  createdAt: Date;
}
