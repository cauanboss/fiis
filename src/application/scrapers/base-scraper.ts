import axios, { AxiosInstance } from 'axios';
import { FII, ScrapingResult } from '../../domain/types/fii.js';

export abstract class BaseScraper {
  protected httpClient: AxiosInstance;
  protected baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.httpClient = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
  }

  abstract scrape(): Promise<ScrapingResult>;

  protected async makeRequest(url: string): Promise<string> {
    try {
      const response = await this.httpClient.get(url);
      return response.data;
    } catch (error) {
      throw new Error(`Erro ao fazer requisição para ${url}: ${error}`);
    }
  }

  protected parseNumber(value: string): number {
    if (!value) return 0;
    
    // Remove caracteres não numéricos exceto vírgula e ponto
    const cleanValue = value.replace(/[^\d,.-]/g, '');
    
    // Substitui vírgula por ponto para decimal
    const normalizedValue = cleanValue.replace(',', '.');
    
    const parsed = parseFloat(normalizedValue);
    return isNaN(parsed) ? 0 : parsed;
  }

  protected parsePercentage(value: string): number {
    if (!value) return 0;
    
    const cleanValue = value.replace(/[^\d,.-]/g, '');
    const normalizedValue = cleanValue.replace(',', '.');
    
    const parsed = parseFloat(normalizedValue);
    return isNaN(parsed) ? 0 : parsed;
  }

  protected createFII(
    ticker: string,
    name: string,
    price: number,
    dividendYield: number,
    pvp: number,
    lastDividend: number = 0,
    dividendYield12m: number = 0,
    priceVariation: number = 0
  ): FII {
    return {
      ticker: ticker.toUpperCase(),
      name,
      price,
      dividendYield,
      pvp,
      lastDividend,
      dividendYield12m,
      priceVariation,
      source: this.constructor.name,
      lastUpdate: new Date()
    };
  }
} 