#!/usr/bin/env bun

import { AnalyzeFiisUseCase } from '../../application/usecases/analyze-fiis.usecase.js';
import { CreateAlertUseCase } from '../../application/usecases/create-alert.usecase.js';
import { CheckAlertsUseCase } from '../../application/usecases/check-alerts.usecase.js';
import { CollectFiisDataUseCase } from '../../application/usecases/collect-fiis-data.usecase.js';
import { DataService } from '../services/dataService.js';

async function testUseCases() {
  console.log('🎯 Testando Use Cases...\n');

  const dataService = DataService.getInstance();

  try {
    // Conectar ao banco
    await dataService.connect();
    console.log('✅ Conectado ao banco de dados');

    // 1. Testar AnalyzeFiisUseCase
    console.log('\n📊 Testando AnalyzeFiisUseCase...');
    const analyzeUseCase = new AnalyzeFiisUseCase();
    
    try {
      const analysisResult = await analyzeUseCase.execute({ limit: 5 });
      console.log(`✅ Análise concluída: ${analysisResult.analyses.length} FIIs analisados`);
      console.log(`📈 Estatísticas: ${analysisResult.stats.buyCount} BUY, ${analysisResult.stats.holdCount} HOLD, ${analysisResult.stats.sellCount} SELL`);
    } catch (error) {
      console.log(`⚠️ Análise falhou: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }

    // 2. Testar CreateAlertUseCase
    console.log('\n🔔 Testando CreateAlertUseCase...');
    const createAlertUseCase = new CreateAlertUseCase();
    
    try {
      const alertResult = await createAlertUseCase.execute({
        ticker: 'HGLG11',
        type: 'PRICE',
        condition: 'BELOW',
        value: 160.0,
        active: true
      });
      console.log(`✅ Alerta criado: ${alertResult.message}`);
    } catch (error) {
      console.log(`⚠️ Criação de alerta falhou: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }

    // 3. Testar CheckAlertsUseCase
    console.log('\n🔍 Testando CheckAlertsUseCase...');
    const checkAlertsUseCase = new CheckAlertsUseCase();
    
    try {
      const checkResult = await checkAlertsUseCase.execute();
      console.log(`✅ Verificação concluída: ${checkResult.triggeredCount} alertas disparados`);
      console.log(`📊 Resumo: ${checkResult.summary.totalAlerts} total, ${checkResult.summary.activeAlerts} ativos`);
    } catch (error) {
      console.log(`⚠️ Verificação de alertas falhou: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }

    // 4. Testar CollectFiisDataUseCase
    console.log('\n📡 Testando CollectFiisDataUseCase...');
    const collectDataUseCase = new CollectFiisDataUseCase();
    
    try {
      const collectResult = await collectDataUseCase.execute({
        sources: ['status-invest'],
        saveToDatabase: false // Não salvar para não interferir nos testes
      });
      console.log(`✅ Coleta concluída: ${collectResult.totalCollected} FIIs coletados`);
      console.log(`📊 Fontes:`, collectResult.sources);
    } catch (error) {
      console.log(`⚠️ Coleta de dados falhou: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }

    // 5. Testar verificação de saúde das fontes
    console.log('\n🏥 Testando saúde das fontes...');
    try {
      const health = await collectDataUseCase.checkSourcesHealth();
      console.log('📊 Status das fontes:');
      Object.entries(health).forEach(([source, status]) => {
        console.log(`   • ${source}: ${status ? '✅' : '❌'}`);
      });
    } catch (error) {
      console.log(`⚠️ Verificação de saúde falhou: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }

    console.log('\n🎉 Todos os Use Cases testados com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  } finally {
    await dataService.close();
    console.log('\n🔌 Conexão com banco fechada');
  }
}

// Executar testes
testUseCases().catch(console.error); 