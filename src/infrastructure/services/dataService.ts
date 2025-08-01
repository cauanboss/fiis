import { Database } from '../repository/database';
import { FIIRepository, AlertRepository, SettingRepository, Alert } from '../repository/index';
import { FII, FIIAnalysis } from '../../domain/types/fii';
import { FIIHistory } from 'domain/types';

export class DataService {
  private database: Database;
  private fiiRepository: FIIRepository;
  private alertRepository: AlertRepository;
  private settingRepository: SettingRepository;
  private static instance: DataService;

  private constructor() {
    this.database = Database.getInstance();
    const prisma = this.database.getClient();

    this.fiiRepository = new FIIRepository(prisma);
    this.alertRepository = new AlertRepository(prisma);
    this.settingRepository = new SettingRepository(prisma);
  }

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  async connect(): Promise<boolean> {
    await this.database.connect();
    return true;
  }

  // Operações com FIIs
  async saveFiis(fiis: FII[]): Promise<void> {
    await this.fiiRepository.saveFiis(fiis);
  }

  async saveFIIHistory(fiis: FII[]): Promise<void> {
    await this.fiiRepository.saveFIIHistory(fiis);
  }

  async getFiis(): Promise<FII[]> {
    return await this.fiiRepository.getFiis();
  }

  async getFIIHistory(ticker: string, days: number = 30): Promise<FIIHistory[]> {
    return await this.fiiRepository.getFIIHistory(ticker, days);
  }

  async getFIIByTicker(ticker: string): Promise<FII | null> {
    return await this.fiiRepository.getFIIByTicker(ticker);
  }

  async getTopFiis(limit: number = 10): Promise<FII[]> {
    return await this.fiiRepository.getTopFiis(limit);
  }

  async getFiisBySource(source: string): Promise<FII[]> {
    return await this.fiiRepository.getFiisBySource(source);
  }

  // Operações com análises
  async saveAnalyses(analyses: FIIAnalysis[]): Promise<void> {
    await this.fiiRepository.saveAnalyses(analyses);
  }

  async getLatestAnalyses(): Promise<FIIAnalysis[]> {
    return await this.fiiRepository.getLatestAnalyses();
  }

  // Operações com alertas
  async createAlert(alert: Omit<Alert, 'id' | 'createdAt'>): Promise<string> {
    return await this.alertRepository.createAlert(alert);
  }

  async getAlerts(): Promise<Alert[]> {
    return await this.alertRepository.getAlerts();
  }

  async deleteAlert(id: string): Promise<void> {
    await this.alertRepository.deleteAlert(id);
  }

  async updateAlert(id: string, data: Partial<Alert>): Promise<void> {
    await this.alertRepository.updateAlert(id, data);
  }

  async getAlertsByTicker(ticker: string): Promise<Alert[]> {
    return await this.alertRepository.getAlertsByTicker(ticker);
  }

  // Operações com configurações
  async saveSetting(key: string, value: string): Promise<void> {
    await this.settingRepository.saveSetting(key, value);
  }

  async getSetting(key: string): Promise<string | null> {
    return await this.settingRepository.getSetting(key);
  }

  async deleteSetting(key: string): Promise<void> {
    await this.settingRepository.deleteSetting(key);
  }

  async getAllSettings(): Promise<Record<string, string>> {
    return await this.settingRepository.getAllSettings();
  }

  async getSettingsByPrefix(prefix: string): Promise<Record<string, string>> {
    return await this.settingRepository.getSettingsByPrefix(prefix);
  }

  // Métodos utilitários
  async getDatabaseStats(): Promise<{
    totalFiis: number;
    totalHistoryRecords: number;
    totalAnalyses: number;
    activeAlerts: number;
  }> {
    const [fiiStats, activeAlerts] = await Promise.all([
      this.fiiRepository.getDatabaseStats(),
      this.alertRepository.getActiveAlertsCount()
    ]);

    return {
      totalFiis: fiiStats.totalFiis,
      totalHistoryRecords: fiiStats.totalHistoryRecords,
      totalAnalyses: fiiStats.totalAnalyses,
      activeAlerts
    };
  }

  async checkAlerts(): Promise<Alert[]> {
    return await this.alertRepository.checkAlerts();
  }

  async healthCheck(): Promise<boolean> {
    return await this.database.healthCheck();
  }

  async close(): Promise<void> {
    await this.database.disconnect();
  }
} 