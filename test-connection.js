import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
    try {
        console.log('🔌 Testando conexão com MongoDB...');
        await prisma.$connect();
        console.log('✅ Conexão estabelecida com sucesso!');

        // Tentar buscar FIIs
        const fiis = await prisma.fII.findMany({ take: 5 });
        console.log(`📊 FIIs encontrados: ${fiis.length}`);

        if (fiis.length > 0) {
            console.log('📋 Primeiro FII:', fiis[0]);
        } else {
            console.log('⚠️ Nenhum FII encontrado no banco');
        }

    } catch (error) {
        console.error('❌ Erro na conexão:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection(); 