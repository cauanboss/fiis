import { FIIAnalysis } from '../types/fii';
import chalk from 'chalk';
import { table } from 'table';

export class DisplayUtils {
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

  static displayDetailedAnalysis(analysis: FIIAnalysis): void {
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

  private static getScoreColor(score: number): string {
    if (score >= 0.7) return chalk.green(score.toFixed(2));
    if (score >= 0.5) return chalk.yellow(score.toFixed(2));
    return chalk.red(score.toFixed(2));
  }

  private static getRecommendationColor(recommendation: 'BUY' | 'HOLD' | 'SELL'): string {
    switch (recommendation) {
      case 'BUY':
        return chalk.green.bold('BUY');
      case 'HOLD':
        return chalk.yellow.bold('HOLD');
      case 'SELL':
        return chalk.red.bold('SELL');
      default:
        return recommendation;
    }
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