import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { FII, ScrapingResult } from '../../domain/types/fii.js';

export class ClubeFIIScraper {
  private baseUrl = 'https://www.clubefii.com.br';

  async scrape(): Promise<ScrapingResult> {
    let browser;
    try {
      console.log('🔍 Clube FII: Iniciando coleta de dados com Puppeteer...');
      
      browser = await puppeteer.launch({
        headless: "new",
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      await page.goto(`${this.baseUrl}/fiis`, { 
        waitUntil: 'domcontentloaded',
        timeout: 60000 
      });
      
      await page.waitForSelector('table', { timeout: 30000 });
      await page.waitForTimeout(5000);
      
      const html = await page.content();
      const $ = cheerio.load(html);
      const fiis: FII[] = [];

      // Processar tabela de FIIs
      $('table tbody tr').each((index, element) => {
        const $row = $(element);
        const cells = $row.find('td');
        
        if (cells.length >= 6) {
          const ticker = cells.eq(0).text().trim();
          const name = cells.eq(1).text().trim();
          const priceText = cells.eq(2).text().trim();
          const dyText = cells.eq(3).text().trim();
          const pvpText = cells.eq(4).text().trim();
          const lastDivText = cells.eq(5).text().trim();

          if (ticker && priceText) {
            const price = this.parseNumber(priceText);
            const dividendYield = this.parsePercentage(dyText);
            const pvp = this.parseNumber(pvpText);
            const lastDividend = this.parseNumber(lastDivText);

            if (price > 0) {
              const fii: FII = {
                ticker: ticker,
                name: name || ticker,
                price: price,
                dividendYield: dividendYield,
                pvp: pvp,
                lastDividend: lastDividend,
                dividendYield12m: dividendYield,
                priceVariation: 0,
                source: 'Clube FII',
                lastUpdate: new Date()
              };

              fiis.push(fii);
            }
          }
        }
      });

      console.log(`✅ Clube FII: ${fiis.length} FIIs coletados`);

      return {
        success: true,
        data: fiis,
        error: undefined,
        source: 'Clube FII'
      };

    } catch (error) {
      console.log(`✗ Clube FII: Erro ao fazer scraping: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        source: 'Clube FII'
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  private parseNumber(text: string): number {
    if (!text) return 0;
    const cleanText = text.replace(/[^\d.,]/g, '');
    const normalizedText = cleanText.replace(',', '.');
    const number = parseFloat(normalizedText);
    return isNaN(number) ? 0 : number;
  }

  private parsePercentage(text: string): number {
    if (!text) return 0;
    const cleanText = text.replace(/[^\d.,]/g, '');
    const normalizedText = cleanText.replace(',', '.');
    const number = parseFloat(normalizedText);
    return isNaN(number) ? 0 : number;
  }
} 