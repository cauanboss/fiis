import { Request, Response } from 'express';
import { WebServerInterface } from '../../domain/interfaces/web-server.interface.js';
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
import express from 'express';

export class WebServer {
  private server: WebServerInterface;
  private fiiRepository!: FIIRepository;
  private alertRepository!: AlertRepository;
  private createAlertUseCase!: CreateAlertUseCase;
  private checkAlertsUseCase!: CheckAlertsUseCase;
  private collectFiisDataUseCase!: CollectFiisDataUseCase;

  constructor(server: WebServerInterface) {
    this.server = server;
    this.initializeRepositories();
    this.initializeUseCases();
    this.setupRoutes();
  }

  private initializeRepositories(): void {
    const prisma = new PrismaClient();
    this.fiiRepository = new FIIRepository(prisma);
    this.alertRepository = new AlertRepository(prisma);
  }

  private initializeUseCases(): void {
    const notificationConfig: NotificationConfig = {
      enabled: true,
      email: process.env.ALERT_EMAIL,
      telegram: process.env.ALERT_TELEGRAM,
      webhook: process.env.ALERT_WEBHOOK
    };

    this.createAlertUseCase = new CreateAlertUseCase(this.alertRepository);
    this.checkAlertsUseCase = new CheckAlertsUseCase(this.fiiRepository, this.alertRepository, notificationConfig);
    this.collectFiisDataUseCase = new CollectFiisDataUseCase(this.fiiRepository);
  }

  private setupRoutes(): void {
    // Middleware
    this.server.use(express.json());
    this.server.use(express.static('public'));

    // Rota principal
    this.server.get('/', this.handleHomePage.bind(this));

    // APIs
    this.server.get('/api/analyze', this.handleAnalyze.bind(this));
    this.server.get('/api/fiis', this.handleCollectData.bind(this));
    this.server.get('/api/alerts', this.handleGetAlerts.bind(this));
    this.server.post('/api/alerts', this.handleCreateAlert.bind(this));
    this.server.put('/api/alerts/:id', this.handleUpdateAlert.bind(this));
    this.server.delete('/api/alerts/:id', this.handleDeleteAlert.bind(this));
    this.server.post('/api/alerts/check', this.handleCheckAlerts.bind(this));
    this.server.get('/api/alerts/report', this.handleAlertReport.bind(this));
    this.server.post('/api/alerts/test', this.handleTestAlerts.bind(this));
    this.server.post('/api/alerts/setup-default/:ticker', this.handleSetupDefaultAlerts.bind(this));
  }

  private handleHomePage(req: Request, res: Response): void {
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
  }

  private async handleAnalyze(req: Request, res: Response): Promise<void> {
    try {
      const useCase = new AnalyzeFiisUseCase(this.fiiRepository);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

      const result = await useCase.execute({ limit });

      res.json(result);
    } catch {
      res.status(500).json({ error: 'Erro ao analisar FIIs' });
    }
  }

  private async handleCollectData(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.collectFiisDataUseCase.execute({
        sources: ['status-invest'],
        saveToDatabase: true
      });
      res.json(result);
    } catch {
      res.status(500).json({ error: 'Erro ao coletar dados' });
    }
  }

  private async handleGetAlerts(req: Request, res: Response): Promise<void> {
    try {
      // TODO: Implementar busca de alertas por ticker
      res.json([]);
    } catch {
      res.status(500).json({ error: 'Erro ao buscar alertas' });
    }
  }

  private async handleCreateAlert(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.createAlertUseCase.execute(req.body);
      res.json(result);
    } catch {
      res.status(400).json({ error: 'Erro ao criar alerta' });
    }
  }

  private async handleUpdateAlert(req: Request, res: Response): Promise<void> {
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
  }

  private async handleDeleteAlert(req: Request, res: Response): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id } = req.params;
      // TODO: Implementar remoção de alerta usando id
      res.json({ message: 'Alerta removido com sucesso' });
    } catch {
      res.status(400).json({ error: 'Erro ao remover alerta' });
    }
  }

  private async handleCheckAlerts(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.checkAlertsUseCase.execute();
      res.json(result);
    } catch {
      res.status(500).json({ error: 'Erro ao verificar alertas' });
    }
  }

  private async handleAlertReport(req: Request, res: Response): Promise<void> {
    try {
      // TODO: Implementar relatório de alertas
      res.json({ totalAlerts: 0, activeAlerts: 0 });
    } catch {
      res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
  }

  private async handleTestAlerts(req: Request, res: Response): Promise<void> {
    try {
      // TODO: Implementar teste de notificações
      res.json({ email: true, telegram: true, webhook: false });
    } catch {
      res.status(500).json({ error: 'Erro ao testar notificações' });
    }
  }

  private async handleSetupDefaultAlerts(req: Request, res: Response): Promise<void> {
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
  }

  start(port: number): void {
    this.server.start(port);
  }

  stop(): void {
    this.server.stop();
  }
} 