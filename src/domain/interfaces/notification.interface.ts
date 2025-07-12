import { AlertTrigger } from '../types/fii.js';

export interface NotificationServiceInterface {
    sendEmail(to: string, subject: string, body: string): Promise<void>;
    sendTelegram(chatId: string, message: string): Promise<void>;
    sendWebhook(url: string, data: unknown): Promise<void>;
    sendAlertNotification(trigger: AlertTrigger): Promise<void>;
} 