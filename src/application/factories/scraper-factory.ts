import { ScraperInterface } from '../../domain/interfaces/scraper.interface.js';
import { StatusInvestScraper } from '../scrapers/status-invest-scraper.js';
import { FundsExplorerScraper } from '../scrapers/fundsexplorer-scraper.js';
import { ClubeFIIScraper } from '../scrapers/clubefii-scraper.js';

export class ScraperFactory {
    private static scrapers = new Map<string, () => ScraperInterface>();

    static {
        // Registrar scrapers disponíveis
        ScraperFactory.scrapers.set('status-invest', () => new StatusInvestScraper());
        ScraperFactory.scrapers.set('funds-explorer', () => new FundsExplorerScraper());
        ScraperFactory.scrapers.set('clube-fii', () => new ClubeFIIScraper());
    }

    static createScraper(source: string): ScraperInterface | null {
        const factory = this.scrapers.get(source);
        return factory ? factory() : null;
    }

    static getAvailableSources(): string[] {
        return Array.from(this.scrapers.keys());
    }

    static isSourceAvailable(source: string): boolean {
        return this.scrapers.has(source);
    }
} 