import { chromium, Browser, Page } from 'playwright';
import { IScraperService } from '../interfaces/IScraperService';
import { IExtractedContent } from '../interfaces/IReview';
import { logger } from '../config';
import path from 'path';
import fs from 'fs';

export class ScraperService implements IScraperService {

  // Browser singleton - reused across requests instead of spawning per request
  private static browserInstance: Browser | null = null;

  // Concurrency guard - prevent OOM crash under load
  private static activeRequests = 0;
  private static readonly MAX_CONCURRENT = 3;

  private async getBrowser(): Promise<Browser> {
    if (
      !ScraperService.browserInstance ||
      !ScraperService.browserInstance.isConnected()
    ) {
      logger.info('Launching new Chromium browser instance');
      ScraperService.browserInstance = await chromium.launch({ headless: true });
    }
    return ScraperService.browserInstance;
  }

  private checkConcurrencyLimit(): void {
    if (ScraperService.activeRequests >= ScraperService.MAX_CONCURRENT) {
      throw new Error('Scraper is busy, please try again shortly');
    }
  }

  // Sanitize URL before passing to Playwright
  private sanitizeUrl(url: string): string {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new Error('Invalid URL format');
    }

    const allowedProtocols = ['http:', 'https:'];
    if (!allowedProtocols.includes(parsed.protocol)) {
      throw new Error(`Protocol "${parsed.protocol}" is not allowed`);
    }

    // Block private IPs ONLY in production - allow localhost for dev/testing
    if (process.env.NODE_ENV === 'production') {
      const privateIPPatterns = [
        /^10\./,
        /^192\.168\./,
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
        /^127\./,
        /^0\.0\.0\.0/,
      ];
      if (
        parsed.hostname === 'localhost' ||
        privateIPPatterns.some(p => p.test(parsed.hostname))
      ) {
        throw new Error('Private or local URLs are not allowed in production');
      }
    }

    return `${parsed.protocol}//${parsed.hostname}${parsed.port ? ':' + parsed.port : ''}${parsed.pathname}${parsed.search}`;
  }

  // Sanitize extracted text - strip XSS vectors from scraped content
  private sanitizeText(text: string): string {
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .trim();
  }

  private sanitizeArray(arr: string[]): string[] {
    return arr
      .map(item => this.sanitizeText(item))
      .filter(item => item.length > 0);
  }

  async scrapeWebsite(url: string): Promise<IExtractedContent> {
    // Check concurrency BEFORE allocating any resources
    this.checkConcurrencyLimit();
    ScraperService.activeRequests++;

    let page: Page | null = null;

    try {
      const sanitizedUrl = this.sanitizeUrl(url);
      logger.info(`Starting scraping for URL: ${sanitizedUrl} [active: ${ScraperService.activeRequests}/${ScraperService.MAX_CONCURRENT}]`);

      // Reuse browser singleton instead of spawning new instance
      const browser = await this.getBrowser();
      page = await browser.newPage();

      // domcontentloaded is faster and more reliable than networkidle
      // networkidle waits for ads/trackers/websockets - most sites never settle
      await page.goto(sanitizedUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

      const extractedContent: IExtractedContent = {
        title: await page.title(),
        headings: await page.$$eval('h1, h2, h3, h4, h5, h6', (elements) =>
          elements.map((el) => el.textContent?.trim() || '').filter(Boolean)
        ),
        forms: await page.$$eval('form', (elements) =>
          elements.map((el, idx) => `Form ${idx + 1}: ${el.id || el.className || 'unnamed'}`)
        ),
        buttons: await page.$$eval('button, input[type="button"], input[type="submit"]', (elements) =>
          elements.map((el) => el.textContent?.trim() || (el as HTMLInputElement).value || 'Unnamed Button')
        ),
        mainText: await page.$eval('body', (body) => {
          const clone = body.cloneNode(true) as HTMLElement;
          clone.querySelectorAll('script, style, nav, footer, header').forEach((el) => el.remove());
          return clone.textContent?.trim().slice(0, 5000) || '';
        }),
      };

      // Sanitize ALL extracted content before returning
      const sanitized: IExtractedContent = {
        title: this.sanitizeText(extractedContent.title),
        headings: this.sanitizeArray(extractedContent.headings),
        forms: this.sanitizeArray(extractedContent.forms),
        buttons: this.sanitizeArray(extractedContent.buttons),
        mainText: this.sanitizeText(extractedContent.mainText),
      };

      logger.info('Website scraped successfully');
      return sanitized;

    } catch (error: any) {
      logger.error('Error scraping website', error);
      throw new Error(error.message || 'Failed to scrape website');
    } finally {
      if (page) await page.close();
      ScraperService.activeRequests--;
    }
  }

  async captureScreenshot(url: string): Promise<string> {
    // Check concurrency BEFORE allocating any resources
    this.checkConcurrencyLimit();
    ScraperService.activeRequests++;

    let page: Page | null = null;

    try {
      const sanitizedUrl = this.sanitizeUrl(url);
      logger.info(`Capturing screenshot for URL: ${sanitizedUrl} [active: ${ScraperService.activeRequests}/${ScraperService.MAX_CONCURRENT}]`);

      // Reuse browser singleton
      const browser = await this.getBrowser();
      page = await browser.newPage();

      await page.goto(sanitizedUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

      const screenshotsDir = path.join(process.cwd(), 'screenshots');
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }

      const filename = `screenshot_${Date.now()}.png`;
      const filepath = path.join(screenshotsDir, filename);

      await page.screenshot({ path: filepath, fullPage: true });

      logger.info('Screenshot captured successfully');
      return filepath;

    } catch (error: any) {
      logger.error('Error capturing screenshot', error);
      throw new Error(error.message || 'Failed to capture screenshot');
    } finally {
      if (page) await page.close();
      ScraperService.activeRequests--;
    }
  }

  // Graceful shutdown - call this on process exit
  static async closeBrowser(): Promise<void> {
    if (ScraperService.browserInstance?.isConnected()) {
      await ScraperService.browserInstance.close();
      ScraperService.browserInstance = null;
      logger.info('Browser instance closed');
    }
  }
}
