import { AlertService } from '../../domain/services/alertService.js';
import { NotificationService } from '../../domain/services/notificationService.js';
import { FIIRepositoryInterface, AlertRepositoryInterface } from '../../domain/repositories/index.js';
import { AlertTrigger, NotificationConfig, CheckAlertsRequest, CheckAlertsResponse } from '../../domain/types/index.js';

export class CheckAlertsUseCase {
  private fiiRepository: FIIRepositoryInterface;
  private alertRepository: AlertRepositoryInterface;
  private notificationService?: NotificationService;

  constructor(
    fiiRepository: FIIRepositoryInterface,
    alertRepository: AlertRepositoryInterface,
    notificationConfig?: NotificationConfig
  ) {
    this.fiiRepository = fiiRepository;
    this.alertRepository = alertRepository;
    if (notificationConfig) {
      this.notificationService = new NotificationService(notificationConfig);
    }
  }

  async execute(request: CheckAlertsRequest = {}): Promise<CheckAlertsResponse> {
    // 1. Buscar todos os alertas ativos
    const alerts = await this.alertRepository.getAlerts();
    const activeAlerts = alerts.filter(alert => alert.active);

    if (activeAlerts.length === 0) {
      return {
        triggeredCount: 0,
        triggeredAlerts: [],
        summary: {
          totalAlerts: alerts.length,
          activeAlerts: 0,
          notificationsSent: 0
        }
      };
    }

    // 2. Verificar cada alerta
    const triggeredAlerts: AlertTrigger[] = [];
    let notificationsSent = 0;

    for (const alert of activeAlerts) {
      const fii = await this.fiiRepository.getFIIByTicker(alert.ticker);
      if (!fii) continue;

      // Buscar análise mais recente se necessário
      let analysis;
      if (alert.type === 'SCORE') {
        const analyses = await this.fiiRepository.getLatestAnalyses();
        analysis = analyses.find(a => a.ticker === alert.ticker);
      }

      const trigger = AlertService.checkAlert(alert, fii, analysis);
      
      if (trigger) {
        triggeredAlerts.push(trigger);
        
        // Enviar notificação se configurado
        if (this.notificationService) {
          try {
            await this.notificationService.sendNotification(trigger);
            notificationsSent++;
          } catch (error) {
            console.error(`Erro ao enviar notificação para ${alert.ticker}:`, error);
          }
        }
      }
    }

    return {
      triggeredCount: triggeredAlerts.length,
      triggeredAlerts,
      summary: {
        totalAlerts: alerts.length,
        activeAlerts: activeAlerts.length,
        notificationsSent
      }
    };
  }

  /**
   * Verifica alertas para um FII específico
   */
  async executeForFII(ticker: string): Promise<AlertTrigger[]> {
    const alerts = await this.alertRepository.getAlertsByTicker(ticker);
    const fii = await this.fiiRepository.getFIIByTicker(ticker);
    
    if (!fii) {
      throw new Error(`FII ${ticker} não encontrado`);
    }

    const triggeredAlerts: AlertTrigger[] = [];

    for (const alert of alerts) {
      let analysis;
      if (alert.type === 'SCORE') {
        const analyses = await this.fiiRepository.getLatestAnalyses();
        analysis = analyses.find(a => a.ticker === alert.ticker);
      }

      const trigger = AlertService.checkAlert(alert, fii, analysis);
      
      if (trigger) {
        triggeredAlerts.push(trigger);
      }
    }

    return triggeredAlerts;
  }
} 