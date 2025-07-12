import { NotificationConfig } from './fii.js';

// Scheduler
export type SchedulerConfig = {
  collectionInterval: number; // em minutos
  analysisInterval: number;   // em minutos
  alertCheckInterval: number; // em minutos
  enabled: boolean;
  notificationConfig?: NotificationConfig;
};

// Database
export type FIIHistory = {
  id?: number;
  ticker: string;
  price: number;
  dividendYield: number;
  pvp: number;
  lastDividend: number;
  source: string;
  timestamp: Date;
};

// Events
export type EventType = 'collection_completed' | 'analysis_completed' | 'alert_triggered';

export type Event = {
  type: EventType;
  data: Record<string, unknown>;
  timestamp: Date;
};

export type EventHandler = {
  handle(event: Event): Promise<void>;
};

// Workers
export type WorkerJob = {
  id: string;
  type: string;
  data: Record<string, unknown>;
  priority: number;
};

export type WorkerResult = {
  jobId: string;
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  duration: number;
}; 