import { CollectFiisDataUseCase } from './src/application/usecases/collect-fiis-data.usecase.js';
import { FIIRepository } from './src/infrastructure/repository/fiiRepository.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const fiiRepository = new FIIRepository(prisma);
const collectUseCase = new CollectFiisDataUseCase(fiiRepository);

async function collectAndSave() {
    console.log('📡 Coletando dados do Funds Explorer e salvando no MongoDB...\n');

    try {
        // Coletar dados do Funds Explorer (que está funcionando)
        const result = await collectUseCase.execute({
            sources: ['funds-explorer'],
            saveToDatabase: true
        });

        console.log(`✅ Coleta concluída!`);
        console.log(`📊 Total de FIIs coletados: ${result.totalCollected}`);

        if (result.errors.length > 0) {
            console.log(`⚠️ Erros encontrados: ${result.errors.length}`);
            result.errors.forEach(error => console.log(`   - ${error}`));
        }

        // Verificar se os dados foram salvos
        const savedFiis = await fiiRepository.getFiis();
        console.log(`💾 FIIs salvos no banco: ${savedFiis.length}`);

        if (savedFiis.length > 0) {
            console.log(`📋 Exemplo de FII salvo:`, savedFiis[0]);
        }

    } catch (error) {
        console.error('❌ Erro durante coleta e salvamento:', error);
    } finally {
        await prisma.$disconnect();
    }
}

collectAndSave(); 