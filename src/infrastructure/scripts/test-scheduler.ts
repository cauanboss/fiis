#!/usr/bin/env bun

import { SchedulerService } from '../services/scheduler-service.js';
import { FIIRepository } from '../repository/fiiRepository.js';
import { AlertRepository } from '../repository/alertRepository.js';
import { DataService } from '../services/dataService.js';
import dotenv from 'dotenv';

dotenv.config();

async function testScheduler() {
  console.log('🧪 Testando SchedulerService...\n');

  const dataService = DataService.getInstance();
  await dataService.connect();

  const scheduler = SchedulerService.getInstance(
    new FIIRepository(dataService['database'].getClient()),
    new AlertRepository(dataService['database'].getClient()),
    {
      collectionInterval: 1,    // 1 minuto para teste
      analysisInterval: 2,      // 2 minutos para teste
      alertCheckInterval: 3,    // 3 minutos para teste
      enabled: true
    }
  );

  // Teste 1: Status inicial
  console.log('📊 Status inicial:', scheduler.getStatus());

  // Teste 2: Iniciar scheduler
  console.log('\n🚀 Iniciando scheduler...');
  scheduler.start();

  // Teste 3: Status após iniciar
  console.log('\n📊 Status após iniciar:', scheduler.getStatus());

  // Teste 4: Executar tarefas manuais
  console.log('\n🔧 Testando execução manual...');

  try {
    await scheduler.executeCollection();
  } catch (error) {
    console.log('⚠️ Erro na coleta manual (esperado se não houver dados):', (error as Error).message);
  }

  try {
    await scheduler.executeAnalysis();
  } catch (error) {
    console.log('⚠️ Erro na análise manual (esperado se não houver dados):', (error as Error).message);
  }

  try {
    await scheduler.executeAlertCheck();
  } catch (error) {
    console.log('⚠️ Erro na verificação de alertas manual (esperado se não houver dados):', (error as Error).message);
  }

  // Teste 5: Aguardar alguns segundos para ver os logs automáticos
  console.log('\n⏳ Aguardando 10 segundos para ver logs automáticos...');
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Teste 6: Parar scheduler
  console.log('\n🛑 Parando scheduler...');
  scheduler.stop();

  // Teste 7: Status final
  console.log('\n📊 Status final:', scheduler.getStatus());

  console.log('\n✅ Teste do SchedulerService concluído!');
}

async function compareApproaches() {
  console.log('\n📋 Comparação das Abordagens de Agendamento:\n');

  console.log('🔄 SchedulerService (Atual):');
  console.log('✅ Vantagens:');
  console.log('   - Controle total sobre execução');
  console.log('   - Fácil de debugar e monitorar');
  console.log('   - Pode ser pausado/retomado');
  console.log('   - Configuração flexível');
  console.log('   - Logs detalhados');
  console.log('❌ Desvantagens:');
  console.log('   - Precisa manter processo rodando');
  console.log('   - Consome recursos do servidor');
  console.log('   - Não é escalável horizontalmente');

  console.log('\n🗄️ MongoDB TTL (Alternativa):');
  console.log('✅ Vantagens:');
  console.log('   - Mais eficiente em recursos');
  console.log('   - Não precisa manter processo');
  console.log('   - Escalável horizontalmente');
  console.log('   - Integrado ao banco de dados');
  console.log('❌ Desvantagens:');
  console.log('   - Menos flexível para controle');
  console.log('   - Depende do MongoDB');
  console.log('   - Difícil de debugar');
  console.log('   - Não compatível com Prisma');

  console.log('\n🎯 Recomendação:');
  console.log('Para este projeto, o SchedulerService é a melhor escolha porque:');
  console.log('1. Oferece mais controle e visibilidade');
  console.log('2. É mais fácil de manter e debugar');
  console.log('3. Permite configuração dinâmica');
  console.log('4. Compatível com a arquitetura atual');
}

async function main() {
  try {
    await testScheduler();
    await compareApproaches();
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    const dataService = DataService.getInstance();
    await dataService.close();
  }
}

main(); 