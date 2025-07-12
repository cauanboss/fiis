import { EventBusInterface } from '../../domain/interfaces/event-bus.interface.js';

type EventHandler = (data: unknown) => void;

export class EventBus implements EventBusInterface {
    private handlers: Map<string, EventHandler[]> = new Map();

    subscribe(event: string, handler: EventHandler): void {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, []);
        }
        this.handlers.get(event)!.push(handler);
    }

    publish(event: string, data: unknown): void {
        const handlers = this.handlers.get(event) || [];
        handlers.forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error(`❌ Erro no handler do evento ${event}:`, error);
            }
        });
    }

    unsubscribe(event: string, handler: EventHandler): void {
        const handlers = this.handlers.get(event);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    getHandlerCount(event: string): number {
        return this.handlers.get(event)?.length || 0;
    }

    getRegisteredEvents(): string[] {
        return Array.from(this.handlers.keys());
    }

    clear(): void {
        this.handlers.clear();
    }
} 