import { CollectFiisDataUseCase } from './src/application/usecases/collect-fiis-data.usecase.js';
import { FIIRepository } from './src/infrastructure/repository/fiiRepository.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const fiiRepository = new FIIRepository(prisma);
const collectUseCase = new CollectFiisDataUseCase(fiiRepository);

async function testSimpleCollection() {
    console.log('🧪 Testando coleta simples...\n');

    try {
        console.log('📡 Iniciando coleta de dados...');

        const result = await collectUseCase.execute({
            sources: ['funds-explorer'],
            saveToDatabase: true
        });

        console.log(`✅ Coleta concluída!`);
        console.log(`📊 Total de FIIs coletados: ${result.totalCollected}`);
        console.log(`📊 FIIs salvos no banco: ${result.savedToDatabase}`);

        if (result.errors.length > 0) {
            console.log(`❌ Erros encontrados: ${result.errors.length}`);
            result.errors.forEach(error => console.log(`  - ${error}`));
        }

        // Verificar dados no banco
        const fiisInDb = await prisma.fII.findMany({ take: 5 });
        console.log(`\n📋 FIIs no banco: ${fiisInDb.length}`);

        if (fiisInDb.length > 0) {
            console.log('📋 Primeiros FIIs no banco:');
            fiisInDb.forEach(fii => {
                console.log(`  - ${fii.ticker}: R$ ${fii.price} (DY: ${fii.dividendYield}%)`);
            });
        }

    } catch (error) {
        console.error('❌ Erro na coleta:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testSimpleCollection(); 