import axios from 'axios';
import { FII, ScrapingResult } from '../../domain/types/fii';
import { BRAPI_CONFIG } from '../../infrastructure/config/brapi';

export class BrapiScraper {
  private baseUrl = BRAPI_CONFIG.BASE_URL;
  private token: string;

  constructor(token?: string) {
    this.token = token || BRAPI_CONFIG.TOKEN;
  }

  async scrape(): Promise<ScrapingResult> {
    try {
      console.log('🔍 Brapi: Iniciando coleta de dados...');

      // Buscar lista de FIIs (todos os ativos que terminam com 11)
      const fiis = await this.getFIIList();

      if (fiis.length === 0) {
        console.log('⚠️  Brapi: Nenhum FII encontrado');
        return { success: false, data: [], error: 'Nenhum FII encontrado', source: 'Brapi' };
      }

      console.log(`📊 Brapi: ${fiis.length} FIIs encontrados, coletando dados detalhados...`);

      // Coletar dados detalhados de cada FII (em lotes para não sobrecarregar a API)
      const detailedFiis: FII[] = [];
      const batchSize = BRAPI_CONFIG.BATCH_SIZE;

      for (let i = 0; i < fiis.length; i += batchSize) {
        const batch = fiis.slice(i, i + batchSize);
        const batchData = await Promise.all(
          batch.map(fii => this.getFIIDetails(fii))
        );

        detailedFiis.push(...batchData.filter(fii => fii !== null));

        // Pequena pausa entre lotes para não sobrecarregar a API
        if (i + batchSize < fiis.length) {
          await new Promise(resolve => setTimeout(resolve, BRAPI_CONFIG.BATCH_DELAY));
        }
      }

      console.log(`✅ Brapi: ${detailedFiis.length} FIIs coletados com sucesso`);

      return {
        success: true,
        data: detailedFiis,
        error: undefined,
        source: 'Brapi'
      };

    } catch (error) {
      console.error('❌ Brapi: Erro ao coletar dados:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        source: 'Brapi'
      };
    }
  }

  private async getFIIList(): Promise<string[]> {
    try {
      // Buscar todos os ativos que terminam com 11 (padrão dos FIIs)
      const response = await axios.get(`${this.baseUrl}/quote/list`, {
        params: {
          search: '11',
          limit: 500, // Buscar mais FIIs
          token: this.token
        },
        timeout: BRAPI_CONFIG.REQUEST_TIMEOUT
      });

      if (!response.data || !response.data.results) {
        return [];
      }

      // Filtrar apenas FIIs (ativos que terminam com 11)
      const fiis = response.data.results
        .filter((item: Record<string, unknown>) => item.symbol && typeof item.symbol === 'string' && item.symbol.endsWith('11'))
        .map((item: Record<string, unknown>) => item.symbol as string);

      return fiis;

    } catch (error) {
      console.error('❌ Brapi: Erro ao buscar lista de FIIs:', error);
      return [];
    }
  }

  private async getFIIDetails(symbol: string): Promise<FII | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/quote/${symbol}`, {
        params: {
          modules: 'dividends,earnings,financials',
          token: this.token
        },
        timeout: BRAPI_CONFIG.REQUEST_TIMEOUT
      });

      if (!response.data || !response.data.results || response.data.results.length === 0) {
        return null;
      }

      const data = response.data.results[0];
      const dividends = data.dividends || [];

      // Calcular dividend yield dos últimos 12 meses
      const last12MonthsDividends = dividends
        .filter((div: Record<string, unknown>) => {
          const paymentDate = new Date(div.paymentDate as string);
          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
          return paymentDate >= oneYearAgo;
        })
        .reduce((sum: number, div: Record<string, unknown>) => sum + ((div.amount as number) || 0), 0);

      const dividendYield = data.regularMarketPrice > 0
        ? (last12MonthsDividends / data.regularMarketPrice) * 100
        : 0;

      // Calcular rendimento médio mensal dos últimos 12 meses (não usado atualmente)
      // const monthlyDividends = dividends
      //   .filter((div: Record<string, unknown>) => {
      //     const paymentDate = new Date(div.paymentDate as string);
      //     const oneYearAgo = new Date();
      //     oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      //     return paymentDate >= oneYearAgo;
      //   })
      //   .slice(0, 12); // Últimos 12 meses

      // const averageMonthlyDividend = monthlyDividends.length > 0
      //   ? monthlyDividends.reduce((sum: number, div: Record<string, unknown>) => sum + ((div.amount as number) || 0), 0) / monthlyDividends.length
      //   : 0;

      const fii: FII = {
        ticker: symbol,
        name: data.longName || data.shortName || symbol,
        price: data.regularMarketPrice || 0,
        dividendYield: dividendYield,
        pvp: data.priceToBook || 0,
        lastDividend: dividends.length > 0 ? dividends[0].amount : 0,
        dividendYield12m: dividendYield,
        priceVariation: data.regularMarketChangePercent || 0,
        source: 'Brapi',
        lastUpdate: new Date()
      };

      return fii;

    } catch (error) {
      console.error(`❌ Brapi: Erro ao coletar dados do ${symbol}:`, error);
      return null;
    }
  }
} 