export interface EventBusInterface {
    subscribe(event: string, handler: (data: unknown) => void): void;
    publish(event: string, data: unknown): void;
    unsubscribe(event: string, handler: (data: unknown) => void): void;
} 