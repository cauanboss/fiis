import { main as startScheduler } from './infrastructure/index.js';
import { ExpressAdapter } from './infrastructure/adapters/express-adapter.js';
import { WebServer } from './infrastructure/web/web-server.js';

async function main() {
    try {
        console.log('🚀 Iniciando FII Analyzer...');

        // Iniciar scheduler em background
        console.log('⏰ Iniciando scheduler...');
        startScheduler();

        // Iniciar servidor HTTP
        console.log('🌐 Iniciando servidor HTTP...');
        const port = parseInt(process.env.PORT || '3000');
        const expressAdapter = new ExpressAdapter();
        const webServer = new WebServer(expressAdapter);

        webServer.start(port);

        console.log(`✅ FII Analyzer iniciado com sucesso!`);
        console.log(`📊 Dashboard: http://localhost:${port}`);
        console.log(`🔧 API: http://localhost:${port}/api/analyze`);

    } catch (error) {
        console.error('❌ Erro durante a inicialização:', error);
        process.exit(1);
    }
}

main().catch(console.error);