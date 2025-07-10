import { PrismaClient } from '@prisma/client';

export interface Alert {
  id?: number;
  ticker: string;
  type: 'PRICE' | 'DY' | 'PVP';
  condition: 'ABOVE' | 'BELOW';
  value: number;
  active: boolean;
  createdAt: Date;
}

export class AlertRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createAlert(alert: Omit<Alert, 'id' | 'createdAt'>): Promise<number> {
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

  async deleteAlert(id: number): Promise<void> {
    await this.prisma.alert.delete({
      where: { id }
    });
  }

  async updateAlert(id: number, data: Partial<Alert>): Promise<void> {
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
      }

      if (alert.condition === 'ABOVE' && currentValue > alert.value) {
        triggered = true;
      } else if (alert.condition === 'BELOW' && currentValue < alert.value) {
        triggered = true;
      }

      if (triggered) {
        triggeredAlerts.push(alert);
      }
    }

    return triggeredAlerts;
  }
} 