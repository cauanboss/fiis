import { Request, Response } from 'express';
import { AnalyzeFiisUseCase } from '../../../application/usecases/analyze-fiis.usecase.js';
import { CollectFiisDataUseCase } from '../../../application/usecases/collect-fiis-data.usecase.js';
import { FIIRepositoryInterface } from '../../../domain/repositories/fii-repository.interface.js';

export class FIIController {
    private analyzeUseCase: AnalyzeFiisUseCase;
    private collectUseCase: CollectFiisDataUseCase;

    constructor(fiiRepository: FIIRepositoryInterface) {
        this.analyzeUseCase = new AnalyzeFiisUseCase(fiiRepository);
        this.collectUseCase = new CollectFiisDataUseCase(fiiRepository);
    }

    async handleAnalyze(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.analyzeUseCase.execute();
            res.json(result);
        } catch (error) {
            console.error('❌ Erro na análise:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    async handleCollectData(req: Request, res: Response): Promise<void> {
        try {
            const sources = req.query.sources as string[] || ['funds-explorer'];
            const result = await this.collectUseCase.execute({
                sources: Array.isArray(sources) ? sources : [sources],
                saveToDatabase: true
            });
            res.json(result);
        } catch (error) {
            console.error('❌ Erro na coleta:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }
} 