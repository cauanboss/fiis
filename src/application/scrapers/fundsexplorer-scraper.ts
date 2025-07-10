import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { FII, ScrapingResult } from '../../domain/types/fii.js';

export class FundsExplorerScraper {
  private baseUrl = 'https://www.fundsexplorer.com.br';

  async scrape(): Promise<ScrapingResult> {
    let browser;
    try {
      console.log('🔍 Funds Explorer: Iniciando coleta de dados com Puppeteer...');
      
      // Iniciar navegador headless
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
      
      // Configurar user agent para parecer um navegador real
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Navegar para a página
      await page.goto(`${this.baseUrl}/ranking`, { 
        waitUntil: 'domcontentloaded',
        timeout: 60000 
      });
      
      // Aguardar a tabela carregar e ter dados
      await page.waitForSelector('table tbody tr', { timeout: 30000 });
      
      // Aguardar um pouco mais para garantir que todos os dados carregaram
      await page.waitForTimeout(5000);
      
      // Extrair o HTML da página
      const html = await page.content();
      const $ = cheerio.load(html);
      const fiis: FII[] = [];

      // Verificar se a tabela existe
      const table = $('table');
      if (table.length === 0) {
        console.log('⚠️  Funds Explorer: Tabela de FIIs não encontrada');
        return {
          success: false,
          data: [],
          error: 'Tabela de FIIs não encontrada',
          source: 'Funds Explorer'
        };
      }

      // Mapear colunas pelo cabeçalho
      const headerRow = $('table thead tr').first();
      const headerMap: { [key: string]: number } = {};
      
      headerRow.find('th').each((index, element) => {
        const headerText = $(element).text().trim();
        headerMap[headerText] = index;
      });

      console.log('🗺️  Funds Explorer: Mapeamento de colunas:', headerMap);

      // Constantes para as colunas que precisamos
      const COL_TICKER = 'Fundos';
      const COL_PRICE = 'Preço Atual (R$)';
      const COL_DY = 'Dividend Yield';
      const COL_PVP = 'P/VP';
      const COL_LAST_DIV = 'Último Dividendo';

      // Verificar se as colunas necessárias existem
      if (!headerMap[COL_TICKER] && !headerMap[COL_PRICE] && !headerMap[COL_DY]) {
        console.log('⚠️  Funds Explorer: Colunas necessárias não encontradas no cabeçalho');
        return {
          success: false,
          data: [],
          error: 'Colunas necessárias não encontradas',
          source: 'Funds Explorer'
        };
      }

      // Processar linhas de dados
      const rows = $('table tbody tr');
      console.log(`📊 Funds Explorer: Encontradas ${rows.length} linhas na tabela`);

      rows.each((index, element) => {
        const $row = $(element);
        const cells = $row.find('td');
        
        // Extrair dados das células
        const ticker = headerMap[COL_TICKER] !== undefined ? 
          cells.eq(headerMap[COL_TICKER]).text().trim() : '';
        const priceText = headerMap[COL_PRICE] !== undefined ? 
          cells.eq(headerMap[COL_PRICE]).text().trim() : '';
        const dyText = headerMap[COL_DY] !== undefined ? 
          cells.eq(headerMap[COL_DY]).text().trim() : '';
        const pvpText = headerMap[COL_PVP] !== undefined ? 
          cells.eq(headerMap[COL_PVP]).text().trim() : '';
        const lastDivText = headerMap[COL_LAST_DIV] !== undefined ? 
          cells.eq(headerMap[COL_LAST_DIV]).text().trim() : '';

        // Log para debug
        console.log(`[${index}] ${ticker} | Preço: ${priceText} | DY: ${dyText} | P/VP: ${pvpText} | Últ. Div: ${lastDivText}`);

        if (ticker && priceText) {
          const price = this.parseNumber(priceText);
          const dividendYield = this.parsePercentage(dyText);
          const pvp = this.parseNumber(pvpText);
          const lastDividend = this.parseNumber(lastDivText);

          if (price > 0) {
            const fii: FII = {
              ticker: ticker,
              name: ticker, // Nome é o mesmo do ticker por enquanto
              price: price,
              dividendYield: dividendYield,
              pvp: pvp,
              lastDividend: lastDividend,
              dividendYield12m: dividendYield, // Usar DY atual como 12M por enquanto
              priceVariation: 0, // Não temos variação de preço no Funds Explorer
              source: 'Funds Explorer',
              lastUpdate: new Date()
            };

            fiis.push(fii);
          }
        }
      });

      console.log(`✅ Funds Explorer: ${fiis.length} FIIs coletados de ${rows.length} linhas processadas`);

      return {
        success: true,
        data: fiis,
        error: undefined,
        source: 'Funds Explorer'
      };

    } catch (error) {
      console.log(`✗ Funds Explorer: Erro ao fazer scraping: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        source: 'Funds Explorer'
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  private parseNumber(text: string): number {
    if (!text) return 0;
    
    // Remove caracteres não numéricos exceto ponto e vírgula
    const cleanText = text.replace(/[^\d.,]/g, '');
    
    // Substitui vírgula por ponto para decimal
    const normalizedText = cleanText.replace(',', '.');
    
    const number = parseFloat(normalizedText);
    return isNaN(number) ? 0 : number;
  }

  private parsePercentage(text: string): number {
    if (!text) return 0;
    
    // Remove o símbolo % e outros caracteres
    const cleanText = text.replace(/[^\d.,]/g, '');
    const normalizedText = cleanText.replace(',', '.');
    
    const number = parseFloat(normalizedText);
    return isNaN(number) ? 0 : number;
  }
} 