import { Alert } from '../types/fii.js';

export interface AlertRepositoryInterface {
  createAlert(alert: Omit<Alert, 'id' | 'createdAt'>): Promise<string>;
  getAlerts(): Promise<Alert[]>;
  getAlertsByTicker(ticker: string): Promise<Alert[]>;
  updateAlert(id: string, data: Partial<Alert>): Promise<void>;
  deleteAlert(id: string): Promise<void>;
  getActiveAlertsCount(): Promise<number>;
  checkAlerts(): Promise<Alert[]>;
  getAlertsByType(type: string): Promise<Alert[]>;
  deactivateAlertsByTicker(ticker: string): Promise<void>;
  activateAlertsByTicker(ticker: string): Promise<void>;
  getAlertStats(): Promise<{
    totalAlerts: number;
    activeAlerts: number;
    alertsByType: { [key: string]: number };
    alertsByTicker: { [key: string]: number };
  }>;
} 