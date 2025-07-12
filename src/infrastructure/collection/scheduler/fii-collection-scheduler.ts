import { CollectFiisDataUseCase } from '../../../application/usecases/collect-fiis-data.usecase.js';
import { AnalyzeFiisUseCase } from '../../../application/usecases/analyze-fiis.usecase.js';
import { CheckAlertsUseCase } from '../../../application/usecases/check-alerts.usecase.js';
import { FIIRepositoryInterface, AlertRepositoryInterface } from '../../../domain/repositories/index.js';
import { NotificationConfig } from '../../../domain/types/fii.js';

export interface SchedulerConfig {
  collectionInterval: number; // em minutos
  analysisInterval: number;   // em minutos
  alertCheckInterval: number; // em minutos
  enabled: boolean;
  notificationConfig?: NotificationConfig;
}

export class FIICollectionScheduler {
  private collectUseCase: CollectFiisDataUseCase;
  private analyzeUseCase: AnalyzeFiisUseCase;
  private checkAlertsUseCase: CheckAlertsUseCase;
  private config: SchedulerConfig;
  private intervals: NodeJS.Timeout[] = [];

  constructor(
    fiiRepository: FIIRepositoryInterface,
    alertRepository: AlertRepositoryInterface,
    config: SchedulerConfig
  ) {
    this.collectUseCase = new CollectFiisDataUseCase();
    this.analyzeUseCase = new AnalyzeFiisUseCase(fiiRepository);
    this.checkAlertsUseCase = new CheckAlertsUseCase(
      fiiRepository,
      alertRepository,
      config.notificationConfig
    );
    this.config = config;
  }

  /**
   * Inicia o scheduler
   */
  start(): void {
    if (!this.config.enabled) {
      console.log('⏰ Scheduler desabilitado');
      return;
    }

    console.log('🚀 Iniciando FII Collection Scheduler...');

    // Agendar coleta de dados
    if (this.config.collectionInterval > 0) {
      this.scheduleCollection();
    }

    // Agendar análise
    if (this.config.analysisInterval > 0) {
      this.scheduleAnalysis();
    }

    // Agendar verificação de alertas
    if (this.config.alertCheckInterval > 0) {
      this.scheduleAlertCheck();
    }

    console.log('✅ Scheduler iniciado com sucesso');
  }

  /**
   * Para o scheduler
   */
  stop(): void {
    console.log('🛑 Parando FII Collection Scheduler...');
    
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    
    console.log('✅ Scheduler parado');
  }

  /**
   * Agenda coleta de dados
   */
  private scheduleCollection(): void {
    const interval = setInterval(async () => {
      try {
        console.log('📡 Iniciando coleta de dados...');
        const result = await this.collectUseCase.execute({
          sources: ['status-invest'],
          saveToDatabase: true
        });
        
        console.log(`✅ Coleta concluída: ${result.totalCollected} FIIs coletados`);
        
        // Emitir evento de coleta concluída
        this.emitCollectionCompleted(result);
        
      } catch (error) {
        console.error('❌ Erro na coleta de dados:', error);
      }
    }, this.config.collectionInterval * 60 * 1000);

    this.intervals.push(interval);
    console.log(`📅 Coleta agendada para cada ${this.config.collectionInterval} minutos`);
  }

  /**
   * Agenda análise de FIIs
   */
  private scheduleAnalysis(): void {
    const interval = setInterval(async () => {
      try {
        console.log('📊 Iniciando análise de FIIs...');
        const result = await this.analyzeUseCase.execute();
        
        console.log(`✅ Análise concluída: ${result.analyses.length} FIIs analisados`);
        console.log(`📈 Estatísticas: ${result.stats.buyCount} BUY, ${result.stats.holdCount} HOLD, ${result.stats.sellCount} SELL`);
        
        // Emitir evento de análise concluída
        this.emitAnalysisCompleted(result);
        
      } catch (error) {
        console.error('❌ Erro na análise de FIIs:', error);
      }
    }, this.config.analysisInterval * 60 * 1000);

    this.intervals.push(interval);
    console.log(`📅 Análise agendada para cada ${this.config.analysisInterval} minutos`);
  }

  /**
   * Agenda verificação de alertas
   */
  private scheduleAlertCheck(): void {
    const interval = setInterval(async () => {
      try {
        console.log('🔔 Verificando alertas...');
        const result = await this.checkAlertsUseCase.execute();
        
        if (result.triggeredCount > 0) {
          console.log(`🚨 ${result.triggeredCount} alertas disparados!`);
        } else {
          console.log('✅ Nenhum alerta disparado');
        }
        
        // Emitir evento de verificação de alertas
        this.emitAlertCheckCompleted(result);
        
      } catch (error) {
        console.error('❌ Erro na verificação de alertas:', error);
      }
    }, this.config.alertCheckInterval * 60 * 1000);

    this.intervals.push(interval);
    console.log(`📅 Verificação de alertas agendada para cada ${this.config.alertCheckInterval} minutos`);
  }

  /**
   * Executa coleta manual
   */
  async executeCollection(): Promise<void> {
    console.log('📡 Executando coleta manual...');
    const result = await this.collectUseCase.execute({
      sources: ['status-invest'],
      saveToDatabase: true
    });
    console.log(`✅ Coleta manual concluída: ${result.totalCollected} FIIs`);
  }

  /**
   * Executa análise manual
   */
  async executeAnalysis(): Promise<void> {
    console.log('📊 Executando análise manual...');
    const result = await this.analyzeUseCase.execute();
    console.log(`✅ Análise manual concluída: ${result.analyses.length} FIIs analisados`);
  }

  /**
   * Executa verificação manual de alertas
   */
  async executeAlertCheck(): Promise<void> {
    console.log('🔔 Executando verificação manual de alertas...');
    const result = await this.checkAlertsUseCase.execute();
    console.log(`✅ Verificação manual concluída: ${result.triggeredCount} alertas disparados`);
  }

  /**
   * Emite evento de coleta concluída
   */
  private emitCollectionCompleted(result: any): void {
    // Em produção, seria um sistema de eventos real
    console.log('📡 Evento: Coleta de dados concluída', {
      timestamp: new Date().toISOString(),
      totalCollected: result.totalCollected,
      sources: result.sources
    });
  }

  /**
   * Emite evento de análise concluída
   */
  private emitAnalysisCompleted(result: any): void {
    // Em produção, seria um sistema de eventos real
    console.log('📊 Evento: Análise de FIIs concluída', {
      timestamp: new Date().toISOString(),
      totalAnalyzed: result.analyses.length,
      stats: result.stats
    });
  }

  /**
   * Emite evento de verificação de alertas concluída
   */
  private emitAlertCheckCompleted(result: any): void {
    // Em produção, seria um sistema de eventos real
    console.log('🔔 Evento: Verificação de alertas concluída', {
      timestamp: new Date().toISOString(),
      triggeredCount: result.triggeredCount,
      summary: result.summary
    });
  }

  /**
   * Retorna status do scheduler
   */
  getStatus(): {
    running: boolean;
    intervals: number;
    config: SchedulerConfig;
  } {
    return {
      running: this.intervals.length > 0,
      intervals: this.intervals.length,
      config: this.config
    };
  }
} 