import { ScrapingResult } from '../types/fii.js';

export interface ScraperInterface {
    scrape(): Promise<ScrapingResult>;
    getName(): string;
    isAvailable(): Promise<boolean>;
} 