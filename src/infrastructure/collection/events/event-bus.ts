export type EventType = 
  | 'COLLECTION_STARTED'
  | 'COLLECTION_COMPLETED'
  | 'COLLECTION_FAILED'
  | 'ANALYSIS_STARTED'
  | 'ANALYSIS_COMPLETED'
  | 'ANALYSIS_FAILED'
  | 'ALERT_CHECK_STARTED'
  | 'ALERT_CHECK_COMPLETED'
  | 'ALERT_TRIGGERED'
  | 'WORKER_JOB_STARTED'
  | 'WORKER_JOB_COMPLETED'
  | 'WORKER_JOB_FAILED';

export interface Event {
  id: string;
  type: EventType;
  timestamp: Date;
  data?: any;
  source: string;
}

export interface EventHandler {
  (event: Event): void | Promise<void>;
}

export class EventBus {
  private handlers: Map<EventType, EventHandler[]> = new Map();
  private events: Event[] = [];

  /**
   * Registra um handler para um tipo de evento
   */
  subscribe(eventType: EventType, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  /**
   * Remove um handler
   */
  unsubscribe(eventType: EventType, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Publica um evento
   */
  async publish(event: Omit<Event, 'id' | 'timestamp'>): Promise<void> {
    const fullEvent: Event = {
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    // Armazenar evento
    this.events.push(fullEvent);

    // Notificar handlers
    const handlers = this.handlers.get(event.type) || [];
    const promises = handlers.map(handler => {
      try {
        return handler(fullEvent);
      } catch (error) {
        console.error(`Erro no handler para evento ${event.type}:`, error);
      }
    });

    await Promise.allSettled(promises);

    console.log(`📡 Evento publicado: ${event.type} (${handlers.length} handlers)`);
  }

  /**
   * Retorna eventos recentes
   */
  getRecentEvents(limit: number = 50): Event[] {
    return this.events.slice(-limit);
  }

  /**
   * Retorna eventos por tipo
   */
  getEventsByType(type: EventType): Event[] {
    return this.events.filter(event => event.type === type);
  }

  /**
   * Limpa eventos antigos
   */
  clearOldEvents(olderThanHours: number = 24): void {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    this.events = this.events.filter(event => event.timestamp > cutoffTime);
    console.log(`🧹 Eventos antigos removidos (mais de ${olderThanHours}h)`);
  }

  /**
   * Retorna estatísticas dos eventos
   */
  getEventStats(): {
    totalEvents: number;
    eventsByType: { [key: string]: number };
    handlersByType: { [key: string]: number };
  } {
    const eventsByType: { [key: string]: number } = {};
    const handlersByType: { [key: string]: number } = {};

    // Contar eventos por tipo
    this.events.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    });

    // Contar handlers por tipo
    this.handlers.forEach((handlers, type) => {
      handlersByType[type] = handlers.length;
    });

    return {
      totalEvents: this.events.length,
      eventsByType,
      handlersByType
    };
  }
}

// Instância global do EventBus
export const eventBus = new EventBus(); 