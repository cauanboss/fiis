import { PrismaClient } from '@prisma/client';
import { FII, FIIAnalysis } from '../../../domain/types/fii.js';

export interface FIIHistory {
  id?: number;
  ticker: string;
  price: number;
  dividendYield: number;
  pvp: number;
  lastDividend: number;
  source: string;
  timestamp: Date;
}

export class FIIRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async saveFiis(fiis: FII[]): Promise<void> {
    const operations = fiis.map(fii => 
      this.prisma.fII.upsert({
        where: { ticker: fii.ticker },
        update: {
          name: fii.name,
          price: fii.price,
          dividendYield: fii.dividendYield,
          pvp: fii.pvp,
          lastDividend: fii.lastDividend,
          dividendYield12m: fii.dividendYield12m,
          priceVariation: fii.priceVariation,
          source: fii.source,
          lastUpdate: fii.lastUpdate
        },
        create: {
          ticker: fii.ticker,
          name: fii.name,
          price: fii.price,
          dividendYield: fii.dividendYield,
          pvp: fii.pvp,
          lastDividend: fii.lastDividend,
          dividendYield12m: fii.dividendYield12m,
          priceVariation: fii.priceVariation,
          source: fii.source,
          lastUpdate: fii.lastUpdate
        }
      })
    );

    await this.prisma.$transaction(operations);
  }

  async saveFIIHistory(fiis: FII[]): Promise<void> {
    const historyRecords = fiis.map(fii => ({
      ticker: fii.ticker,
      price: fii.price,
      dividendYield: fii.dividendYield,
      pvp: fii.pvp,
      lastDividend: fii.lastDividend,
      source: fii.source,
      timestamp: new Date()
    }));

    await this.prisma.fIIHistory.createMany({
      data: historyRecords
    });
  }

  async getFiis(): Promise<FII[]> {
    const fiis = await this.prisma.fII.findMany({
      orderBy: { ticker: 'asc' }
    });

    return fiis.map(fii => ({
      ticker: fii.ticker,
      name: fii.name,
      price: fii.price,
      dividendYield: fii.dividendYield,
      pvp: fii.pvp,
      lastDividend: fii.lastDividend,
      dividendYield12m: fii.dividendYield12m,
      priceVariation: fii.priceVariation,
      source: fii.source,
      lastUpdate: fii.lastUpdate
    }));
  }

  async getFIIHistory(ticker: string, days: number = 30): Promise<FIIHistory[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const history = await this.prisma.fIIHistory.findMany({
      where: {
        ticker,
        timestamp: {
          gte: cutoffDate
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    return history.map(record => ({
      ticker: record.ticker,
      price: record.price,
      dividendYield: record.dividendYield,
      pvp: record.pvp,
      lastDividend: record.lastDividend,
      source: record.source,
      timestamp: record.timestamp
    }));
  }

  async saveAnalyses(analyses: FIIAnalysis[]): Promise<void> {
    const analysisRecords = analyses.map(analysis => ({
      ticker: analysis.ticker,
      name: analysis.name,
      price: analysis.price,
      dividendYield: analysis.dividendYield,
      pvp: analysis.pvp,
      score: analysis.score,
      rank: analysis.rank,
      recommendation: analysis.recommendation,
      analysis: analysis.analysis,
      timestamp: new Date()
    }));

    await this.prisma.fIIAnalysis.createMany({
      data: analysisRecords
    });
  }

  async getLatestAnalyses(): Promise<FIIAnalysis[]> {
    // Buscar a análise mais recente
    const latestTimestamp = await this.prisma.fIIAnalysis.findFirst({
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true }
    });

    if (!latestTimestamp) {
      return [];
    }

    const analyses = await this.prisma.fIIAnalysis.findMany({
      where: { timestamp: latestTimestamp.timestamp },
      orderBy: { rank: 'asc' }
    });

    return analyses.map(analysis => ({
      ticker: analysis.ticker,
      name: analysis.name,
      price: analysis.price,
      dividendYield: analysis.dividendYield,
      pvp: analysis.pvp,
      score: analysis.score,
      rank: analysis.rank,
      recommendation: analysis.recommendation as 'BUY' | 'HOLD' | 'SELL',
      analysis: analysis.analysis
    }));
  }

  async getFIIByTicker(ticker: string): Promise<FII | null> {
    const fii = await this.prisma.fII.findUnique({
      where: { ticker: ticker.toUpperCase() }
    });

    if (!fii) return null;

    return {
      ticker: fii.ticker,
      name: fii.name,
      price: fii.price,
      dividendYield: fii.dividendYield,
      pvp: fii.pvp,
      lastDividend: fii.lastDividend,
      dividendYield12m: fii.dividendYield12m,
      priceVariation: fii.priceVariation,
      source: fii.source,
      lastUpdate: fii.lastUpdate
    };
  }

  async getTopFiis(limit: number = 10): Promise<FII[]> {
    const fiis = await this.prisma.fII.findMany({
      orderBy: { dividendYield: 'desc' },
      take: limit
    });

    return fiis.map(fii => ({
      ticker: fii.ticker,
      name: fii.name,
      price: fii.price,
      dividendYield: fii.dividendYield,
      pvp: fii.pvp,
      lastDividend: fii.lastDividend,
      dividendYield12m: fii.dividendYield12m,
      priceVariation: fii.priceVariation,
      source: fii.source,
      lastUpdate: fii.lastUpdate
    }));
  }

  async getFiisBySource(source: string): Promise<FII[]> {
    const fiis = await this.prisma.fII.findMany({
      where: { source },
      orderBy: { ticker: 'asc' }
    });

    return fiis.map(fii => ({
      ticker: fii.ticker,
      name: fii.name,
      price: fii.price,
      dividendYield: fii.dividendYield,
      pvp: fii.pvp,
      lastDividend: fii.lastDividend,
      dividendYield12m: fii.dividendYield12m,
      priceVariation: fii.priceVariation,
      source: fii.source,
      lastUpdate: fii.lastUpdate
    }));
  }

  async getDatabaseStats(): Promise<{
    totalFiis: number;
    totalHistoryRecords: number;
    totalAnalyses: number;
  }> {
    const [totalFiis, totalHistoryRecords, totalAnalyses] = await Promise.all([
      this.prisma.fII.count(),
      this.prisma.fIIHistory.count(),
      this.prisma.fIIAnalysis.count()
    ]);

    return {
      totalFiis,
      totalHistoryRecords,
      totalAnalyses
    };
  }
} 