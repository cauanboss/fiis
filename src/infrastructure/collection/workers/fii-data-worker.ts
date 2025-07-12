import { CollectFiisDataUseCase } from '../../../application/usecases/collect-fiis-data.usecase.js';
import { AnalyzeFiisUseCase } from '../../../application/usecases/analyze-fiis.usecase.js';
import { FIIRepositoryInterface } from '../../../domain/repositories/index.js';

export interface WorkerJob {
  id: string;
  type: 'COLLECT' | 'ANALYZE' | 'BOTH';
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  createdAt: Date;
  data?: Record<string, unknown>;
}

export interface WorkerResult {
  jobId: string;
  success: boolean;
  result?: Record<string, unknown>;
  error?: string;
  duration: number;
  completedAt: Date;
}

export class FIIDataWorker {
  private collectUseCase: CollectFiisDataUseCase;
  private analyzeUseCase: AnalyzeFiisUseCase;
  private isRunning: boolean = false;
  private jobQueue: WorkerJob[] = [];
  private results: WorkerResult[] = [];

  constructor(fiiRepository: FIIRepositoryInterface) {
    this.collectUseCase = new CollectFiisDataUseCase(fiiRepository);
    this.analyzeUseCase = new AnalyzeFiisUseCase(fiiRepository);
  }

  /**
   * Adiciona um job à fila
   */
  addJob(job: Omit<WorkerJob, 'id' | 'createdAt'>): string {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newJob: WorkerJob = {
      ...job,
      id: jobId,
      createdAt: new Date()
    };

    // Inserir na fila baseado na prioridade
    if (job.priority === 'HIGH') {
      this.jobQueue.unshift(newJob);
    } else {
      this.jobQueue.push(newJob);
    }

    console.log(`📋 Job adicionado: ${jobId} (${job.type}, ${job.priority})`);
    return jobId;
  }

  /**
   * Inicia o worker
   */
  start(): void {
    if (this.isRunning) {
      console.log('⚠️ Worker já está rodando');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Iniciando FII Data Worker...');

    this.processQueue();
  }

  /**
   * Para o worker
   */
  stop(): void {
    this.isRunning = false;
    console.log('🛑 Worker parado');
  }

  /**
   * Processa a fila de jobs
   */
  private async processQueue(): Promise<void> {
    while (this.isRunning) {
      if (this.jobQueue.length > 0) {
        const job = this.jobQueue.shift()!;
        await this.processJob(job);
      } else {
        // Aguardar 1 segundo antes de verificar novamente
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  /**
   * Processa um job específico
   */
  private async processJob(job: WorkerJob): Promise<void> {
    const startTime = Date.now();
    console.log(`⚙️ Processando job: ${job.id} (${job.type})`);

    try {
      let result: Record<string, unknown>;

      switch (job.type) {
        case 'COLLECT':
          result = await this.collectUseCase.execute({
            sources: ['funds-explorer'],
            saveToDatabase: true
          });
          break;

        case 'ANALYZE':
          result = await this.analyzeUseCase.execute();
          break;

        case 'BOTH': {
          const collectResult = await this.collectUseCase.execute({
            sources: ['funds-explorer'],
            saveToDatabase: true
          });
          const analyzeResult = await this.analyzeUseCase.execute();
          result = { collect: collectResult, analyze: analyzeResult };
          break;
        }

        default:
          throw new Error(`Tipo de job desconhecido: ${job.type}`);
      }

      const duration = Date.now() - startTime;
      const workerResult: WorkerResult = {
        jobId: job.id,
        success: true,
        result,
        duration,
        completedAt: new Date()
      };

      this.results.push(workerResult);
      console.log(`✅ Job ${job.id} concluído em ${duration}ms`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const workerResult: WorkerResult = {
        jobId: job.id,
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        duration,
        completedAt: new Date()
      };

      this.results.push(workerResult);
      console.error(`❌ Job ${job.id} falhou:`, error);
    }
  }

  /**
   * Retorna status do worker
   */
  getStatus(): {
    running: boolean;
    queueLength: number;
    totalJobs: number;
    successfulJobs: number;
    failedJobs: number;
  } {
    const successfulJobs = this.results.filter(r => r.success).length;
    const failedJobs = this.results.filter(r => !r.success).length;

    return {
      running: this.isRunning,
      queueLength: this.jobQueue.length,
      totalJobs: this.results.length,
      successfulJobs,
      failedJobs
    };
  }

  /**
   * Retorna resultados dos últimos N jobs
   */
  getRecentResults(limit: number = 10): WorkerResult[] {
    return this.results.slice(-limit);
  }

  /**
   * Limpa resultados antigos
   */
  clearOldResults(olderThanHours: number = 24): void {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    this.results = this.results.filter(result => result.completedAt > cutoffTime);
    console.log(`🧹 Resultados antigos removidos (mais de ${olderThanHours}h)`);
  }

  /**
   * Retorna estatísticas do worker
   */
  getStats(): {
    averageProcessingTime: number;
    successRate: number;
    jobsPerHour: number;
  } {
    if (this.results.length === 0) {
      return {
        averageProcessingTime: 0,
        successRate: 0,
        jobsPerHour: 0
      };
    }

    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0);
    const averageProcessingTime = totalTime / this.results.length;

    const successfulJobs = this.results.filter(r => r.success).length;
    const successRate = (successfulJobs / this.results.length) * 100;

    // Calcular jobs por hora (baseado nos últimos resultados)
    const recentResults = this.results.slice(-20); // Últimos 20 jobs
    const timeSpan = recentResults.length > 1
      ? (recentResults[recentResults.length - 1]?.completedAt.getTime() || 0) - (recentResults[0]?.completedAt.getTime() || 0)
      : 0;
    const jobsPerHour = timeSpan > 0 ? (recentResults.length / (timeSpan / (1000 * 60 * 60))) : 0;

    return {
      averageProcessingTime,
      successRate,
      jobsPerHour
    };
  }
} 