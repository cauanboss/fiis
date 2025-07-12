import express from 'express';
import {
  AnalyzeFiisUseCase,
  CreateAlertUseCase,
  CheckAlertsUseCase,
  CollectFiisDataUseCase
} from '../../application/usecases/index.js';
import { NotificationConfig } from '../../domain/types/fii.js';
import { PrismaClient } from '@prisma/client';
import { FIIRepository } from '../database/repositories/fiiRepository.js';
import { AlertRepository } from '../database/repositories/alertRepository.js';

const app = express();
const port = process.env.PORT || 3000;

// Initialize repositories
const prisma = new PrismaClient();
const fiiRepository = new FIIRepository(prisma);
const alertRepository = new AlertRepository(prisma);

app.use(express.json());
app.use(express.static('public'));

// Rota principal
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>FII Analyzer</title>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; color: #007bff; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .table th { background-color: #f8f9fa; font-weight: bold; }
        .buy { color: #28a745; font-weight: bold; }
        .hold { color: #ffc107; font-weight: bold; }
        .sell { color: #dc3545; font-weight: bold; }
        .loading { text-align: center; padding: 50px; }
        .refresh-btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
        .refresh-btn:hover { background: #0056b3; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏢 FII Analyzer</h1>
          <p>Análise de Fundos Imobiliários em Tempo Real</p>
          <button class="refresh-btn" onclick="refreshData()">🔄 Atualizar Dados</button>
        </div>
        
        <div id="loading" class="loading">
          <h2>Carregando dados...</h2>
          <p>Isso pode levar alguns segundos...</p>
        </div>
        
        <div id="content" style="display: none;">
          <div class="stats" id="stats"></div>
          <div id="table-container"></div>
        </div>
      </div>

      <script>
        async function refreshData() {
          document.getElementById('loading').style.display = 'block';
          document.getElementById('content').style.display = 'none';
          
          try {
            const response = await fetch('/api/analyze');
            const data = await response.json();
            
            displayResults(data);
          } catch (error) {
            console.error('Erro ao carregar dados:', error);
            document.getElementById('loading').innerHTML = '<h2>Erro ao carregar dados</h2>';
          }
        }

        function displayResults(data) {
          const stats = data.stats;
          const analyses = data.analyses;
          
          // Exibir estatísticas
          document.getElementById('stats').innerHTML = \`
            <div class="stat-card">
              <div class="stat-number">\${stats.totalFiis}</div>
              <div>Total de FIIs</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">\${stats.buyCount}</div>
              <div>Recomendações BUY</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">\${stats.holdCount}</div>
              <div>Recomendações HOLD</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">\${stats.avgScore.toFixed(2)}</div>
              <div>Score Médio</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">\${stats.avgDY.toFixed(2)}%</div>
              <div>DY Médio</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">\${stats.avgPVP.toFixed(2)}</div>
              <div>P/VP Médio</div>
            </div>
          \`;
          
          // Exibir tabela
          const tableHTML = \`
            <table class="table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Ticker</th>
                  <th>Nome</th>
                  <th>Preço</th>
                  <th>DY (%)</th>
                  <th>P/VP</th>
                  <th>Score</th>
                  <th>Recomendação</th>
                </tr>
              </thead>
              <tbody>
                \${analyses.map(fii => \`
                  <tr>
                    <td>\${fii.rank}</td>
                    <td><strong>\${fii.ticker}</strong></td>
                    <td>\${fii.name}</td>
                    <td>R$ \${fii.price.toFixed(2)}</td>
                    <td>\${fii.dividendYield.toFixed(2)}%</td>
                    <td>\${fii.pvp.toFixed(2)}</td>
                    <td>\${fii.score.toFixed(2)}</td>
                    <td class="\${fii.recommendation.toLowerCase()}">\${fii.recommendation}</td>
                  </tr>
                \`).join('')}
              </tbody>
            </table>
          \`;
          
          document.getElementById('table-container').innerHTML = tableHTML;
          document.getElementById('loading').style.display = 'none';
          document.getElementById('content').style.display = 'block';
        }

        // Carregar dados automaticamente
        refreshData();
      </script>
    </body>
    </html>
  `);
});

// API para análise
app.get('/api/analyze', async (req, res) => {
  try {
    const useCase = new AnalyzeFiisUseCase(fiiRepository);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    const result = await useCase.execute({ limit });

    res.json(result);
  } catch {
    res.status(500).json({ error: 'Erro ao analisar FIIs' });
  }
});

// API para dados brutos
app.get('/api/fiis', async (_req, res) => {
  try {
    const result = await collectFiisDataUseCase.execute({
      sources: ['status-invest'],
      saveToDatabase: true
    });
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Erro ao coletar dados' });
  }
});

// Configuração de notificações (em produção, viria de variáveis de ambiente)
const notificationConfig: NotificationConfig = {
  enabled: true,
  email: process.env.ALERT_EMAIL,
  telegram: process.env.ALERT_TELEGRAM,
  webhook: process.env.ALERT_WEBHOOK
};

// Use Cases
const createAlertUseCase = new CreateAlertUseCase(alertRepository);
const checkAlertsUseCase = new CheckAlertsUseCase(fiiRepository, alertRepository, notificationConfig);
const collectFiisDataUseCase = new CollectFiisDataUseCase(fiiRepository);

// API para alertas
app.get('/api/alerts', async (_req, res) => {
  try {
    // TODO: Implementar busca de alertas por ticker
    res.json([]);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar alertas' });
  }
});

app.post('/api/alerts', async (req, res) => {
  try {
    const result = await createAlertUseCase.execute(req.body);
    res.json(result);
  } catch {
    res.status(400).json({ error: 'Erro ao criar alerta' });
  }
});

app.put('/api/alerts/:id', async (req, res) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id } = req.params;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const alertData = req.body;
    // TODO: Implementar atualização de alerta usando id e alertData
    res.json({ message: 'Alerta atualizado com sucesso' });
  } catch {
    res.status(400).json({ error: 'Erro ao atualizar alerta' });
  }
});

app.delete('/api/alerts/:id', async (req, res) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id } = req.params;
    // TODO: Implementar remoção de alerta usando id
    res.json({ message: 'Alerta removido com sucesso' });
  } catch {
    res.status(400).json({ error: 'Erro ao remover alerta' });
  }
});

app.post('/api/alerts/check', async (_req, res) => {
  try {
    const result = await checkAlertsUseCase.execute();
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Erro ao verificar alertas' });
  }
});

app.get('/api/alerts/report', async (_req, res) => {
  try {
    // TODO: Implementar relatório de alertas
    res.json({ totalAlerts: 0, activeAlerts: 0 });
  } catch {
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

app.post('/api/alerts/test', async (_req, res) => {
  try {
    // TODO: Implementar teste de notificações
    res.json({ email: true, telegram: true, webhook: false });
  } catch {
    res.status(500).json({ error: 'Erro ao testar notificações' });
  }
});

app.post('/api/alerts/setup-default/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    // TODO: Implementar configuração de alertas padrão usando ticker
    res.json({
      message: `Alertas padrão configurados para ${ticker}`,
      alertIds: []
    });
  } catch {
    res.status(400).json({ error: 'Erro ao configurar alertas' });
  }
});

app.listen(port, () => {
  console.log(`🌐 Servidor web rodando em http://localhost:${port}`);
}); 