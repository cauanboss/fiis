export interface DomainEvent {
    occurredOn: Date;
    eventName: string;
}

export class FIICollectedEvent implements DomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName = 'FII_COLLECTED';

    constructor(
        public readonly ticker: string,
        public readonly source: string,
        public readonly price: number,
        public readonly dividendYield: number
    ) {
        this.occurredOn = new Date();
    }
}

export class FIIAnalyzedEvent implements DomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName = 'FII_ANALYZED';

    constructor(
        public readonly ticker: string,
        public readonly score: number,
        public readonly recommendation: 'BUY' | 'HOLD' | 'SELL'
    ) {
        this.occurredOn = new Date();
    }
}

export class AlertTriggeredEvent implements DomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName = 'ALERT_TRIGGERED';

    constructor(
        public readonly alertId: string,
        public readonly ticker: string,
        public readonly type: string,
        public readonly currentValue: number,
        public readonly thresholdValue: number
    ) {
        this.occurredOn = new Date();
    }
}

export class AnalysisCompletedEvent implements DomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName = 'ANALYSIS_COMPLETED';

    constructor(
        public readonly totalAnalyzed: number,
        public readonly buyCount: number,
        public readonly holdCount: number,
        public readonly sellCount: number
    ) {
        this.occurredOn = new Date();
    }
} 