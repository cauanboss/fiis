import express from 'express';
import { FIIService } from '../services/fii-service.js';
import { FIIAnalyzer } from '../../application/analysis/fii-analyzer.js';

const app = express();
const port = process.env.PORT || 3000;

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
    const service = new FIIService();
    const results = await service.collectAndAnalyze();
    
    const analyses = results.analyses || [];
    const stats = {
      totalFiis: analyses.length,
      buyCount: analyses.filter(a => a.recommendation === 'BUY').length,
      holdCount: analyses.filter(a => a.recommendation === 'HOLD').length,
      sellCount: analyses.filter(a => a.recommendation === 'SELL').length,
      avgScore: analyses.length > 0 ? analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length : 0,
      avgDY: analyses.length > 0 ? analyses.reduce((sum, a) => sum + a.dividendYield, 0) / analyses.length : 0,
      avgPVP: analyses.length > 0 ? analyses.reduce((sum, a) => sum + a.pvp, 0) / analyses.length : 0
    };
    
    res.json({ analyses, stats });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao analisar FIIs' });
  }
});

// API para dados brutos
app.get('/api/fiis', async (req, res) => {
  try {
    const service = new FIIService();
    const results = await service.collectData();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao coletar dados' });
  }
});

app.listen(port, () => {
  console.log(`🌐 Servidor web rodando em http://localhost:${port}`);
}); 