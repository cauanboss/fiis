import axios from 'axios';
import { BaseScraper } from './base-scraper.js';
import { FII, ScrapingResult } from '../../domain/types/fii.js';

export class StatusInvestScraper extends BaseScraper {
  constructor() {
    super('https://statusinvest.com.br');
  }

  async scrape(): Promise<ScrapingResult> {
    try {
      // Endpoint da API pública do Status Invest para FIIs
      const url = 'https://statusinvest.com.br/fiis/advancedsearch';
      const response = await axios.post(url, {
        search: '',
        segment: [],
        gestor: [],
        orderby: 'dy12m',
        order: 'desc',
        take: 1000,
        page: 1
      }, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': 'https://statusinvest.com.br/fiis/mais-rentaveis'
        }
      });
      const data = response.data?.data || [];
      const fiis: FII[] = data.map((item: Record<string, unknown>) => {
        return {
          ticker: item.ticker,
          name: item.fantasyName || item.name || '',
          price: item.currentPrice || 0,
          dividendYield: item.dy12m || 0,
          pvp: item.p_vp || 0,
          lastDividend: item.lastdividend || 0,
          dividendYield12m: item.dy12m || 0,
          priceVariation: item.variation || 0,
          source: 'Status Invest',
          lastUpdate: new Date()
        };
      });
      if (fiis.length === 0) {
        console.warn('[StatusInvestScraper] Nenhum FII retornado pela API JSON.');
      }
      return {
        success: true,
        data: fiis,
        source: 'Status Invest'
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao fazer scraping da API JSON do Status Invest: ${error}`,
        source: 'Status Invest'
      };
    }
  }
} 