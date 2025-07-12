import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testWithMockData() {
    console.log('🧪 Testando sistema com dados mock...\n');

    try {
        // Dados mock de FIIs
        const now = new Date();
        const mockFiis = [
            {
                ticker: 'HGLG11',
                name: 'CSHG Logística',
                price: 150.50,
                dividendYield: 8.5,
                dividendYield12m: 8.5,
                pvp: 0.95,
                lastDividend: 1.25,
                priceVariation: 1.2,
                source: 'mock',
                lastUpdate: now
            },
            {
                ticker: 'XPML11',
                name: 'XP Malls',
                price: 95.30,
                dividendYield: 7.2,
                dividendYield12m: 7.2,
                pvp: 0.88,
                lastDividend: 0.68,
                priceVariation: -0.5,
                source: 'mock',
                lastUpdate: now
            },
            {
                ticker: 'HABT11',
                name: 'Habitat',
                price: 78.90,
                dividendYield: 9.1,
                dividendYield12m: 9.1,
                pvp: 1.02,
                lastDividend: 0.72,
                priceVariation: 0.0,
                source: 'mock',
                lastUpdate: now
            }
        ];

        console.log('📊 Salvando dados mock no MongoDB...');

        for (const fii of mockFiis) {
            try {
                await prisma.fII.create({
                    data: {
                        ticker: fii.ticker,
                        name: fii.name,
                        price: fii.price,
                        dividendYield: fii.dividendYield,
                        dividendYield12m: fii.dividendYield12m,
                        pvp: fii.pvp,
                        lastDividend: fii.lastDividend,
                        priceVariation: fii.priceVariation,
                        source: fii.source,
                        lastUpdate: fii.lastUpdate
                    }
                });
                console.log(`✅ FII ${fii.ticker} salvo com sucesso`);
            } catch (error) {
                console.error(`❌ Erro ao salvar FII ${fii.ticker}:`, error.message);
            }
        }

        // Verificar dados salvos
        const savedFiis = await prisma.fII.findMany();
        console.log(`\n📊 Total de FIIs no banco: ${savedFiis.length}`);

        if (savedFiis.length > 0) {
            console.log('📋 FIIs salvos:');
            savedFiis.forEach(fii => {
                console.log(`  - ${fii.ticker}: R$ ${fii.price} (DY: ${fii.dividendYield}%)`);
            });
        }

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testWithMockData(); 