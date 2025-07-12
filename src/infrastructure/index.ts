#!/usr/bin/env bun

import { SchedulerService } from './services/scheduler-service.js';
import { FIIRepository } from './database/repositories/fiiRepository.js';
import { AlertRepository } from './database/repositories/alertRepository.js';
import { DataService } from './services/dataService.js';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    console.log('🚀 Iniciando FII Analyzer com Scheduler...');
    
    const dataService = DataService.getInstance();
    
    // Conectar ao banco de dados
    console.log('🔌 Conectando ao banco de dados...');
    await dataService.connect();
    
    // Configurar scheduler
    const timesPerDay = Number(process.env.COLLECTIONS_PER_DAY) || 4;
    // const intervalMinutes = Math.floor((24 * 60) / timesPerDay);
    const intervalMinutes = 5000;
    
    console.log(`⏰ Configurando scheduler para ${timesPerDay} coletas por dia (a cada ${intervalMinutes} minutos)`);
    
    const scheduler = SchedulerService.getInstance(
      new FIIRepository(dataService['database'].getClient()),
      new AlertRepository(dataService['database'].getClient()),
      {
        collectionInterval: intervalMinutes,
        analysisInterval: intervalMinutes,
        alertCheckInterval: 60, // Verificar alertas a cada 1 hora
        enabled: true
      }
    );

    // Iniciar scheduler
    scheduler.start();
    
    console.log('✅ Scheduler iniciado com sucesso!');
    console.log('📊 Status:', scheduler.getStatus());
    
    // Manter o processo rodando
    console.log('\n🔄 Scheduler rodando... Pressione Ctrl+C para parar');
    
    // Capturar sinais para parar graciosamente
    process.on('SIGINT', () => {
      console.log('\n🛑 Recebido SIGINT, parando scheduler...');
      scheduler.stop();
      dataService.close().then(() => {
        console.log('✅ Scheduler parado e conexões fechadas');
        process.exit(0);
      });
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 Recebido SIGTERM, parando scheduler...');
      scheduler.stop();
      dataService.close().then(() => {
        console.log('✅ Scheduler parado e conexões fechadas');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Erro durante a inicialização:', error);
    process.exit(1);
  }
}

// Executar se for o arquivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main };
export { SchedulerService } from './services/scheduler-service.js'; 
