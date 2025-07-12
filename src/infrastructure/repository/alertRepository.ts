import { PrismaClient } from '@prisma/client';
import { AlertType, AlertCondition } from '../../domain/types/fii';

export type Alert = {
  id?: string;
  ticker: string;
  type: AlertType;
  condition: AlertCondition;
  value: number;
  active: boolean;
  createdAt: Date;
  message?: string;
};

export class AlertRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createAlert(alert: Omit<Alert, 'id' | 'createdAt'>): Promise<string> {
    const result = await this.prisma.alert.create({
      data: {
        ticker: alert.ticker,
        type: alert.type,
        condition: alert.condition,
        value: alert.value,
        active: alert.active
      }
    });

    return result.id;
  }

  async getAlerts(): Promise<Alert[]> {
    const alerts = await this.prisma.alert.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' }
    });

    return alerts.map(alert => ({
      id: alert.id,
      ticker: alert.ticker,
      type: alert.type as 'PRICE' | 'DY' | 'PVP',
      condition: alert.condition as 'ABOVE' | 'BELOW',
      value: alert.value,
      active: alert.active,
      createdAt: alert.createdAt
    }));
  }

  async deleteAlert(id: string): Promise<void> {
    await this.prisma.alert.delete({
      where: { id }
    });
  }

  async updateAlert(id: string, data: Partial<Alert>): Promise<void> {
    await this.prisma.alert.update({
      where: { id },
      data: {
        ticker: data.ticker,
        type: data.type,
        condition: data.condition,
        value: data.value,
        active: data.active
      }
    });
  }

  async getAlertsByTicker(ticker: string): Promise<Alert[]> {
    const alerts = await this.prisma.alert.findMany({
      where: {
        ticker: ticker.toUpperCase(),
        active: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return alerts.map(alert => ({
      id: alert.id,
      ticker: alert.ticker,
      type: alert.type as 'PRICE' | 'DY' | 'PVP',
      condition: alert.condition as 'ABOVE' | 'BELOW',
      value: alert.value,
      active: alert.active,
      createdAt: alert.createdAt
    }));
  }

  async getActiveAlertsCount(): Promise<number> {
    return await this.prisma.alert.count({
      where: { active: true }
    });
  }

  async checkAlerts(): Promise<Alert[]> {
    const alerts = await this.getAlerts();
    const triggeredAlerts: Alert[] = [];

    for (const alert of alerts) {
      const fii = await this.prisma.fII.findUnique({
        where: { ticker: alert.ticker }
      });

      if (!fii) continue;

      let triggered = false;
      let currentValue = 0;

      switch (alert.type) {
        case 'PRICE':
          currentValue = fii.price;
          break;
        case 'DY':
          currentValue = fii.dividendYield;
          break;
        case 'PVP':
          currentValue = fii.pvp;
          break;
        case 'SCORE': {
          // Para SCORE, precisamos buscar a análise mais recente
          const analysis = await this.prisma.fIIAnalysis.findFirst({
            where: { ticker: alert.ticker },
            orderBy: { timestamp: 'desc' }
          });
          currentValue = analysis?.score || 0;
          break;
        }
      }

      if (alert.condition === 'ABOVE' && currentValue > alert.value) {
        triggered = true;
      } else if (alert.condition === 'BELOW' && currentValue < alert.value) {
        triggered = true;
      } else if (alert.condition === 'EQUALS' && Math.abs(currentValue - alert.value) < 0.01) {
        triggered = true;
      }

      if (triggered) {
        triggeredAlerts.push(alert);
      }
    }

    return triggeredAlerts;
  }

  /**
   * Busca alertas por tipo
   */
  async getAlertsByType(type: AlertType): Promise<Alert[]> {
    const alerts = await this.prisma.alert.findMany({
      where: {
        type,
        active: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return alerts.map(alert => ({
      id: alert.id,
      ticker: alert.ticker,
      type: alert.type as AlertType,
      condition: alert.condition as AlertCondition,
      value: alert.value,
      active: alert.active,
      createdAt: alert.createdAt
    }));
  }

  /**
   * Desativa todos os alertas de um FII
   */
  async deactivateAlertsByTicker(ticker: string): Promise<void> {
    await this.prisma.alert.updateMany({
      where: {
        ticker: ticker.toUpperCase(),
        active: true
      },
      data: { active: false }
    });
  }

  /**
   * Ativa todos os alertas de um FII
   */
  async activateAlertsByTicker(ticker: string): Promise<void> {
    await this.prisma.alert.updateMany({
      where: {
        ticker: ticker.toUpperCase(),
        active: false
      },
      data: { active: true }
    });
  }

  /**
   * Busca estatísticas dos alertas
   */
  async getAlertStats(): Promise<{
    totalAlerts: number;
    activeAlerts: number;
    alertsByType: { [key: string]: number };
    alertsByTicker: { [key: string]: number };
  }> {
    const [totalAlerts, activeAlerts, alertsByType, alertsByTicker] = await Promise.all([
      this.prisma.alert.count(),
      this.prisma.alert.count({ where: { active: true } }),
      this.prisma.alert.groupBy({
        by: ['type'],
        _count: { type: true },
        where: { active: true }
      }),
      this.prisma.alert.groupBy({
        by: ['ticker'],
        _count: { ticker: true },
        where: { active: true }
      })
    ]);

    const typeStats: { [key: string]: number } = {};
    alertsByType.forEach(group => {
      typeStats[group.type] = group._count.type;
    });

    const tickerStats: { [key: string]: number } = {};
    alertsByTicker.forEach(group => {
      tickerStats[group.ticker] = group._count.ticker;
    });

    return {
      totalAlerts,
      activeAlerts,
      alertsByType: typeStats,
      alertsByTicker: tickerStats
    };
  }
} 