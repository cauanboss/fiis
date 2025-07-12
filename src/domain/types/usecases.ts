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
  sources: Record<string, any>;
  errors: string[];
};

// CheckAlertsUseCase
export type CheckAlertsRequest = {
  notificationConfig?: any;
};

export type CheckAlertsResponse = {
  triggeredCount: number;
  triggeredAlerts: any[];
  summary: {
    totalAlerts: number;
    activeAlerts: number;
    notificationsSent: number;
  };
};

// CreateAlertUseCase
export type CreateAlertRequest = {
  ticker: string;
  type: any;
  condition: any;
  value: number;
  message?: string;
};

export type CreateAlertResponse = {
  alertId: string;
  alert: any;
  success: boolean;
  message: string;
}; 