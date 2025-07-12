import { ScrapingResult } from '../types/fii.js';

export interface ScraperInterface {
  scrape(): Promise<ScrapingResult>;
}

export interface ScraperRepositoryInterface {
  getScraper(source: string): ScraperInterface | null;
  getAllScrapers(): Map<string, ScraperInterface>;
  checkScraperHealth(source: string): Promise<boolean>;
} 