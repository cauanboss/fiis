import { AlertService } from '../../domain/services/alertService';
import { NotificationService } from '../../domain/services/notificationService';
import { Alert, AlertTrigger, FIIAnalysis, NotificationConfig } from '../../domain/types/fii';
import { DataService } from '../../infrastructure/services/dataService';

export class AlertManagerService {
  private dataService: DataService;
  private notificationService: NotificationService;

  constructor(notificationConfig: NotificationConfig) {
    this.dataService = DataService.getInstance();
    this.notificationService = new NotificationService(notificationConfig);
  }

  /**
   * Verifica todos os alertas ativos e dispara notificações
   */
  async checkAndNotifyAlerts(): Promise<AlertTrigger[]> {
    const alerts = await this.dataService.getAlerts();
    const triggeredAlerts: AlertTrigger[] = [];

    for (const alert of alerts) {
      const fii = await this.dataService.getFIIByTicker(alert.ticker);
      if (!fii) continue;

      // Buscar análise mais recente se necessário
      let analysis: FIIAnalysis | undefined;
      if (alert.type === 'SCORE') {
        const analyses = await this.dataService.getLatestAnalyses();
        analysis = analyses.find(a => a.ticker === alert.ticker);
      }

      const trigger = AlertService.checkAlert(alert, fii, analysis);
      
      if (trigger) {
        triggeredAlerts.push(trigger);
        
        // Enviar notificação
        await this.notificationService.sendNotification(trigger);
        
        console.log(`🚨 Alerta disparado: ${alert.ticker} - ${alert.type} ${alert.condition} ${alert.value}`);
      }
    }

    return triggeredAlerts;
  }

  /**
   * Cria um novo alerta
   */
  async createAlert(alertData: Omit<Alert, 'id' | 'createdAt'>): Promise<string> {
    const validation = AlertService.validateAlert(alertData);
    
    if (!validation.valid) {
      throw new Error(`Alerta inválido: ${validation.errors.join(', ')}`);
    }

    // Verificar se o FII existe
    const fii = await this.dataService.getFIIByTicker(alertData.ticker);
    if (!fii) {
      throw new Error(`FII ${alertData.ticker} não encontrado`);
    }

    const alertId = await this.dataService.createAlert(alertData);
    console.log(`✅ Alerta criado: ${alertData.ticker} - ${alertData.type} ${alertData.condition} ${alertData.value}`);
    
    return alertId;
  }

  /**
   * Atualiza um alerta existente
   */
  async updateAlert(id: string, data: Partial<Alert>): Promise<void> {
    if (data.ticker) {
      const fii = await this.dataService.getFIIByTicker(data.ticker);
      if (!fii) {
        throw new Error(`FII ${data.ticker} não encontrado`);
      }
    }

    await this.dataService.updateAlert(id, data);
    console.log(`✅ Alerta atualizado: ${id}`);
  }

  /**
   * Remove um alerta
   */
  async deleteAlert(id: string): Promise<void> {
    await this.dataService.deleteAlert(id);
    console.log(`✅ Alerta removido: ${id}`);
  }

  /**
   * Busca alertas por ticker
   */
  async getAlertsByTicker(ticker: string): Promise<Alert[]> {
    return await this.dataService.getAlertsByTicker(ticker);
  }

  /**
   * Ativa/desativa todos os alertas de um FII
   */
  async toggleAlertsByTicker(ticker: string, active: boolean): Promise<void> {
    const alerts = await this.getAlertsByTicker(ticker);
    
    for (const alert of alerts) {
      if (alert.id) {
        await this.updateAlert(alert.id, { active });
      }
    }

    const action = active ? 'ativados' : 'desativados';
    console.log(`✅ Alertas ${action} para ${ticker}`);
  }

  /**
   * Testa as configurações de notificação
   */
  async testNotifications(): Promise<{ [key: string]: boolean }> {
    return await this.notificationService.testConnections();
  }

  /**
   * Executa verificação manual de alertas para um FII específico
   */
  async checkAlertsForFII(ticker: string): Promise<AlertTrigger[]> {
    const alerts = await this.getAlertsByTicker(ticker);
    const fii = await this.dataService.getFIIByTicker(ticker);
    
    if (!fii) {
      throw new Error(`FII ${ticker} não encontrado`);
    }

    const triggeredAlerts: AlertTrigger[] = [];

    for (const alert of alerts) {
      let analysis: FIIAnalysis | undefined;
      if (alert.type === 'SCORE') {
        const analyses = await this.dataService.getLatestAnalyses();
        analysis = analyses.find(a => a.ticker === alert.ticker);
      }

      const trigger = AlertService.checkAlert(alert, fii, analysis);
      
      if (trigger) {
        triggeredAlerts.push(trigger);
      }
    }

    return triggeredAlerts;
  }

  /**
   * Gera relatório de alertas
   */
  async generateAlertReport(): Promise<{
    totalAlerts: number;
    activeAlerts: number;
    triggeredToday: number;
    alertsByType: { [key: string]: number };
    alertsByTicker: { [key: string]: number };
  }> {
    const alerts = await this.dataService.getAlerts();
    const activeAlerts = alerts.filter(a => a.active);
    
    // Contar alertas por tipo
    const alertsByType: { [key: string]: number } = {};
    const alertsByTicker: { [key: string]: number } = {};
    
    activeAlerts.forEach(alert => {
      alertsByType[alert.type] = (alertsByType[alert.type] || 0) + 1;
      alertsByTicker[alert.ticker] = (alertsByTicker[alert.ticker] || 0) + 1;
    });

    // Contar alertas disparados hoje (implementação simplificada)
    const triggeredToday = 0; // Em produção, seria baseado em logs ou tabela de histórico

    return {
      totalAlerts: alerts.length,
      activeAlerts: activeAlerts.length,
      triggeredToday,
      alertsByType,
      alertsByTicker
    };
  }

  /**
   * Configura alertas padrão para um FII
   */
  async setupDefaultAlerts(ticker: string): Promise<string[]> {
    const fii = await this.dataService.getFIIByTicker(ticker);
    if (!fii) {
      throw new Error(`FII ${ticker} não encontrado`);
    }

    const defaultAlerts: Omit<Alert, 'id' | 'createdAt'>[] = [
      {
        ticker,
        type: 'PRICE',
        condition: 'BELOW',
        value: fii.price * 0.95, // 5% abaixo do preço atual
        active: true
      },
      {
        ticker,
        type: 'DY',
        condition: 'ABOVE',
        value: 8.0, // DY acima de 8%
        active: true
      },
      {
        ticker,
        type: 'PVP',
        condition: 'BELOW',
        value: 1.0, // P/VP abaixo de 1.0
        active: true
      }
    ];

    const alertIds: string[] = [];
    
    for (const alert of defaultAlerts) {
      const id = await this.createAlert(alert);
      alertIds.push(id);
    }

    console.log(`✅ Alertas padrão configurados para ${ticker}`);
    return alertIds;
  }
} 