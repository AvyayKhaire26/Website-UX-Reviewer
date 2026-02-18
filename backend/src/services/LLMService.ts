import { GoogleGenerativeAI } from '@google/generative-ai';
import { ILLMService } from '../interfaces/ILLMService';
import { IExtractedContent, IIssue, ITopIssue } from '../interfaces/IReview';
import { logger } from '../config';

export class LLMService implements ILLMService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  // Token optimization constants
  private static readonly MAX_TITLE_LENGTH = 200;
  private static readonly MAX_MAIN_TEXT_LENGTH = 1500;
  private static readonly MAX_HEADINGS = 10;
  private static readonly MAX_BUTTONS = 10;
  private static readonly MAX_FORMS = 5;
  private static readonly MAX_HEADING_LENGTH = 100;
  private static readonly MAX_BUTTON_LENGTH = 50;

  // Retry config
  private static readonly MAX_RETRIES = 2;
  private static readonly RETRY_DELAY_MS = 1000;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  // Exponential backoff retry - handles transient LLM failures without wasting tokens
  private async generateWithRetry(prompt: string): Promise<string> {
    for (let attempt = 0; attempt <= LLMService.MAX_RETRIES; attempt++) {
      try {
        const result = await this.model.generateContent(prompt);
        return result.response.text();
      } catch (error) {
        if (attempt === LLMService.MAX_RETRIES) throw error;
        const delay = LLMService.RETRY_DELAY_MS * (attempt + 1); // 1s, 2s
        logger.warn(`LLM attempt ${attempt + 1} failed, retrying in ${delay}ms`);
        await new Promise(res => setTimeout(res, delay));
      }
    }
    throw new Error('LLM failed after all retries');
  }

  // Token optimization - truncate and limit all content before sending to LLM
  private optimizeContentForLLM(content: IExtractedContent): IExtractedContent {
    const originalTextLength = content.mainText?.length || 0;
    const originalHeadings = content.headings?.length || 0;
    const originalButtons = content.buttons?.length || 0;

    const optimized = {
      title: (content.title || '').slice(0, LLMService.MAX_TITLE_LENGTH),
      headings: (content.headings || [])
        .slice(0, LLMService.MAX_HEADINGS)
        .map(h => h.slice(0, LLMService.MAX_HEADING_LENGTH)),
      forms: (content.forms || [])
        .slice(0, LLMService.MAX_FORMS),
      buttons: (content.buttons || [])
        .slice(0, LLMService.MAX_BUTTONS)
        .map(b => b.slice(0, LLMService.MAX_BUTTON_LENGTH)),
      mainText: (content.mainText || '').slice(0, LLMService.MAX_MAIN_TEXT_LENGTH),
    };

    logger.info(`Token optimization: text ${originalTextLength}→${optimized.mainText.length} chars, headings ${originalHeadings}→${optimized.headings.length}, buttons ${originalButtons}→${optimized.buttons.length}`);

    return optimized;
  }

  private buildPrompt(content: IExtractedContent): string {
    return `You are a UX expert. Analyze this website content and provide a detailed UX review.

Website Content:
- Title: ${content.title}
- Headings: ${content.headings.join(', ')}
- Forms: ${content.forms.join(', ')}
- Buttons: ${content.buttons.join(', ')}
- Main Text Preview: ${content.mainText}

Generate a JSON response with the following structure:
{
  "issues": [
    {
      "category": "clarity|layout|navigation|accessibility|trust",
      "title": "Brief issue title",
      "description": "Detailed description",
      "whyIssue": "Why this is a UX problem",
      "proof": {
        "type": "text",
        "content": "Exact text or element that demonstrates this issue"
      }
    }
  ],
  "topThreeIssues": [
    {
      "category": "clarity|layout|navigation|accessibility|trust",
      "title": "Brief issue title",
      "description": "Detailed description",
      "whyIssue": "Why this is a UX problem",
      "proof": {
        "type": "text",
        "content": "Exact text or element"
      },
      "beforeSuggestion": "Current problematic state",
      "afterSuggestion": "Improved suggestion"
    }
  ],
  "score": 75
}

Requirements:
- Generate 8-12 issues total across these categories: clarity, layout, navigation, accessibility, trust
- Each category should have at least 1 issue
- Top 3 issues should be the most critical ones with before/after suggestions
- Score should be 0-100 (higher is better UX)
- Proof should reference actual content from the website

Return ONLY valid JSON, no markdown formatting.`;
  }

  async generateUXReview(content: IExtractedContent): Promise<{
    issues: IIssue[];
    topThreeIssues: ITopIssue[];
    score: number;
  }> {
    try {
      logger.info('Generating UX review with Gemini');

      const optimizedContent = this.optimizeContentForLLM(content);
      const prompt = this.buildPrompt(optimizedContent);

      logger.info(`Prompt length: ${prompt.length} characters`);

      // Use retry wrapper instead of raw model call
      const response = await this.generateWithRetry(prompt);

      const cleanedResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsedResponse = JSON.parse(cleanedResponse);

      logger.info('UX review generated successfully');

      return {
        issues: parsedResponse.issues,
        topThreeIssues: parsedResponse.topThreeIssues,
        score: parsedResponse.score,
      };

    } catch (error) {
      logger.error('Error generating UX review', error);
      throw new Error('Failed to generate UX review');
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const result = await this.model.generateContent('Hi');
      return result?.response?.text() !== undefined;
    } catch (error) {
      logger.error('LLM health check failed', error);
      return false;
    }
  }
}
