import request from 'supertest';
import app from '../../src/app';

jest.mock('../../src/services/ScraperService', () => ({
  ScraperService: jest.fn().mockImplementation(() => ({
    scrapeWebsite: jest.fn().mockResolvedValue({
      title: 'Test Website',
      headings: ['Heading 1'],
      forms: [],
      buttons: ['Submit'],
      mainText: 'Test content',
    }),
    captureScreenshot: jest.fn().mockResolvedValue('/screenshots/test.png'),
  })),
}));

// ← KEY FIX: Match YOUR actual filename and export name
jest.mock('../../src/services/LLMService', () => ({
  LLMService: jest.fn().mockImplementation(() => ({
    generateUXReview: jest.fn().mockResolvedValue({
      score: 75,
      issues: [],
      topThreeIssues: [],
    }),
    checkHealth: jest.fn().mockResolvedValue(true),
  })),
}));

jest.mock('../../src/repositories/ReviewRepository', () => ({
  ReviewRepository: jest.fn().mockImplementation(() => ({
    create: jest.fn().mockResolvedValue({
      id: '123e4567-e89b-12d3-a456-426614174000',
      url: 'https://example.com',
      title: 'Test Website',
      score: 75,
      issues: [],
      topThreeIssues: [],
      extractedContent: {},
      screenshotPath: '/screenshots/test.png',
      createdAt: new Date(),
    }),
    findById: jest.fn().mockResolvedValue(null),
    findLastFive: jest.fn().mockResolvedValue([]),
    deleteOldestIfMoreThanFive: jest.fn().mockResolvedValue(undefined),
    checkHealth: jest.fn().mockResolvedValue(true),
  })),
}));

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  readFileSync: jest.fn().mockReturnValue(Buffer.from('fake-image-data')),
  existsSync: jest.fn().mockReturnValue(true),
}));

jest.setTimeout(10000);

describe('POST /api/v1/review - Input Validation', () => {

  // Valid URL tests
  describe('Valid inputs', () => {
    it('should accept valid http URL', async () => {
      const res = await request(app)
        .post('/api/v1/review')
        .send({ url: 'http://example.com' });

      // Not 400 means validation passed (even if 500 from mocked service)
      expect(res.status).not.toBe(400);
    });

    it('should accept valid https URL', async () => {
      const res = await request(app)
        .post('/api/v1/review')
        .send({ url: 'https://example.com' });

      expect(res.status).not.toBe(400);
    });
  });

  // Invalid URL tests
  describe('Invalid inputs - should return 400', () => {
    it('should reject empty URL', async () => {
      const res = await request(app)
        .post('/api/v1/review')
        .send({ url: '' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Validation failed');
    });

    it('should reject missing URL', async () => {
      const res = await request(app)
        .post('/api/v1/review')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.details[0].field).toBe('url');
    });

    it('should reject URL without protocol', async () => {
      const res = await request(app)
        .post('/api/v1/review')
        .send({ url: 'example.com' });

      expect(res.status).toBe(400);
    });

    it('should reject URL with ftp protocol', async () => {
      const res = await request(app)
        .post('/api/v1/review')
        .send({ url: 'ftp://example.com' });

      expect(res.status).toBe(400);
    });

    it('should reject localhost URL (SSRF prevention)', async () => {
      const res = await request(app)
        .post('/api/v1/review')
        .send({ url: 'http://localhost:3000' });

      expect(res.status).toBe(400);
    });

    it('should reject private IP URL (SSRF prevention)', async () => {
      const res = await request(app)
        .post('/api/v1/review')
        .send({ url: 'http://192.168.1.1' });

      expect(res.status).toBe(400);
    });

    it('should reject URL exceeding 2048 characters', async () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2050);
      const res = await request(app)
        .post('/api/v1/review')
        .send({ url: longUrl });

      expect(res.status).toBe(400);
    });

    it('should reject non-string URL', async () => {
      const res = await request(app)
        .post('/api/v1/review')
        .send({ url: 12345 });

      expect(res.status).toBe(400);
    });
  });
});

describe('GET /api/v1/review/:id - ID Validation', () => {
  it('should reject invalid UUID format', async () => {
    const res = await request(app)
      .get('/api/v1/review/not-a-valid-uuid-format');

    expect(res.status).toBe(400);
    expect(res.body.details[0].field).toBe('id');
  });

  it('should accept valid UUID format', async () => {
    const res = await request(app)
      .get('/api/v1/review/123e4567-e89b-12d3-a456-426614174000');

    // 404 = validation passed, review just not found
    expect(res.status).not.toBe(400);
  });
});

// Cleanup after all tests
afterAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
});
