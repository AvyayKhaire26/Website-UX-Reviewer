import { chromium, Browser, Page } from 'playwright';
import { IScraperService } from '../interfaces/IScraperService';
import { IExtractedContent } from '../interfaces/IReview';
import { logger } from '../config';
import path from 'path';
import fs from 'fs';

export class ScraperService implements IScraperService {
  private browser: Browser | null = null;

  async scrapeWebsite(url: string): Promise<IExtractedContent> {
    let page: Page | null = null;

    try {
      logger.info(`Starting scraping for URL: ${url}`);
      
      this.browser = await chromium.launch({ headless: true });
      page = await this.browser.newPage();
      
      await page.goto(url, { waitUntil: 'networkidle', timeout: 300000 });

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

      logger.info('Website scraped successfully');
      return extractedContent;

    } catch (error) {
      logger.error('Error scraping website', error);
      throw new Error('Failed to scrape website');
    } finally {
      if (page) await page.close();
      if (this.browser) await this.browser.close();
    }
  }

  async captureScreenshot(url: string): Promise<string> {
    let page: Page | null = null;

    try {
      logger.info(`Capturing screenshot for URL: ${url}`);

      this.browser = await chromium.launch({ headless: true });
      page = await this.browser.newPage();
      
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      const screenshotsDir = path.join(process.cwd(), 'screenshots');
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }

      const filename = `screenshot_${Date.now()}.png`;
      const filepath = path.join(screenshotsDir, filename);

      await page.screenshot({ path: filepath, fullPage: true });

      logger.info('Screenshot captured successfully');
      return filepath;

    } catch (error) {
      logger.error('Error capturing screenshot', error);
      throw new Error('Failed to capture screenshot');
    } finally {
      if (page) await page.close();
      if (this.browser) await this.browser.close();
    }
  }
}
