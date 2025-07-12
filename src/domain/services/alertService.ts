import { Alert, AlertTrigger, FII, FIIAnalysis } from '../types/fii';

export class AlertService {
  /**
   * Verifica se um alerta foi disparado baseado nos dados atuais do FII
   */
  static checkAlert(alert: Alert, fii: FII, analysis?: FIIAnalysis): AlertTrigger | null {
    if (!alert.active) return null;

    let currentValue: number;
    let message: string;

    switch (alert.type) {
      case 'PRICE':
        currentValue = fii.price;
        message = `Preço do ${fii.ticker} atingiu R$ ${currentValue.toFixed(2)}`;
        break;
      
      case 'DY':
        currentValue = fii.dividendYield;
        message = `Dividend Yield do ${fii.ticker} atingiu ${currentValue.toFixed(2)}%`;
        break;
      
      case 'PVP':
        currentValue = fii.pvp;
        message = `P/VP do ${fii.ticker} atingiu ${currentValue.toFixed(2)}`;
        break;
      
      case 'SCORE':
        if (!analysis) return null;
        currentValue = analysis.score;
        message = `Score do ${fii.ticker} atingiu ${currentValue.toFixed(2)}`;
        break;
      
      default:
        return null;
    }

    const isTriggered = this.evaluateCondition(currentValue, alert.condition, alert.value);
    
    if (!isTriggered) return null;

    return {
      alert,
      currentValue,
      triggeredAt: new Date(),
      message: `${message} (${alert.condition} ${alert.value})`
    };
  }

  /**
   * Avalia se a condição do alerta foi atendida
   */
  private static evaluateCondition(currentValue: number, condition: string, targetValue: number): boolean {
    switch (condition) {
      case 'ABOVE':
        return currentValue > targetValue;
      case 'BELOW':
        return currentValue < targetValue;
      case 'EQUALS':
        return Math.abs(currentValue - targetValue) < 0.01; // Tolerância para valores float
      default:
        return false;
    }
  }

  /**
   * Gera mensagem personalizada para o alerta
   */
  static generateAlertMessage(trigger: AlertTrigger): string {
    const { alert, currentValue, message } = trigger;
    
    const emoji = this.getAlertEmoji(alert.type);
    const recommendation = this.getRecommendation(alert.type, currentValue, alert.value);
    
    return `${emoji} ${message}\n${recommendation}`;
  }

  /**
   * Retorna emoji baseado no tipo de alerta
   */
  private static getAlertEmoji(type: string): string {
    switch (type) {
      case 'PRICE':
        return '💰';
      case 'DY':
        return '📈';
      case 'PVP':
        return '📊';
      case 'SCORE':
        return '🎯';
      default:
        return '🔔';
    }
  }

  /**
   * Gera recomendação baseada no tipo de alerta
   */
  private static getRecommendation(type: string, currentValue: number, targetValue: number): string {
    switch (type) {
      case 'PRICE':
        return currentValue > targetValue 
          ? 'Preço acima do esperado - considere vender'
          : 'Preço abaixo do esperado - oportunidade de compra';
      
      case 'DY':
        return currentValue > targetValue 
          ? 'DY alto - boa oportunidade de renda'
          : 'DY baixo - considere outras opções';
      
      case 'PVP':
        return currentValue > targetValue 
          ? 'P/VP alto - pode estar sobrevalorizado'
          : 'P/VP baixo - pode estar descontado';
      
      case 'SCORE':
        return currentValue > targetValue 
          ? 'Score alto - excelente oportunidade'
          : 'Score baixo - evite este FII';
      
      default:
        return 'Monitore o comportamento do FII';
    }
  }

  /**
   * Valida se um alerta é válido
   */
  static validateAlert(alert: Alert): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!alert.ticker || alert.ticker.trim() === '') {
      errors.push('Ticker é obrigatório');
    }

    if (!alert.type || !['PRICE', 'DY', 'PVP', 'SCORE'].includes(alert.type)) {
      errors.push('Tipo de alerta inválido');
    }

    if (!alert.condition || !['ABOVE', 'BELOW', 'EQUALS'].includes(alert.condition)) {
      errors.push('Condição inválida');
    }

    if (typeof alert.value !== 'number' || isNaN(alert.value)) {
      errors.push('Valor deve ser um número válido');
    }

    if (alert.value < 0) {
      errors.push('Valor deve ser positivo');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
} 