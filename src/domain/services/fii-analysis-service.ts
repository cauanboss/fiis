import { FII, FIIAnalysis, AnalysisConfig } from '../types/fii.js';

export class FIIAnalysisService {
    private config: AnalysisConfig;

    constructor(config?: Partial<AnalysisConfig>) {
        this.config = {
            minDividendYield: 6.0,
            maxPVP: 1.2,
            minPrice: 5.0,
            maxPrice: 1000.0,
            weightDividendYield: 0.4,
            weightPVP: 0.3,
            weightPrice: 0.2,
            weightLiquidity: 0.1,
            ...config
        };
    }

    analyze(fiis: FII[]): FIIAnalysis[] {
        const analyses: FIIAnalysis[] = [];

        for (const fii of fiis) {
            const score = this.calculateScore(fii);
            const recommendation = this.getRecommendation(score, fii);
            const analysis = this.generateAnalysis(fii, score, recommendation);

            analyses.push({
                ticker: fii.ticker,
                name: fii.name,
                price: fii.price,
                dividendYield: fii.dividendYield,
                pvp: fii.pvp,
                score,
                rank: 0, // Será calculado depois
                recommendation,
                analysis
            });
        }

        // Ordenar por score e atribuir rank
        return analyses
            .sort((a, b) => b.score - a.score)
            .map((analysis, index) => ({
                ...analysis,
                rank: index + 1
            }));
    }

    private calculateScore(fii: FII): number {
        const dyScore = Math.min(fii.dividendYield / 10, 1) * this.config.weightDividendYield;
        const pvpScore = Math.max(0, (1 - fii.pvp) / 0.5) * this.config.weightPVP;
        const priceScore = this.calculatePriceScore(fii.price) * this.config.weightPrice;

        return (dyScore + pvpScore + priceScore) * 100;
    }

    private calculatePriceScore(price: number): number {
        if (price < this.config.minPrice || price > this.config.maxPrice) {
            return 0;
        }
        return 1 - ((price - this.config.minPrice) / (this.config.maxPrice - this.config.minPrice));
    }

    private getRecommendation(score: number, fii: FII): 'BUY' | 'HOLD' | 'SELL' {
        if (score >= 70 && fii.dividendYield >= this.config.minDividendYield && fii.pvp <= this.config.maxPVP) {
            return 'BUY';
        }
        if (score >= 50) {
            return 'HOLD';
        }
        return 'SELL';
    }

    private generateAnalysis(fii: FII, score: number, recommendation: 'BUY' | 'HOLD' | 'SELL'): string {
        const analysis = [];

        if (fii.dividendYield >= this.config.minDividendYield) {
            analysis.push(`DY atrativo de ${fii.dividendYield.toFixed(2)}%`);
        } else {
            analysis.push(`DY baixo de ${fii.dividendYield.toFixed(2)}%`);
        }

        if (fii.pvp <= this.config.maxPVP) {
            analysis.push(`P/VP favorável de ${fii.pvp.toFixed(2)}`);
        } else {
            analysis.push(`P/VP alto de ${fii.pvp.toFixed(2)}`);
        }

        analysis.push(`Score de ${score.toFixed(1)}/100`);
        analysis.push(`Recomendação: ${recommendation}`);

        return analysis.join(', ');
    }

    updateConfig(config: Partial<AnalysisConfig>): void {
        this.config = { ...this.config, ...config };
    }
} 