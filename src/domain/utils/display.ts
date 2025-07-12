import { FIIAnalysis } from '../types/fii';
import chalk from 'chalk';
import { table } from 'table';

export class DisplayUtils {
  // Métodos de formatação
  static formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  static formatPercentage(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value) + '%';
  }

  static formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  static getRecommendationColor(recommendation: 'BUY' | 'HOLD' | 'SELL'): string {
    switch (recommendation) {
      case 'BUY':
        return 'green';
      case 'HOLD':
        return 'yellow';
      case 'SELL':
        return 'red';
      default:
        return 'white';
    }
  }

  static getRecommendationEmoji(recommendation: 'BUY' | 'HOLD' | 'SELL'): string {
    switch (recommendation) {
      case 'BUY':
        return '🟢';
      case 'HOLD':
        return '🟡';
      case 'SELL':
        return '🔴';
      default:
        return '⚪';
    }
  }

  // Métodos de exibição
  static displayTopFiis(analyses: FIIAnalysis[]): void {
    console.log(chalk.blue.bold('\n🏆 TOP FIIs RECOMENDADOS\n'));

    const data = [
      [
        chalk.bold('Rank'),
        chalk.bold('Ticker'),
        chalk.bold('Nome'),
        chalk.bold('Preço'),
        chalk.bold('DY (%)'),
        chalk.bold('P/VP'),
        chalk.bold('Score'),
        chalk.bold('Recomendação')
      ],
      ...analyses.map(analysis => [
        chalk.cyan(analysis.rank.toString()),
        chalk.yellow(analysis.ticker),
        analysis.name.substring(0, 30) + (analysis.name.length > 30 ? '...' : ''),
        chalk.green(`R$ ${analysis.price.toFixed(2)}`),
        chalk.magenta(`${analysis.dividendYield.toFixed(2)}%`),
        analysis.pvp.toFixed(2),
        this.getScoreColor(analysis.score),
        this.getRecommendationColor(analysis.recommendation)
      ])
    ];

    console.log(table(data));
  }

  static displayFIIAnalysis(analysis: FIIAnalysis): void {
    console.log(chalk.blue.bold(`\n📋 ANÁLISE DETALHADA - ${analysis.ticker}\n`));

    const data = [
      [chalk.bold('Campo'), chalk.bold('Valor')],
      ['Ticker', chalk.yellow(analysis.ticker)],
      ['Nome', analysis.name],
      ['Preço', chalk.green(`R$ ${analysis.price.toFixed(2)}`)],
      ['Dividend Yield', chalk.magenta(`${analysis.dividendYield.toFixed(2)}%`)],
      ['P/VP', analysis.pvp.toFixed(2)],
      ['Score', this.getScoreColor(analysis.score)],
      ['Ranking', chalk.cyan(analysis.rank.toString())],
      ['Recomendação', this.getRecommendationColor(analysis.recommendation)],
      ['Análise', analysis.analysis]
    ];

    console.log(table(data));
  }

  static displaySummary(analyses: FIIAnalysis[]): void {
    const summary = {
      total: analyses.length,
      buy: analyses.filter(a => a.recommendation === 'BUY').length,
      hold: analyses.filter(a => a.recommendation === 'HOLD').length,
      sell: analyses.filter(a => a.recommendation === 'SELL').length,
      avgScore: analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length,
      avgDividendYield: analyses.reduce((sum, a) => sum + a.dividendYield, 0) / analyses.length,
      avgPVP: analyses.reduce((sum, a) => sum + a.pvp, 0) / analyses.length
    };

    this.displayAnalysisSummary(summary);
  }

  static displayBuyRecommendations(analyses: FIIAnalysis[]): void {
    const buyAnalyses = analyses.filter(a => a.recommendation === 'BUY');
    console.log(chalk.green.bold(`\n🟢 FIIs COM RECOMENDAÇÃO BUY (${buyAnalyses.length})\n`));
    this.displayTopFiis(buyAnalyses);
  }

  static displayHoldRecommendations(analyses: FIIAnalysis[]): void {
    const holdAnalyses = analyses.filter(a => a.recommendation === 'HOLD');
    console.log(chalk.yellow.bold(`\n🟡 FIIs COM RECOMENDAÇÃO HOLD (${holdAnalyses.length})\n`));
    this.displayTopFiis(holdAnalyses);
  }

  static displaySellRecommendations(analyses: FIIAnalysis[]): void {
    const sellAnalyses = analyses.filter(a => a.recommendation === 'SELL');
    console.log(chalk.red.bold(`\n🔴 FIIs COM RECOMENDAÇÃO SELL (${sellAnalyses.length})\n`));
    this.displayTopFiis(sellAnalyses);
  }

  static displayAnalysisSummary(summary: {
    total: number;
    buy: number;
    hold: number;
    sell: number;
    avgScore: number;
    avgDividendYield: number;
    avgPVP: number;
  }): void {
    console.log(chalk.blue.bold('\n📊 RESUMO DA ANÁLISE\n'));

    const data = [
      [chalk.bold('Métrica'), chalk.bold('Valor')],
      ['Total de FIIs analisados', summary.total.toString()],
      ['Recomendações BUY', chalk.green(summary.buy.toString())],
      ['Recomendações HOLD', chalk.yellow(summary.hold.toString())],
      ['Recomendações SELL', chalk.red(summary.sell.toString())],
      ['Score médio', `${summary.avgScore.toFixed(2)}`],
      ['Dividend Yield médio', `${summary.avgDividendYield.toFixed(2)}%`],
      ['P/VP médio', summary.avgPVP.toFixed(2)]
    ];

    console.log(table(data));
  }

  private static getScoreColor(score: number): string {
    if (score >= 0.7) return chalk.green(score.toFixed(2));
    if (score >= 0.5) return chalk.yellow(score.toFixed(2));
    return chalk.red(score.toFixed(2));
  }

  static displayError(message: string): void {
    console.log(chalk.red(`❌ ${message}`));
  }

  static displaySuccess(message: string): void {
    console.log(chalk.green(`✅ ${message}`));
  }

  static displayInfo(message: string): void {
    console.log(chalk.blue(`ℹ️  ${message}`));
  }
} 