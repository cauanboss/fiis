#!/usr/bin/env bun

import { AlertManagerService } from '../../application/services/alertManagerService.js';
import { NotificationConfig } from '../../domain/types/fii.js';
import { DataService } from '../services/dataService.js';

async function testAlertSystem() {
  console.log('🚨 Testando Sistema de Alertas...\n');

  // Configuração de notificações
  const notificationConfig: NotificationConfig = {
    enabled: true,
    email: 'test@example.com',
    telegram: '123456789',
    webhook: 'https://webhook.site/your-unique-url'
  };

  const alertManager = new AlertManagerService(notificationConfig);
  const dataService = DataService.getInstance();

  try {
    // Conectar ao banco
    await dataService.connect();
    console.log('✅ Conectado ao banco de dados');

    // 1. Testar criação de alertas
    console.log('\n📝 Testando criação de alertas...');
    
    const testAlert = {
      ticker: 'HGLG11',
      type: 'PRICE' as const,
      condition: 'BELOW' as const,
      value: 150.0,
      active: true
    };

    const alertId = await alertManager.createAlert(testAlert);
    console.log(`✅ Alerta criado com ID: ${alertId}`);

    // 2. Testar busca de alertas
    console.log('\n🔍 Testando busca de alertas...');
    const alerts = await alertManager.getAlertsByTicker('HGLG11');
    console.log(`✅ Encontrados ${alerts.length} alertas para HGLG11`);

    // 3. Testar verificação de alertas
    console.log('\n🔔 Testando verificação de alertas...');
    const triggeredAlerts = await alertManager.checkAndNotifyAlerts();
    console.log(`✅ Verificação concluída. ${triggeredAlerts.length} alertas disparados`);

    // 4. Testar relatório
    console.log('\n📊 Testando geração de relatório...');
    const report = await alertManager.generateAlertReport();
    console.log('📈 Relatório de Alertas:');
    console.log(`   • Total de alertas: ${report.totalAlerts}`);
    console.log(`   • Alertas ativos: ${report.activeAlerts}`);
    console.log(`   • Disparados hoje: ${report.triggeredToday}`);
    console.log(`   • Por tipo:`, report.alertsByType);
    console.log(`   • Por ticker:`, report.alertsByTicker);

    // 5. Testar configuração de alertas padrão
    console.log('\n⚙️ Testando configuração de alertas padrão...');
    const defaultAlertIds = await alertManager.setupDefaultAlerts('HGLG11');
    console.log(`✅ Alertas padrão configurados: ${defaultAlertIds.length} alertas criados`);

    // 6. Testar notificações
    console.log('\n📧 Testando notificações...');
    const notificationResults = await alertManager.testNotifications();
    console.log('📱 Resultados dos testes de notificação:');
    Object.entries(notificationResults).forEach(([channel, success]) => {
      console.log(`   • ${channel}: ${success ? '✅' : '❌'}`);
    });

    // 7. Testar alertas específicos por FII
    console.log('\n🎯 Testando alertas específicos...');
    const fiiAlerts = await alertManager.checkAlertsForFII('HGLG11');
    console.log(`✅ Verificação específica: ${fiiAlerts.length} alertas disparados para HGLG11`);

    console.log('\n🎉 Todos os testes do sistema de alertas concluídos com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  } finally {
    await dataService.close();
    console.log('\n🔌 Conexão com banco fechada');
  }
}

// Executar testes
testAlertSystem().catch(console.error); 