import { GoogleGenerativeAI } from '@google/generative-ai';
import { ILLMService } from '../interfaces/ILLMService';
import { IExtractedContent, IIssue, ITopIssue } from '../interfaces/IReview';
import { logger } from '../config';

export class LLMService implements ILLMService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async generateUXReview(content: IExtractedContent): Promise<{
    issues: IIssue[];
    topThreeIssues: ITopIssue[];
    score: number;
  }> {
    try {
      logger.info('Generating UX review with Gemini');

      const prompt = `
You are a UX expert. Analyze this website content and provide a detailed UX review.

Website Content:
- Title: ${content.title}
- Headings: ${content.headings.join(', ')}
- Forms: ${content.forms.join(', ')}
- Buttons: ${content.buttons.join(', ')}
- Main Text Preview: ${content.mainText.substring(0, 1000)}

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

Return ONLY valid JSON, no markdown formatting.
`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Clean response (remove markdown code blocks if present)
      const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
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
      const result = await this.model.generateContent('Hello');
      return result?.response?.text() !== undefined;
    } catch (error) {
      logger.error('LLM health check failed', error);
      return false;
    }
  }
}
