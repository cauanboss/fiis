import { AlertRepositoryInterface } from '../../domain/repositories/index.js';
import { Alert, CreateAlertRequest, CreateAlertResponse } from '../../domain/types/index.js';

export class CreateAlertUseCase {
  private alertRepository: AlertRepositoryInterface;

  constructor(alertRepository: AlertRepositoryInterface) {
    this.alertRepository = alertRepository;
  }

  async execute(request: CreateAlertRequest): Promise<CreateAlertResponse> {
    try {
      // Validar dados do alerta
      this.validateAlertData(request);

      // Criar alerta
      const alertId = await this.alertRepository.createAlert({
        ticker: request.ticker.toUpperCase(),
        type: request.type,
        condition: request.condition,
        value: request.value,
        active: true,
        message: request.message
      });

      // Buscar alerta criado
      const alerts = await this.alertRepository.getAlerts();
      const createdAlert = alerts.find(a => a.id === alertId);

      if (!createdAlert) {
        throw new Error('Erro ao recuperar alerta criado');
      }

      return {
        alertId,
        alert: createdAlert,
        success: true,
        message: `Alerta criado com sucesso para ${request.ticker}`
      };

    } catch (error) {
      return {
        alertId: '',
        alert: {} as Alert,
        success: false,
        message: `Erro ao criar alerta: ${error}`
      };
    }
  }

  private validateAlertData(request: CreateAlertRequest): void {
    if (!request.ticker || request.ticker.trim().length === 0) {
      throw new Error('Ticker é obrigatório');
    }

    if (!request.type || !['PRICE', 'DY', 'PVP', 'SCORE'].includes(request.type)) {
      throw new Error('Tipo de alerta inválido');
    }

    if (!request.condition || !['ABOVE', 'BELOW', 'EQUALS'].includes(request.condition)) {
      throw new Error('Condição de alerta inválida');
    }

    if (typeof request.value !== 'number' || isNaN(request.value)) {
      throw new Error('Valor deve ser um número válido');
    }

    // Validações específicas por tipo
    switch (request.type) {
      case 'PRICE':
        if (request.value <= 0) {
          throw new Error('Preço deve ser maior que zero');
        }
        break;
      case 'DY':
        if (request.value < 0 || request.value > 100) {
          throw new Error('Dividend Yield deve estar entre 0% e 100%');
        }
        break;
      case 'PVP':
        if (request.value <= 0) {
          throw new Error('P/VP deve ser maior que zero');
        }
        break;
      case 'SCORE':
        if (request.value < 0 || request.value > 1) {
          throw new Error('Score deve estar entre 0 e 1');
        }
        break;
    }
  }
} 