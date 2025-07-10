export interface FII {
  ticker: string;
  name: string;
  price: number;
  dividendYield: number;
  pvp: number; // Preço sobre Valor Patrimonial
  lastDividend: number;
  dividendYield12m: number;
  priceVariation: number;
  source: string;
  lastUpdate: Date;
}

export interface FIIAnalysis {
  ticker: string;
  name: string;
  price: number;
  dividendYield: number;
  pvp: number;
  score: number;
  rank: number;
  recommendation: 'BUY' | 'HOLD' | 'SELL';
  analysis: string;
}

export interface ScrapingResult {
  success: boolean;
  data?: FII[];
  error?: string;
  source: string;
}

export interface AnalysisConfig {
  minDividendYield: number;
  maxPVP: number;
  minPrice: number;
  maxPrice: number;
  weightDividendYield: number;
  weightPVP: number;
  weightPrice: number;
  weightLiquidity: number;
} 