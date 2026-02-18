import { LLMService } from '../../../src/services/LLMService';

// Mock Gemini SDK
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn(),
    }),
  })),
}));

// Mock logger
jest.mock('../../../src/config', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── Helpers ─────────────────────────────────────────────────

const validLLMResponse = {
  issues: [
    {
      category: 'clarity',
      title: 'Vague CTA',
      description: 'Button text is unclear',
      whyIssue: 'Users cannot determine action',
      proof: { type: 'text', content: 'Click here' },
    },
    {
      category: 'layout',
      title: 'Dense layout',
      description: 'Too much content',
      whyIssue: 'Cognitive overload',
      proof: { type: 'text', content: 'Wall of text' },
    },
    {
      category: 'navigation',
      title: 'No breadcrumb',
      description: 'Users get lost',
      whyIssue: 'No wayfinding',
      proof: { type: 'text', content: 'Missing nav' },
    },
    {
      category: 'accessibility',
      title: 'Low contrast',
      description: 'Text hard to read',
      whyIssue: 'WCAG failure',
      proof: { type: 'text', content: 'Gray on white' },
    },
    {
      category: 'trust',
      title: 'No SSL badge',
      description: 'No trust signals',
      whyIssue: 'Users feel unsafe',
      proof: { type: 'text', content: 'No padlock' },
    },
  ],
  topThreeIssues: [
    {
      category: 'clarity',
      title: 'Vague CTA',
      description: 'Button text is unclear',
      whyIssue: 'Users cannot determine action',
      proof: { type: 'text', content: 'Click here' },
      beforeSuggestion: 'Click here',
      afterSuggestion: 'Start Free Trial',
    },
    {
      category: 'accessibility',
      title: 'Low contrast',
      description: 'Text hard to read',
      whyIssue: 'WCAG failure',
      proof: { type: 'text', content: 'Gray on white' },
      beforeSuggestion: '#999 on #fff',
      afterSuggestion: '#333 on #fff',
    },
    {
      category: 'trust',
      title: 'No SSL badge',
      description: 'No trust signals',
      whyIssue: 'Users feel unsafe',
      proof: { type: 'text', content: 'No padlock' },
      beforeSuggestion: 'No badge',
      afterSuggestion: 'Add trust badge',
    },
  ],
  score: 72,
};

const mockExtractedContent = {
  title: 'Example Domain',
  headings: ['Welcome', 'About Us', 'Contact'],
  forms: ['Form 1: login'],
  buttons: ['Submit', 'Learn More'],
  mainText: 'This is a sample website for testing.',
};

const getLLMMock = () => {
  const instance = (GoogleGenerativeAI as jest.Mock).mock.results[0]?.value;
  return instance?.getGenerativeModel()?.generateContent as jest.Mock;
};

// ─── Tests ───────────────────────────────────────────────────
describe('LLMService', () => {
  let service: LLMService;
  let generateContentMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-api-key';
    service = new LLMService();
    generateContentMock = getLLMMock();
  });

  // ─── generateUXReview ───────────────────────────────────────

  describe('generateUXReview', () => {
    it('should return parsed issues, topThreeIssues, and score', async () => {
      generateContentMock.mockResolvedValue({
        response: { text: () => JSON.stringify(validLLMResponse) },
      });

      const result = await service.generateUXReview(mockExtractedContent);

      expect(result.issues).toHaveLength(5);
      expect(result.topThreeIssues).toHaveLength(3);
      expect(result.score).toBe(72);
    });

    it('should handle response wrapped in markdown code blocks', async () => {
      generateContentMock.mockResolvedValue({
        response: {
          text: () => `\`\`\`json\n${JSON.stringify(validLLMResponse)}\n\`\`\``,
        },
      });

      const result = await service.generateUXReview(mockExtractedContent);

      expect(result.score).toBe(72);
      expect(result.issues).toBeDefined();
    });

    it('should throw when LLM returns invalid JSON', async () => {
      generateContentMock.mockResolvedValue({
        response: { text: () => 'This is not valid JSON at all' },
      });

      await expect(service.generateUXReview(mockExtractedContent))
        .rejects.toThrow('Failed to generate UX review');
    });

    it('should throw when LLM call fails after retries', async () => {
      generateContentMock.mockRejectedValue(new Error('API quota exceeded'));

      await expect(service.generateUXReview(mockExtractedContent))
        .rejects.toThrow('Failed to generate UX review');
    });

    it('should retry on transient failure then succeed', async () => {
      generateContentMock
        .mockRejectedValueOnce(new Error('Transient error'))
        .mockResolvedValueOnce({
          response: { text: () => JSON.stringify(validLLMResponse) },
        });

      const result = await service.generateUXReview(mockExtractedContent);

      expect(result.score).toBe(72);
      expect(generateContentMock).toHaveBeenCalledTimes(2);
    });

    it('should fail after exhausting all retries', async () => {
      generateContentMock.mockRejectedValue(new Error('Persistent failure'));

      await expect(service.generateUXReview(mockExtractedContent))
        .rejects.toThrow('Failed to generate UX review');

      // 1 original + 2 retries = 3 total calls
      expect(generateContentMock).toHaveBeenCalledTimes(3);
    });
  });

  // ─── Token Optimization ─────────────────────────────────────

  describe('Token Optimization - optimizeContentForLLM', () => {
    it('should truncate title to 200 chars', async () => {
      generateContentMock.mockResolvedValue({
        response: { text: () => JSON.stringify(validLLMResponse) },
      });

      const longTitleContent = {
        ...mockExtractedContent,
        title: 'A'.repeat(500),
      };

      await service.generateUXReview(longTitleContent);

      const calledPrompt = generateContentMock.mock.calls[0][0] as string;
      const titleInPrompt = calledPrompt.match(/- Title: (.+)/)?.[1] || '';
      expect(titleInPrompt.length).toBeLessThanOrEqual(200);
    });

    it('should truncate mainText to 1500 chars', async () => {
        generateContentMock.mockResolvedValue({
            response: { text: () => JSON.stringify(validLLMResponse) },
        });

        const longTextContent = {
            ...mockExtractedContent,
            mainText: 'X'.repeat(5000),
        };

        await service.generateUXReview(longTextContent);

        // Extract just the mainText section from the prompt directly
        const calledPrompt = generateContentMock.mock.calls[0][0] as string;
        const mainTextMatch = calledPrompt.match(/- Main Text Preview: ([\s\S]+?)(?:\n\n|$)/);
        const mainTextInPrompt = mainTextMatch?.[1] || '';
        expect(mainTextInPrompt.length).toBeLessThanOrEqual(1500);
    });


    it('should limit headings to 10', async () => {
      generateContentMock.mockResolvedValue({
        response: { text: () => JSON.stringify(validLLMResponse) },
      });

      const manyHeadingsContent = {
        ...mockExtractedContent,
        headings: Array.from({ length: 25 }, (_, i) => `Heading ${i + 1}`),
      };

      await service.generateUXReview(manyHeadingsContent);

      const calledPrompt = generateContentMock.mock.calls[0][0] as string;
      const headingsLine = calledPrompt.match(/- Headings: (.+)/)?.[1] || '';
      const headingCount = headingsLine.split(',').length;
      expect(headingCount).toBeLessThanOrEqual(10);
    });

    it('should limit buttons to 10', async () => {
      generateContentMock.mockResolvedValue({
        response: { text: () => JSON.stringify(validLLMResponse) },
      });

      const manyButtonsContent = {
        ...mockExtractedContent,
        buttons: Array.from({ length: 20 }, (_, i) => `Button ${i + 1}`),
      };

      await service.generateUXReview(manyButtonsContent);

      const calledPrompt = generateContentMock.mock.calls[0][0] as string;
      const buttonsLine = calledPrompt.match(/- Buttons: (.+)/)?.[1] || '';
      const buttonCount = buttonsLine.split(',').length;
      expect(buttonCount).toBeLessThanOrEqual(10);
    });

    it('should limit forms to 5', async () => {
      generateContentMock.mockResolvedValue({
        response: { text: () => JSON.stringify(validLLMResponse) },
      });

      const manyFormsContent = {
        ...mockExtractedContent,
        forms: Array.from({ length: 15 }, (_, i) => `Form ${i + 1}: field`),
      };

      await service.generateUXReview(manyFormsContent);

      const calledPrompt = generateContentMock.mock.calls[0][0] as string;
      const formsLine = calledPrompt.match(/- Forms: (.+)/)?.[1] || '';
      const formCount = formsLine.split(',').length;
      expect(formCount).toBeLessThanOrEqual(5);
    });

    it('should handle empty/undefined fields without crashing', async () => {
      generateContentMock.mockResolvedValue({
        response: { text: () => JSON.stringify(validLLMResponse) },
      });

      const emptyContent = {
        title: '',
        headings: [],
        forms: [],
        buttons: [],
        mainText: '',
      };

      await expect(service.generateUXReview(emptyContent))
        .resolves.toBeDefined();
    });
  });

  // ─── checkHealth ────────────────────────────────────────────

  describe('checkHealth', () => {
    it('should return true when LLM responds', async () => {
      generateContentMock.mockResolvedValue({
        response: { text: () => 'Hello' },
      });

      const result = await service.checkHealth();

      expect(result).toBe(true);
    });

    it('should return false when LLM throws', async () => {
      generateContentMock.mockRejectedValue(new Error('Service unavailable'));

      const result = await service.checkHealth();

      expect(result).toBe(false);
    });

    it('should use minimal prompt for health check', async () => {
      generateContentMock.mockResolvedValue({
        response: { text: () => 'Hi' },
      });

      await service.checkHealth();

      const calledPrompt = generateContentMock.mock.calls[0][0] as string;
      expect(calledPrompt.length).toBeLessThanOrEqual(5);
    });
  });
});
