import { ScraperService } from '../../../src/services/ScraperService';

// Mock Playwright
jest.mock('playwright', () => ({
  chromium: {
    launch: jest.fn(),
  },
}));

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
}));

// Mock logger
jest.mock('../../../src/config', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

import { chromium } from 'playwright';
import fs from 'fs';

// ─── Shared mock page factory ────────────────────────────────
const createMockPage = (overrides: Partial<Record<string, jest.Mock>> = {}) => ({
  goto: jest.fn().mockResolvedValue(undefined),
  title: jest.fn().mockResolvedValue('Test Title'),
  $$eval: jest.fn().mockImplementation((selector: string) => {
    if (selector.includes('h')) return Promise.resolve(['Heading 1', 'Heading 2']);
    if (selector === 'form') return Promise.resolve(['Form 1: unnamed']);
    if (selector.includes('button')) return Promise.resolve(['Submit', 'Cancel']);
    return Promise.resolve([]);
  }),
  $eval: jest.fn().mockResolvedValue('Main body text content'),
  screenshot: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

const createMockBrowser = (page: ReturnType<typeof createMockPage>) => ({
  newPage: jest.fn().mockResolvedValue(page),
  close: jest.fn().mockResolvedValue(undefined),
  isConnected: jest.fn().mockReturnValue(true),
});

// ─── Tests ───────────────────────────────────────────────────
describe('ScraperService', () => {
  let service: ScraperService;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset browser singleton between tests
    (ScraperService as any).browserInstance = null;
    (ScraperService as any).activeRequests = 0;
    service = new ScraperService();
  });

  // ─── sanitizeUrl (private - tested via scrapeWebsite) ──────

  describe('URL Sanitization', () => {
    it('should throw on javascript: protocol', async () => {
      await expect(service.scrapeWebsite('javascript:alert(1)'))
        .rejects.toThrow('Protocol "javascript:" is not allowed');
    });

    it('should throw on data: protocol', async () => {
      await expect(service.scrapeWebsite('data:text/html,<h1>test</h1>'))
        .rejects.toThrow('Protocol "data:" is not allowed');
    });

    it('should throw on file: protocol', async () => {
      await expect(service.scrapeWebsite('file:///etc/passwd'))
        .rejects.toThrow('Protocol "file:" is not allowed');
    });

    it('should throw on ftp: protocol', async () => {
      await expect(service.scrapeWebsite('ftp://example.com'))
        .rejects.toThrow('Protocol "ftp:" is not allowed');
    });

    it('should throw on completely invalid URL', async () => {
      await expect(service.scrapeWebsite('not-a-url'))
        .rejects.toThrow('Invalid URL format');
    });

    it('should throw on empty string URL', async () => {
      await expect(service.scrapeWebsite(''))
        .rejects.toThrow('Invalid URL format');
    });

    it('should allow http: protocol', async () => {
      const mockPage = createMockPage();
      const mockBrowser = createMockBrowser(mockPage);
      (chromium.launch as jest.Mock).mockResolvedValue(mockBrowser);

      await expect(service.scrapeWebsite('http://example.com'))
        .resolves.toBeDefined();
    });

    it('should allow https: protocol', async () => {
      const mockPage = createMockPage();
      const mockBrowser = createMockBrowser(mockPage);
      (chromium.launch as jest.Mock).mockResolvedValue(mockBrowser);

      await expect(service.scrapeWebsite('https://example.com'))
        .resolves.toBeDefined();
    });

    it('should block private IPs in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      await expect(service.scrapeWebsite('http://192.168.1.1'))
        .rejects.toThrow('Private or local URLs are not allowed in production');

      process.env.NODE_ENV = originalEnv;
    });

    it('should block 10.x.x.x range in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      await expect(service.scrapeWebsite('http://10.0.0.1'))
        .rejects.toThrow('Private or local URLs are not allowed in production');

      process.env.NODE_ENV = originalEnv;
    });

    it('should block 172.16.x.x range in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      await expect(service.scrapeWebsite('http://172.16.0.1'))
        .rejects.toThrow('Private or local URLs are not allowed in production');

      process.env.NODE_ENV = originalEnv;
    });

    it('should block localhost in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      await expect(service.scrapeWebsite('http://localhost:3000'))
        .rejects.toThrow('Private or local URLs are not allowed in production');

      process.env.NODE_ENV = originalEnv;
    });

    it('should allow localhost in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const mockPage = createMockPage();
      const mockBrowser = createMockBrowser(mockPage);
      (chromium.launch as jest.Mock).mockResolvedValue(mockBrowser);

      await expect(service.scrapeWebsite('http://localhost:3000'))
        .resolves.toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });
  });

  // ─── scrapeWebsite ──────────────────────────────────────────

  describe('scrapeWebsite', () => {
    it('should return extracted and sanitized content', async () => {
      const mockPage = createMockPage();
      const mockBrowser = createMockBrowser(mockPage);
      (chromium.launch as jest.Mock).mockResolvedValue(mockBrowser);

      const result = await service.scrapeWebsite('https://example.com');

      expect(result).toMatchObject({
        title: expect.any(String),
        headings: expect.any(Array),
        forms: expect.any(Array),
        buttons: expect.any(Array),
        mainText: expect.any(String),
      });
    });

    it('should strip script tags from scraped content', async () => {
      const mockPage = createMockPage({
        title: jest.fn().mockResolvedValue('<script>alert(1)</script>Clean Title'),
        $eval: jest.fn().mockResolvedValue('<script>xss</script>Safe content'),
      });
      const mockBrowser = createMockBrowser(mockPage);
      (chromium.launch as jest.Mock).mockResolvedValue(mockBrowser);

      const result = await service.scrapeWebsite('https://example.com');

      expect(result.title).not.toContain('<script>');
      expect(result.mainText).not.toContain('<script>');
    });

    it('should strip javascript: from scraped content', async () => {
      const mockPage = createMockPage({
        $eval: jest.fn().mockResolvedValue('Click javascript:void(0) here'),
      });
      const mockBrowser = createMockBrowser(mockPage);
      (chromium.launch as jest.Mock).mockResolvedValue(mockBrowser);

      const result = await service.scrapeWebsite('https://example.com');

      expect(result.mainText).not.toContain('javascript:');
    });

    it('should strip event handlers from scraped content', async () => {
      const mockPage = createMockPage({
        $eval: jest.fn().mockResolvedValue('Click <div onclick="evil()">here</div>'),
      });
      const mockBrowser = createMockBrowser(mockPage);
      (chromium.launch as jest.Mock).mockResolvedValue(mockBrowser);

      const result = await service.scrapeWebsite('https://example.com');

      expect(result.mainText).not.toMatch(/on\w+="/);
    });

    it('should use domcontentloaded - not networkidle', async () => {
      const mockPage = createMockPage();
      const mockBrowser = createMockBrowser(mockPage);
      (chromium.launch as jest.Mock).mockResolvedValue(mockBrowser);

      await service.scrapeWebsite('https://example.com');

      expect(mockPage.goto).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ waitUntil: 'domcontentloaded' })
      );
    });

    it('should use 30s timeout - not 300s', async () => {
      const mockPage = createMockPage();
      const mockBrowser = createMockBrowser(mockPage);
      (chromium.launch as jest.Mock).mockResolvedValue(mockBrowser);

      await service.scrapeWebsite('https://example.com');

      expect(mockPage.goto).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ timeout: 30000 })
      );
    });

    it('should always close page even on error', async () => {
      const mockPage = createMockPage({
        goto: jest.fn().mockRejectedValue(new Error('Navigation failed')),
      });
      const mockBrowser = createMockBrowser(mockPage);
      (chromium.launch as jest.Mock).mockResolvedValue(mockBrowser);

      await expect(service.scrapeWebsite('https://example.com'))
        .rejects.toThrow();

      expect(mockPage.close).toHaveBeenCalled();
    });

    it('should throw meaningful error on scrape failure', async () => {
      const mockPage = createMockPage({
        goto: jest.fn().mockRejectedValue(new Error('Timeout exceeded')),
      });
      const mockBrowser = createMockBrowser(mockPage);
      (chromium.launch as jest.Mock).mockResolvedValue(mockBrowser);

      await expect(service.scrapeWebsite('https://example.com'))
        .rejects.toThrow('Timeout exceeded');
    });
  });

  // ─── captureScreenshot ──────────────────────────────────────

  describe('captureScreenshot', () => {
    it('should return filepath string', async () => {
      const mockPage = createMockPage();
      const mockBrowser = createMockBrowser(mockPage);
      (chromium.launch as jest.Mock).mockResolvedValue(mockBrowser);

      const result = await service.captureScreenshot('https://example.com');

      expect(typeof result).toBe('string');
      expect(result).toContain('screenshot_');
      expect(result).toContain('.png');
    });

    it('should create screenshots directory if missing', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      const mockPage = createMockPage();
      const mockBrowser = createMockBrowser(mockPage);
      (chromium.launch as jest.Mock).mockResolvedValue(mockBrowser);

      await service.captureScreenshot('https://example.com');

      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('screenshots'),
        { recursive: true }
      );
    });

    it('should not recreate screenshots directory if it exists', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      const mockPage = createMockPage();
      const mockBrowser = createMockBrowser(mockPage);
      (chromium.launch as jest.Mock).mockResolvedValue(mockBrowser);

      await service.captureScreenshot('https://example.com');

      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });

    it('should always close page even on screenshot failure', async () => {
      const mockPage = createMockPage({
        screenshot: jest.fn().mockRejectedValue(new Error('Screenshot failed')),
      });
      const mockBrowser = createMockBrowser(mockPage);
      (chromium.launch as jest.Mock).mockResolvedValue(mockBrowser);

      await expect(service.captureScreenshot('https://example.com'))
        .rejects.toThrow();

      expect(mockPage.close).toHaveBeenCalled();
    });

    // ← FIX: Covers lines 106-117 (concurrency + decrement on captureScreenshot)
    it('should reject when MAX_CONCURRENT requests are active', async () => {
      (ScraperService as any).activeRequests = 3;

      await expect(service.captureScreenshot('https://example.com'))
        .rejects.toThrow('Scraper is busy, please try again shortly');
    });

    it('should decrement activeRequests after captureScreenshot success', async () => {
      const mockPage = createMockPage();
      const mockBrowser = createMockBrowser(mockPage);
      (chromium.launch as jest.Mock).mockResolvedValue(mockBrowser);

      await service.captureScreenshot('https://example.com');

      expect((ScraperService as any).activeRequests).toBe(0);
    });

    it('should decrement activeRequests after captureScreenshot failure', async () => {
      const mockPage = createMockPage({
        screenshot: jest.fn().mockRejectedValue(new Error('Screenshot failed')),
      });
      const mockBrowser = createMockBrowser(mockPage);
      (chromium.launch as jest.Mock).mockResolvedValue(mockBrowser);

      await expect(service.captureScreenshot('https://example.com'))
        .rejects.toThrow();

      expect((ScraperService as any).activeRequests).toBe(0);
    });

    it('should sanitize URL before screenshot - block javascript: protocol', async () => {
      await expect(service.captureScreenshot('javascript:alert(1)'))
        .rejects.toThrow('Protocol "javascript:" is not allowed');
    });

    it('should sanitize URL before screenshot - block file: protocol', async () => {
      await expect(service.captureScreenshot('file:///etc/passwd'))
        .rejects.toThrow('Protocol "file:" is not allowed');
    });
  });

  // ─── Browser Singleton ──────────────────────────────────────

  describe('Browser Singleton', () => {
    it('should reuse browser instance across requests', async () => {
      const mockPage = createMockPage();
      const mockBrowser = createMockBrowser(mockPage);
      (chromium.launch as jest.Mock).mockResolvedValue(mockBrowser);

      await service.scrapeWebsite('https://example.com');
      await service.scrapeWebsite('https://example.com');

      // Browser launched once, not twice
      expect(chromium.launch).toHaveBeenCalledTimes(1);
    });

    it('should relaunch browser if disconnected', async () => {
      const mockPage = createMockPage();
      const disconnectedBrowser = createMockBrowser(mockPage);
      disconnectedBrowser.isConnected.mockReturnValue(false);

      const freshBrowser = createMockBrowser(mockPage);
      (chromium.launch as jest.Mock)
        .mockResolvedValueOnce(disconnectedBrowser)
        .mockResolvedValueOnce(freshBrowser);

      await service.scrapeWebsite('https://example.com');

      // Simulate browser disconnect
      (ScraperService as any).browserInstance = disconnectedBrowser;

      await service.scrapeWebsite('https://example.com');

      expect(chromium.launch).toHaveBeenCalledTimes(2);
    });
  });

  // ─── Concurrency Guard ──────────────────────────────────────

  describe('Concurrency Guard', () => {
    it('should reject scrapeWebsite when MAX_CONCURRENT requests are active', async () => {
      (ScraperService as any).activeRequests = 3;

      await expect(service.scrapeWebsite('https://example.com'))
        .rejects.toThrow('Scraper is busy, please try again shortly');
    });

    it('should decrement activeRequests after scrapeWebsite success', async () => {
      const mockPage = createMockPage();
      const mockBrowser = createMockBrowser(mockPage);
      (chromium.launch as jest.Mock).mockResolvedValue(mockBrowser);

      await service.scrapeWebsite('https://example.com');

      expect((ScraperService as any).activeRequests).toBe(0);
    });

    it('should decrement activeRequests after scrapeWebsite failure', async () => {
      const mockPage = createMockPage({
        goto: jest.fn().mockRejectedValue(new Error('fail')),
      });
      const mockBrowser = createMockBrowser(mockPage);
      (chromium.launch as jest.Mock).mockResolvedValue(mockBrowser);

      await expect(service.scrapeWebsite('https://example.com'))
        .rejects.toThrow();

      expect((ScraperService as any).activeRequests).toBe(0);
    });
  });

  // ─── closeBrowser (static) ──────────────────────────────────

  describe('closeBrowser', () => {
    it('should close browser and null instance', async () => {
      const mockPage = createMockPage();
      const mockBrowser = createMockBrowser(mockPage);
      (chromium.launch as jest.Mock).mockResolvedValue(mockBrowser);

      // Spin up the singleton
      await service.scrapeWebsite('https://example.com');

      await ScraperService.closeBrowser();

      expect(mockBrowser.close).toHaveBeenCalled();
      expect((ScraperService as any).browserInstance).toBeNull();
    });

    it('should do nothing if browser not initialized', async () => {
      (ScraperService as any).browserInstance = null;

      await expect(ScraperService.closeBrowser()).resolves.not.toThrow();
    });
  });
});
