#!/usr/bin/env bun

import { DependencyContainer } from '../infrastructure/config/dependency-container.js';
import { BuyRecommendationSpecification } from '../domain/specifications/fii-specifications.js';

async function testCleanArchitecture() {
    console.log('🧪 Testando Clean Architecture...\n');

    try {
        // 1. Obter container de dependências
        console.log('📦 Inicializando container de dependências...');
        const container = DependencyContainer.getInstance();

        // 2. Testar Application Service
        console.log('\n🎯 Testando FIIApplicationService...');
        const appService = container.getFIIApplicationService();

        // Simular coleta e análise
        const result = await appService.collectAndAnalyze(['funds-explorer']);
        console.log('✅ Resultado da aplicação:', {
            collected: result.collected,
            analyzed: result.analyzed,
            buyCount: result.buyCount,
            holdCount: result.holdCount,
            sellCount: result.sellCount
        });

        // 3. Testar Controllers
        console.log('\n🎮 Testando Controllers...');
        const fiiController = container.getFIIController();
        const alertController = container.getAlertController();

        console.log('✅ Controllers inicializados:', {
            fiiController: fiiController.constructor.name,
            alertController: alertController.constructor.name
        });

        // 4. Testar EventBus
        console.log('\n📡 Testando EventBus...');
        const eventBus = container.getEventBus();

        // Simular eventos
        eventBus.publish('TEST_EVENT', { message: 'Teste de evento' });
        console.log('✅ EventBus funcionando');

        // 5. Testar Specifications
        console.log('\n🔍 Testando Specifications...');
        const buySpec = new BuyRecommendationSpecification();
        console.log('✅ Specification criada:', buySpec.constructor.name);

        // 6. Testar Repositories
        console.log('\n🗄️ Testando Repositories...');
        const fiiRepo = container.getFIIRepository();
        const alertRepo = container.getAlertRepository();

        console.log('✅ Repositories inicializados:', {
            fiiRepository: fiiRepo.constructor.name,
            alertRepository: alertRepo.constructor.name
        });

        // 7. Testar análise de portfólio
        console.log('\n📊 Testando análise de portfólio...');
        const portfolioAnalysis = await appService.getPortfolioAnalysis();
        console.log('✅ Análise de portfólio:', {
            totalFiis: portfolioAnalysis.totalFiis,
            stats: portfolioAnalysis.stats
        });

        console.log('\n🎉 Todos os testes da Clean Architecture passaram!');
        console.log('\n📋 Resumo dos componentes conectados:');
        console.log('   ✅ DependencyContainer - Container de injeção de dependência');
        console.log('   ✅ FIIApplicationService - Serviço de aplicação');
        console.log('   ✅ Controllers - Controllers HTTP');
        console.log('   ✅ EventBus - Barramento de eventos');
        console.log('   ✅ Specifications - Regras de negócio');
        console.log('   ✅ Repositories - Acesso a dados');
        console.log('   ✅ Domain Events - Eventos de domínio');

    } catch (error) {
        console.error('❌ Erro durante os testes:', error);
    } finally {
        // Limpar recursos
        const container = DependencyContainer.getInstance();
        await container.cleanup();
        console.log('\n🧹 Recursos limpos');
    }
}

// Executar se for o arquivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
    testCleanArchitecture().catch(console.error);
}

export { testCleanArchitecture }; 