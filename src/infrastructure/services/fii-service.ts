import { StatusInvestScraper } from '../application/scrapers/status-invest-scraper.js';
import { FundsExplorerScraper } from '../application/scrapers/fundsexplorer-scraper.js';
import { BrapiScraper } from '../application/scrapers/brapi-scraper.js';
import { ClubeFIIScraper } from '../application/scrapers/clubefii-scraper.js';
import { FIIAnalyzer } from '../application/analysis/fii-analyzer.js';
import { FII, FIIAnalysis } from '../domain/types/fii.js';
import chalk from 'chalk';
import ora from 'ora';

export class FIIService {
  private scrapers: Array<StatusInvestScraper | FundsExplorerScraper | BrapiScraper | ClubeFIIScraper>;
  private analyzer: FIIAnalyzer;

  constructor() {
    this.scrapers = [
      new StatusInvestScraper(),
      new FundsExplorerScraper(),
      new BrapiScraper(),
      new ClubeFIIScraper()
    ];
    this.analyzer = new FIIAnalyzer();
  }

  async collectData(): Promise<FII[]> {
    const allFiis: FII[] = [];
    const spinner = ora('Coletando dados dos FIIs...').start();

    try {
      const scrapingPromises = this.scrapers.map(scraper => scraper.scrape());
      const results = await Promise.allSettled(scrapingPromises);

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const scrapingResult = result.value;
          if (scrapingResult.success && scrapingResult.data) {
            allFiis.push(...scrapingResult.data);
            console.log(chalk.green(`✓ ${scrapingResult.source}: ${scrapingResult.data.length} FIIs coletados`));
          } else {
            console.log(chalk.red(`✗ ${scrapingResult.source}: ${scrapingResult.error}`));
          }
        } else {
          console.log(chalk.red(`✗ Erro no scraper ${index + 1}: ${result.reason}`));
        }
      });

      // Remove duplicatas baseado no ticker
      const uniqueFiis = this.removeDuplicates(allFiis);
      
      spinner.succeed(`Coleta concluída: ${uniqueFiis.length} FIIs únicos encontrados`);
      return uniqueFiis;
    } catch (error) {
      spinner.fail('Erro na coleta de dados');
      throw error;
    }
  }

  async analyzeFiis(fiis: FII[]): Promise<FIIAnalysis[]> {
    const spinner = ora('Analisando FIIs...').start();
    
    try {
      const analyses = this.analyzer.analyze(fiis);
      spinner.succeed(`Análise concluída: ${analyses.length} FIIs analisados`);
      return analyses;
    } catch (error) {
      spinner.fail('Erro na análise dos FIIs');
      throw error;
    }
  }

  async getTopFiis(limit: number = 10): Promise<FIIAnalysis[]> {
    const fiis = await this.collectData();
    const analyses = await this.analyzeFiis(fiis);
    return analyses.slice(0, limit);
  }

  async getFiisByRecommendation(recommendation: 'BUY' | 'HOLD' | 'SELL'): Promise<FIIAnalysis[]> {
    const fiis = await this.collectData();
    const analyses = await this.analyzeFiis(fiis);
    return analyses.filter(a => a.recommendation === recommendation);
  }

  getTopFiisFromAnalyses(analyses: FIIAnalysis[], limit: number = 5): FIIAnalysis[] {
    return analyses.slice(0, limit);
  }

  private removeDuplicates(fiis: FII[]): FII[] {
    const seen = new Set<string>();
    return fiis.filter(fii => {
      const duplicate = seen.has(fii.ticker);
      seen.add(fii.ticker);
      return !duplicate;
    });
  }

  getAnalysisSummary(analyses: FIIAnalysis[]): {
    total: number;
    buy: number;
    hold: number;
    sell: number;
    avgScore: number;
    avgDividendYield: number;
    avgPVP: number;
  } {
    const buyFiis = analyses.filter(a => a.recommendation === 'BUY');
    const holdFiis = analyses.filter(a => a.recommendation === 'HOLD');
    const sellFiis = analyses.filter(a => a.recommendation === 'SELL');

    const avgScore = analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length;
    const avgDividendYield = analyses.reduce((sum, a) => sum + a.dividendYield, 0) / analyses.length;
    const avgPVP = analyses.reduce((sum, a) => sum + a.pvp, 0) / analyses.length;

    return {
      total: analyses.length,
      buy: buyFiis.length,
      hold: holdFiis.length,
      sell: sellFiis.length,
      avgScore: Math.round(avgScore * 100) / 100,
      avgDividendYield: Math.round(avgDividendYield * 100) / 100,
      avgPVP: Math.round(avgPVP * 100) / 100
    };
  }
} 