import { AlertTrigger, NotificationConfig } from '../types/fii';

export class NotificationService {
  private config: NotificationConfig;

  constructor(config: NotificationConfig) {
    this.config = config;
  }

  /**
   * Envia notificação por todos os canais configurados
   */
  async sendNotification(trigger: AlertTrigger): Promise<void> {
    const message = this.formatMessage(trigger);
    
    const promises: Promise<void>[] = [];

    if (this.config.enabled) {
      if (this.config.email) {
        promises.push(this.sendEmail(this.config.email, message));
      }
      
      if (this.config.telegram) {
        promises.push(this.sendTelegram(this.config.telegram, message));
      }
      
      if (this.config.webhook) {
        promises.push(this.sendWebhook(this.config.webhook, trigger));
      }
    }

    await Promise.allSettled(promises);
  }

  /**
   * Formata a mensagem para envio
   */
  private formatMessage(trigger: AlertTrigger): string {
    const { alert, currentValue, message } = trigger;
    
    return `
🚨 ALERTA FII ATIVADO!

${message}

📊 Detalhes:
• FII: ${alert.ticker}
• Tipo: ${alert.type}
• Valor Atual: ${currentValue.toFixed(2)}
• Condição: ${alert.condition} ${alert.value}
• Data/Hora: ${trigger.triggeredAt.toLocaleString('pt-BR')}

💡 Recomendação: ${this.getRecommendation(alert.type, currentValue, alert.value)}
    `.trim();
  }

  /**
   * Envia notificação por email
   */
  private async sendEmail(email: string, message: string): Promise<void> {
    try {
      // Implementação básica - em produção usar serviço como SendGrid, AWS SES, etc.
      console.log(`📧 Email enviado para ${email}:`);
      console.log(message);
      
      // Simular envio
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
    }
  }

  /**
   * Envia notificação via Telegram
   */
  private async sendTelegram(chatId: string, message: string): Promise<void> {
    try {
      // Implementação básica - em produção usar Bot API do Telegram
      console.log(`📱 Telegram enviado para ${chatId}:`);
      console.log(message);
      
      // Simular envio
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error('❌ Erro ao enviar Telegram:', error);
    }
  }

  /**
   * Envia notificação via Webhook
   */
  private async sendWebhook(url: string, trigger: AlertTrigger): Promise<void> {
    try {
      const payload = {
        alert: trigger.alert,
        currentValue: trigger.currentValue,
        triggeredAt: trigger.triggeredAt,
        message: trigger.message
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`🔗 Webhook enviado para ${url}`);
      
    } catch (error) {
      console.error('❌ Erro ao enviar webhook:', error);
    }
  }

  /**
   * Gera recomendação baseada no tipo de alerta
   */
  private getRecommendation(type: string, currentValue: number, targetValue: number): string {
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
   * Testa a conectividade dos canais configurados
   */
  async testConnections(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};

    if (this.config.email) {
      try {
        await this.sendEmail(this.config.email, 'Teste de conectividade - FII Analyzer');
        results.email = true;
      } catch {
        results.email = false;
      }
    }

    if (this.config.telegram) {
      try {
        await this.sendTelegram(this.config.telegram, 'Teste de conectividade - FII Analyzer');
        results.telegram = true;
      } catch {
        results.telegram = false;
      }
    }

    if (this.config.webhook) {
      try {
        await this.sendWebhook(this.config.webhook, {
          alert: { ticker: 'TEST', type: 'PRICE', condition: 'ABOVE', value: 0, active: true },
          currentValue: 0,
          triggeredAt: new Date(),
          message: 'Teste de conectividade'
        });
        results.webhook = true;
      } catch {
        results.webhook = false;
      }
    }

    return results;
  }
} 