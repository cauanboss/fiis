#!/usr/bin/env bun

import { SchedulerService } from '../services/scheduler-service.js';
import { FIIRepository } from '../database/repositories/fiiRepository.js';
import { AlertRepository } from '../database/repositories/alertRepository.js';
import { DataService } from '../services/dataService.js';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const timesPerDay = Number(process.env.COLLECTIONS_PER_DAY) || 4; // Exemplo: 4 vezes ao dia
  const intervalMinutes = Math.floor((24 * 60) / timesPerDay);

  const dataService = DataService.getInstance();
  await dataService.connect();

  const scheduler = SchedulerService.getInstance(
    new FIIRepository(dataService['database'].getClient()),
    new AlertRepository(dataService['database'].getClient()),
    {
      collectionInterval: intervalMinutes, // minutos calculados
      analysisInterval: intervalMinutes,   // pode ser igual ou diferente
      alertCheckInterval: 60,              // ex: checa alertas a cada 1h
      enabled: true
    }
  );

  scheduler.start();
  console.log(`⏰ Coleta agendada para rodar ${timesPerDay}x ao dia (a cada ${intervalMinutes} minutos)`);
  
  // Manter o processo rodando
  process.on('SIGINT', () => {
    console.log('\n🛑 Recebido SIGINT, parando scheduler...');
    scheduler.stop();
    process.exit(0);
  });
}

main(); 