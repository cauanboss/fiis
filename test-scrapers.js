import { CollectFiisDataUseCase } from './src/application/usecases/collect-fiis-data.usecase.js';
import { FIIRepository } from './src/infrastructure/repository/fiiRepository.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const fiiRepository = new FIIRepository(prisma);
const collectUseCase = new CollectFiisDataUseCase(fiiRepository);

async function testAllScrapers() {
    console.log('🧪 Testando todos os scrapers...\n');

    const sources = ['status-invest', 'funds-explorer', 'clube-fii'];

    for (const source of sources) {
        console.log(`\n🔍 Testando ${source}...`);

        try {
            const result = await collectUseCase.execute({
                sources: [source],
                saveToDatabase: false
            });

            if (result.totalCollected > 0) {
                console.log(`✅ ${source}: ${result.totalCollected} FIIs coletados`);

                // Mostrar alguns exemplos
                const sourceResult = result.sources[source];
                if (sourceResult.success && sourceResult.data && sourceResult.data.length > 0) {
                    console.log(`📊 Exemplo de FII coletado:`, sourceResult.data[0]);
                }
            } else {
                console.log(`❌ ${source}: Nenhum FII coletado`);
                if (result.sources[source].error) {
                    console.log(`   Erro: ${result.sources[source].error}`);
                }
            }
        } catch (error) {
            console.log(`❌ ${source}: Erro durante a coleta - ${error.message}`);
        }
    }

    await prisma.$disconnect();
}

testAllScrapers(); 