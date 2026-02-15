import { IExtractedContent } from './IReview';

export interface IScraperService {
  scrapeWebsite(url: string): Promise<IExtractedContent>;
  captureScreenshot(url: string): Promise<string>;
}