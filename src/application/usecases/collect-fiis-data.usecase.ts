import { FIIRepositoryInterface } from '../../domain/repositories/index.js';
import { ScraperFactory } from '../factories/scraper-factory.js';
import { FII, ScrapingResult, CollectFiisDataRequest, CollectFiisDataResponse } from '../../domain/types/index.js';

export class CollectFiisDataUseCase {
  private fiiRepository: FIIRepositoryInterface;

  constructor(fiiRepository: FIIRepositoryInterface) {
    this.fiiRepository = fiiRepository;
  }

  async execute(request: CollectFiisDataRequest): Promise<CollectFiisDataResponse> {
    const { sources, saveToDatabase = true } = request;
    const results: Record<string, ScrapingResult> = {};
    const allFiis: FII[] = [];
    const errors: string[] = [];

    console.log(`📡 Iniciando coleta de dados de ${sources.length} fontes...`);

    for (const source of sources) {
      const scraper = ScraperFactory.createScraper(source);

      if (!scraper) {
        const error = `Scraper não encontrado para fonte: ${source}`;
        console.error(`❌ ${error}`);
        errors.push(error);
        results[source] = {
          success: false,
          error,
          source
        };
        continue;
      }

      try {
        console.log(`🔍 Coletando dados de: ${source}`);
        const result = await scraper.scrape();

        if (result.success && result.data) {
          console.log(`✅ ${result.data.length} FIIs coletados de ${source}`);
          allFiis.push(...result.data);
          results[source] = result;
        } else {
          const error = result.error || `Falha na coleta de ${source}`;
          console.error(`❌ ${error}`);
          errors.push(error);
          results[source] = result;
        }
      } catch (error) {
        const errorMessage = `Erro ao coletar dados de ${source}: ${error}`;
        console.error(`❌ ${errorMessage}`);
        errors.push(errorMessage);
        results[source] = {
          success: false,
          error: errorMessage,
          source
        };
      }
    }

    // Salvar no banco se solicitado
    if (saveToDatabase && allFiis.length > 0) {
      try {
        console.log(`💾 Salvando ${allFiis.length} FIIs no banco de dados...`);
        await this.fiiRepository.saveFiis(allFiis);
        await this.fiiRepository.saveFIIHistory(allFiis);
        console.log('✅ Dados salvos com sucesso');
      } catch (error) {
        const errorMessage = `Erro ao salvar dados no banco: ${error}`;
        console.error(`❌ ${errorMessage}`);
        errors.push(errorMessage);
      }
    }

    return {
      totalCollected: allFiis.length,
      sources: results,
      errors
    };
  }
} 