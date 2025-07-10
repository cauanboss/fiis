#!/usr/bin/env bun

import { FIIAnalyzer } from '../application/analysis/fii-analyzer.js';
import { FundsExplorerScraper } from '../application/scrapers/fundsexplorer-scraper.js';
import { ClubeFIIScraper } from '../application/scrapers/clubefii-scraper.js';
import { DataService } from './services/dataService.js';
import { DisplayUtils } from '../domain/utils/display.js';

async function main() {
  try {
    console.log('🚀 Iniciando análise de FIIs...');
    
    const dataService = DataService.getInstance();
    
    // Conectar ao banco de dados
    console.log('🔌 Conectando ao banco de dados...');
    await dataService.connect();
    
    // Coletar dados dos scrapers
    console.log('📊 Coletando dados dos FIIs...');
    
    const scrapers = [
      new FundsExplorerScraper(),
      new ClubeFIIScraper()
    ];

    let allFiis: any[] = [];
    
    for (const scraper of scrapers) {
      try {
        console.log(`🔍 Executando scraper: ${scraper.constructor.name}`);
        const result = await scraper.scrape();
        const fiis = result.data || [];
        console.log(`✅ ${fiis.length} FIIs coletados de ${scraper.constructor.name}`);
        allFiis = allFiis.concat(fiis);
      } catch (error) {
        console.error(`❌ Erro no scraper ${scraper.constructor.name}:`, error);
      }
    }

    if (allFiis.length === 0) {
      console.error('❌ Nenhum FII foi coletado. Verifique os scrapers.');
      return;
    }

    console.log(`📈 Total de ${allFiis.length} FIIs coletados`);

    // Salvar dados no banco
    console.log('💾 Salvando dados no banco...');
    await dataService.saveFiis(allFiis);
    await dataService.saveFIIHistory(allFiis);

    // Analisar FIIs
    console.log('🔍 Analisando FIIs...');
    const analyzer = new FIIAnalyzer();
    const analyses = analyzer.analyze(allFiis);

    // Salvar análises no banco
    console.log('💾 Salvando análises no banco...');
    await dataService.saveAnalyses(analyses);

    // Verificar alertas
    console.log('🔔 Verificando alertas...');
    const triggeredAlerts = await dataService.checkAlerts();
    
    if (triggeredAlerts.length > 0) {
      console.log(`⚠️  ${triggeredAlerts.length} alertas acionados:`);
      triggeredAlerts.forEach(alert => {
        console.log(`   - ${alert.ticker}: ${alert.type} ${alert.condition} ${alert.value}`);
      });
    }

    // Exibir resultados
    console.log('📊 Exibindo resultados...');
    DisplayUtils.displayTopFiis(analyses);

    // Estatísticas do banco
    const stats = await dataService.getDatabaseStats();
    console.log('📊 Estatísticas do banco:', stats);

    console.log('✅ Análise concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a execução:', error);
  } finally {
    // Fechar conexão com o banco
    const dataService = DataService.getInstance();
    await dataService.close();
  }
}

// Executar se for o arquivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main }; 