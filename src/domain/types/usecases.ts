import { FIIAnalysis, AnalysisConfig } from './fii.js';

// AnalyzeFiisUseCase
export type AnalyzeFiisRequest = {
  config?: Partial<AnalysisConfig>;
  limit?: number;
};

export type AnalyzeFiisResponse = {
  analyses: FIIAnalysis[];
  stats: {
    totalFiis: number;
    buyCount: number;
    holdCount: number;
    sellCount: number;
    avgScore: number;
    avgDY: number;
    avgPVP: number;
  };
};

// CollectFiisDataUseCase
export type CollectFiisDataRequest = {
  sources: string[];
  saveToDatabase?: boolean;
};

export type CollectFiisDataResponse = {
  totalCollected: number;
  sources: Record<string, Record<string, unknown>>;
  errors: string[];
};

// CheckAlertsUseCase
export type CheckAlertsRequest = {
  notificationConfig?: Record<string, unknown>;
};

export type CheckAlertsResponse = {
  triggeredCount: number;
  triggeredAlerts: Record<string, unknown>[];
  summary: {
    totalAlerts: number;
    activeAlerts: number;
    notificationsSent: number;
  };
};

// CreateAlertUseCase
export type CreateAlertRequest = {
  ticker: string;
  type: string;
  condition: string;
  value: number;
  message?: string;
};

export type CreateAlertResponse = {
  alertId: string;
  alert: Record<string, unknown>;
  success: boolean;
  message: string;
}; 