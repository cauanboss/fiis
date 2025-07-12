// Estruturas de dados - usando type
export type FII = {
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
};

export type FIIAnalysis = {
  ticker: string;
  name: string;
  price: number;
  dividendYield: number;
  pvp: number;
  score: number;
  rank: number;
  recommendation: 'BUY' | 'HOLD' | 'SELL';
  analysis: string;
};

export type ScrapingResult = {
  success: boolean;
  data?: FII[];
  error?: string;
  source: string;
};

export type AnalysisConfig = {
  minDividendYield: number;
  maxPVP: number;
  minPrice: number;
  maxPrice: number;
  weightDividendYield: number;
  weightPVP: number;
  weightPrice: number;
  weightLiquidity: number;
};

// Tipos para o Sistema de Alertas
export type AlertType = 'PRICE' | 'DY' | 'PVP' | 'SCORE';
export type AlertCondition = 'ABOVE' | 'BELOW' | 'EQUALS';

export type Alert = {
  id?: string;
  ticker: string;
  type: AlertType;
  condition: AlertCondition;
  value: number;
  active: boolean;
  createdAt?: Date;
  message?: string;
};

export type AlertTrigger = {
  alert: Alert;
  currentValue: number;
  triggeredAt: Date;
  message: string;
};

export type NotificationConfig = {
  email?: string;
  telegram?: string;
  webhook?: string;
  enabled: boolean;
}; 