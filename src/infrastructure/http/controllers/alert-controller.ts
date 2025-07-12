import { Request, Response } from 'express';
import { CreateAlertUseCase } from '../../../application/usecases/create-alert.usecase.js';
import { CheckAlertsUseCase } from '../../../application/usecases/check-alerts.usecase.js';
import { FIIRepositoryInterface } from '../../../domain/repositories/fii-repository.interface.js';
import { AlertRepositoryInterface } from '../../../domain/repositories/alert-repository.interface.js';
import { NotificationConfig } from '../../../domain/types/fii.js';

export class AlertController {
    private createAlertUseCase: CreateAlertUseCase;
    private checkAlertsUseCase: CheckAlertsUseCase;

    constructor(
        fiiRepository: FIIRepositoryInterface,
        alertRepository: AlertRepositoryInterface,
        notificationConfig?: NotificationConfig
    ) {
        this.createAlertUseCase = new CreateAlertUseCase(alertRepository);
        this.checkAlertsUseCase = new CheckAlertsUseCase(
            fiiRepository,
            alertRepository,
            notificationConfig
        );
    }

    async handleGetAlerts(req: Request, res: Response): Promise<void> {
        try {
            // Implementar lógica para buscar alertas
            res.json({ message: 'Lista de alertas' });
        } catch (error) {
            console.error('❌ Erro ao buscar alertas:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    async handleCreateAlert(req: Request, res: Response): Promise<void> {
        try {
            const { ticker, type, condition, value, message } = req.body;
            const result = await this.createAlertUseCase.execute({
                ticker,
                type,
                condition,
                value,
                message
            });
            res.json(result);
        } catch (error) {
            console.error('❌ Erro ao criar alerta:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    async handleCheckAlerts(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.checkAlertsUseCase.execute();
            res.json(result);
        } catch (error) {
            console.error('❌ Erro ao verificar alertas:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }
} 