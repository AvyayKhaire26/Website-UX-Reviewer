import { IExtractedContent, IIssue, ITopIssue } from "./IReview";

export interface ILLMService {
  generateUXReview(content: IExtractedContent): Promise<{
    issues: IIssue[];
    topThreeIssues: ITopIssue[];
    score: number;
  }>;
  checkHealth(): Promise<boolean>;
}