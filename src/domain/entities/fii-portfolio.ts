import { FII, FIIAnalysis } from '../types/fii.js';
import { Ticker } from '../value-objects/ticker.js';

export class FIIPortfolio {
    private fiis: Map<string, FII> = new Map();
    private analyses: Map<string, FIIAnalysis> = new Map();

    addFII(fii: FII): void {
        const ticker = new Ticker(fii.ticker);
        this.fiis.set(ticker.getValue(), fii);
    }

    removeFII(ticker: string): boolean {
        const tickerObj = new Ticker(ticker);
        return this.fiis.delete(tickerObj.getValue());
    }

    getFII(ticker: string): FII | null {
        const tickerObj = new Ticker(ticker);
        return this.fiis.get(tickerObj.getValue()) || null;
    }

    getAllFiis(): FII[] {
        return Array.from(this.fiis.values());
    }

    addAnalysis(analysis: FIIAnalysis): void {
        const ticker = new Ticker(analysis.ticker);
        this.analyses.set(ticker.getValue(), analysis);
    }

    getAnalysis(ticker: string): FIIAnalysis | null {
        const tickerObj = new Ticker(ticker);
        return this.analyses.get(tickerObj.getValue()) || null;
    }

    getAllAnalyses(): FIIAnalysis[] {
        return Array.from(this.analyses.values());
    }

    getTopFiis(limit: number = 10): FIIAnalysis[] {
        return this.getAllAnalyses()
            .sort((a, b) => a.rank - b.rank)
            .slice(0, limit);
    }

    getFiisByRecommendation(recommendation: 'BUY' | 'HOLD' | 'SELL'): FIIAnalysis[] {
        return this.getAllAnalyses()
            .filter(analysis => analysis.recommendation === recommendation);
    }

    getPortfolioStats(): {
        totalFiis: number;
        buyCount: number;
        holdCount: number;
        sellCount: number;
        avgScore: number;
        avgDY: number;
        avgPVP: number;
    } {
        const analyses = this.getAllAnalyses();

        if (analyses.length === 0) {
            return {
                totalFiis: 0,
                buyCount: 0,
                holdCount: 0,
                sellCount: 0,
                avgScore: 0,
                avgDY: 0,
                avgPVP: 0
            };
        }

        const buyCount = analyses.filter(a => a.recommendation === 'BUY').length;
        const holdCount = analyses.filter(a => a.recommendation === 'HOLD').length;
        const sellCount = analyses.filter(a => a.recommendation === 'SELL').length;

        const avgScore = analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length;
        const avgDY = analyses.reduce((sum, a) => sum + a.dividendYield, 0) / analyses.length;
        const avgPVP = analyses.reduce((sum, a) => sum + a.pvp, 0) / analyses.length;

        return {
            totalFiis: analyses.length,
            buyCount,
            holdCount,
            sellCount,
            avgScore,
            avgDY,
            avgPVP
        };
    }
} 