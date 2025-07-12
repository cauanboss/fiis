export class Ticker {
    private readonly value: string;

    constructor(value: string) {
        if (!this.isValid(value)) {
            throw new Error(`Ticker inválido: ${value}`);
        }
        this.value = value.toUpperCase();
    }

    private isValid(ticker: string): boolean {
        return /^[A-Z]{4}\d{2}$/.test(ticker.toUpperCase());
    }

    getValue(): string {
        return this.value;
    }

    toString(): string {
        return this.value;
    }

    equals(other: Ticker): boolean {
        return this.value === other.value;
    }
} 