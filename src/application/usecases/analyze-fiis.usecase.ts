import { FIIAnalyzer } from '../analysis/fii-analyzer.js';
import { FIIRepositoryInterface } from '../../domain/repositories/index.js';
import { FIIAnalysis, AnalyzeFiisRequest, AnalyzeFiisResponse } from '../../domain/types/index.js';

export class AnalyzeFiisUseCase {
  private fiiRepository: FIIRepositoryInterface;
  private analyzer: FIIAnalyzer;

  constructor(fiiRepository: FIIRepositoryInterface) {
    this.fiiRepository = fiiRepository;
    this.analyzer = new FIIAnalyzer();
  }

  async execute(request: AnalyzeFiisRequest = {}): Promise<AnalyzeFiisResponse> {
    // 1. Buscar FIIs do banco
    const fiis = await this.fiiRepository.getFiis();
    
    if (fiis.length === 0) {
      throw new Error('Nenhum FII encontrado no banco de dados');
    }

    // 2. Aplicar configuração personalizada se fornecida
    if (request.config) {
      this.analyzer.updateConfig(request.config);
    }

    // 3. Analisar FIIs
    const analyses = this.analyzer.analyze(fiis);

    // 4. Aplicar limite se especificado
    const limitedAnalyses = request.limit 
      ? analyses.slice(0, request.limit)
      : analyses;

    // 5. Salvar análises no banco
    await this.fiiRepository.saveAnalyses(limitedAnalyses);

    // 6. Calcular estatísticas
    const stats = this.calculateStats(limitedAnalyses);

    return {
      analyses: limitedAnalyses,
      stats
    };
  }

  private calculateStats(analyses: FIIAnalysis[]) {
    if (analyses.length === 0) {
      return {
        totalFiis: 0,
        buyCount: 0,
        holdCount: 0,
        sellCount: 0,
        avgScore: 0,
        avgDY: 0,
        avgPVP: 0
      };
    }

    const buyCount = analyses.filter(a => a.recommendation === 'BUY').length;
    const holdCount = analyses.filter(a => a.recommendation === 'HOLD').length;
    const sellCount = analyses.filter(a => a.recommendation === 'SELL').length;

    const avgScore = analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length;
    const avgDY = analyses.reduce((sum, a) => sum + a.dividendYield, 0) / analyses.length;
    const avgPVP = analyses.reduce((sum, a) => sum + a.pvp, 0) / analyses.length;

    return {
      totalFiis: analyses.length,
      buyCount,
      holdCount,
      sellCount,
      avgScore,
      avgDY,
      avgPVP
    };
  }
} 