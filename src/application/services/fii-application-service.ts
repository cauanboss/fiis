import { FIIRepositoryInterface } from '../../domain/repositories/fii-repository.interface.js';
import { AlertRepositoryInterface } from '../../domain/repositories/alert-repository.interface.js';
import { EventBusInterface } from '../../domain/interfaces/event-bus.interface.js';
import { CollectFiisDataUseCase } from '../usecases/collect-fiis-data.usecase.js';
import { AnalyzeFiisUseCase } from '../usecases/analyze-fiis.usecase.js';
import { CheckAlertsUseCase } from '../usecases/check-alerts.usecase.js';
import { FIIAnalysisService } from '../../domain/services/fii-analysis-service.js';
import { FIIPortfolio } from '../../domain/entities/fii-portfolio.js';
// Domain events import removed as not used yet

export class FIIApplicationService {
    private collectUseCase: CollectFiisDataUseCase;
    private analyzeUseCase: AnalyzeFiisUseCase;
    private checkAlertsUseCase: CheckAlertsUseCase;
    private analysisService: FIIAnalysisService;
    private portfolio: FIIPortfolio;
    private eventBus: EventBusInterface;

    constructor(
        fiiRepository: FIIRepositoryInterface,
        alertRepository: AlertRepositoryInterface,
        eventBus: EventBusInterface
    ) {
        this.collectUseCase = new CollectFiisDataUseCase(fiiRepository);
        this.analyzeUseCase = new AnalyzeFiisUseCase(fiiRepository);
        this.checkAlertsUseCase = new CheckAlertsUseCase(fiiRepository, alertRepository);
        this.analysisService = new FIIAnalysisService();
        this.portfolio = new FIIPortfolio();
        this.eventBus = eventBus;
    }

    async collectAndAnalyze(sources: string[] = ['funds-explorer']): Promise<{
        collected: number;
        analyzed: number;
        buyCount: number;
        holdCount: number;
        sellCount: number;
    }> {
        // 1. Coletar dados
        const collectResult = await this.collectUseCase.execute({
            sources,
            saveToDatabase: true
        });

        // 2. Analisar dados
        const analyzeResult = await this.analyzeUseCase.execute();

        // 3. Publicar eventos
        this.eventBus.publish('COLLECTION_COMPLETED', {
            totalCollected: collectResult.totalCollected,
            sources: collectResult.sources
        });

        this.eventBus.publish('ANALYSIS_COMPLETED', {
            totalAnalyzed: analyzeResult.analyses.length,
            stats: analyzeResult.stats
        });

        // 4. Verificar alertas
        await this.checkAlertsUseCase.execute();

        return {
            collected: collectResult.totalCollected,
            analyzed: analyzeResult.analyses.length,
            buyCount: analyzeResult.stats.buyCount,
            holdCount: analyzeResult.stats.holdCount,
            sellCount: analyzeResult.stats.sellCount
        };
    }

    async getPortfolioAnalysis(): Promise<{
        totalFiis: number;
        topFiis: unknown[];
        stats: {
            buyCount: number;
            holdCount: number;
            sellCount: number;
            avgScore: number;
            avgDY: number;
            avgPVP: number;
        };
    }> {
        const fiis = await this.portfolio.getAllFiis();
        const topFiis = await this.portfolio.getTopFiis(10);
        const stats = await this.portfolio.getPortfolioStats();

        return {
            totalFiis: fiis.length,
            topFiis,
            stats
        };
    }

    async getRecommendationsByType(type: 'BUY' | 'HOLD' | 'SELL'): Promise<unknown[]> {
        return await this.portfolio.getFiisByRecommendation(type);
    }
} 