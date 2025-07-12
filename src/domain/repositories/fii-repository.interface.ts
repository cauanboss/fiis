import { FII, FIIAnalysis } from '../types/fii.js';

export interface FIIRepositoryInterface {
  saveFiis(fiis: FII[]): Promise<void>;
  getFiis(): Promise<FII[]>;
  getFIIByTicker(ticker: string): Promise<FII | null>;
  getTopFiis(limit?: number): Promise<FII[]>;
  getFiisBySource(source: string): Promise<FII[]>;
  saveFIIHistory(fiis: FII[]): Promise<void>;
  getFIIHistory(ticker: string, days?: number): Promise<any[]>;
  saveAnalyses(analyses: FIIAnalysis[]): Promise<void>;
  getLatestAnalyses(): Promise<FIIAnalysis[]>;
  getDatabaseStats(): Promise<{
    totalFiis: number;
    totalHistoryRecords: number;
    totalAnalyses: number;
  }>;
} 