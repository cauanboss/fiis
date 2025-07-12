#!/usr/bin/env bun

import { FIICollectionScheduler, FIIDataWorker, eventBus } from '../collection/index.js';
import { FIIRepository } from '../database/repositories/fiiRepository.js';
import { AlertRepository } from '../database/repositories/alertRepository.js';
import { DataService } from '../services/dataService.js';
import { NotificationConfig } from '../../domain/types/fii.js';

async function testCollectionInfrastructure() {
  console.log('🏗️ Testando Infraestrutura de Coleta...\n');

  const dataService = DataService.getInstance();

  try {
    // Conectar ao banco
    await dataService.connect();
    console.log('✅ Conectado ao banco de dados');

    // Configuração de notificações
    const notificationConfig: NotificationConfig = {
      enabled: true,
      email: 'test@example.com',
      telegram: '123456789'
    };

    // Configuração do scheduler
    const schedulerConfig = {
      collectionInterval: 1, // 1 minuto (para teste)
      analysisInterval: 2,   // 2 minutos
      alertCheckInterval: 3, // 3 minutos
      enabled: true,
      notificationConfig
    };

    // 1. Testar EventBus
    console.log('\n📡 Testando EventBus...');
    
    eventBus.subscribe('COLLECTION_COMPLETED', (event) => {
      console.log(`📡 Handler: Coleta concluída - ${event.data?.totalCollected} FIIs`);
    });

    eventBus.subscribe('ANALYSIS_COMPLETED', (event) => {
      console.log(`📡 Handler: Análise concluída - ${event.data?.analyses?.length} FIIs analisados`);
    });

    eventBus.subscribe('ALERT_CHECK_COMPLETED', (event) => {
      console.log(`📡 Handler: Verificação de alertas - ${event.data?.triggeredCount} disparados`);
    });

    // Publicar alguns eventos de teste
    await eventBus.publish({
      type: 'COLLECTION_STARTED',
      source: 'test',
      data: { sources: ['status-invest'] }
    });

    // 2. Testar Scheduler
    console.log('\n⏰ Testando Scheduler...');
    
    const scheduler = new FIICollectionScheduler(
      new FIIRepository(dataService['database'].getClient()),
      new AlertRepository(dataService['database'].getClient()),
      schedulerConfig
    );

    // Executar tarefas manuais
    console.log('\n📡 Executando coleta manual...');
    await scheduler.executeCollection();

    console.log('\n📊 Executando análise manual...');
    await scheduler.executeAnalysis();

    console.log('\n🔔 Executando verificação manual de alertas...');
    await scheduler.executeAlertCheck();

    // Verificar status
    const schedulerStatus = scheduler.getStatus();
    console.log('📊 Status do Scheduler:', schedulerStatus);

    // 3. Testar Worker
    console.log('\n⚙️ Testando Worker...');
    
    const worker = new FIIDataWorker(
      new FIIRepository(dataService['database'].getClient())
    );

    // Adicionar jobs
    const jobId1 = worker.addJob({
      type: 'COLLECT',
      priority: 'HIGH'
    });

    const jobId2 = worker.addJob({
      type: 'ANALYZE',
      priority: 'NORMAL'
    });

    const jobId3 = worker.addJob({
      type: 'BOTH',
      priority: 'LOW'
    });

    console.log(`📋 Jobs adicionados: ${jobId1}, ${jobId2}, ${jobId3}`);

    // Iniciar worker
    worker.start();

    // Aguardar um pouco para processar os jobs
    console.log('⏳ Aguardando processamento dos jobs...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Verificar status do worker
    const workerStatus = worker.getStatus();
    console.log('📊 Status do Worker:', workerStatus);

    const workerStats = worker.getStats();
    console.log('📈 Estatísticas do Worker:', workerStats);

    // Parar worker
    worker.stop();

    // 4. Verificar eventos
    console.log('\n📡 Verificando eventos...');
    const recentEvents = eventBus.getRecentEvents(10);
    console.log(`📊 Últimos ${recentEvents.length} eventos:`);
    recentEvents.forEach(event => {
      console.log(`   • ${event.type} (${event.timestamp.toLocaleTimeString()})`);
    });

    const eventStats = eventBus.getEventStats();
    console.log('📈 Estatísticas dos Eventos:', eventStats);

    console.log('\n🎉 Infraestrutura de coleta testada com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  } finally {
    await dataService.close();
    console.log('\n🔌 Conexão com banco fechada');
  }
}

// Executar testes
testCollectionInfrastructure().catch(console.error); 