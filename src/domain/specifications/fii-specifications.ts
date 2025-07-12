import { FII } from '../types/fii.js';

export interface Specification<T> {
    isSatisfiedBy(item: T): boolean;
    and(other: Specification<T>): Specification<T>;
    or(other: Specification<T>): Specification<T>;
    not(): Specification<T>;
}

export abstract class AbstractSpecification<T> implements Specification<T> {
    abstract isSatisfiedBy(item: T): boolean;

    and(other: Specification<T>): Specification<T> {
        return new AndSpecification(this, other);
    }

    or(other: Specification<T>): Specification<T> {
        return new OrSpecification(this, other);
    }

    not(): Specification<T> {
        return new NotSpecification(this);
    }
}

class AndSpecification<T> extends AbstractSpecification<T> {
    constructor(
        private left: Specification<T>,
        private right: Specification<T>
    ) {
        super();
    }

    isSatisfiedBy(item: T): boolean {
        return this.left.isSatisfiedBy(item) && this.right.isSatisfiedBy(item);
    }
}

class OrSpecification<T> extends AbstractSpecification<T> {
    constructor(
        private left: Specification<T>,
        private right: Specification<T>
    ) {
        super();
    }

    isSatisfiedBy(item: T): boolean {
        return this.left.isSatisfiedBy(item) || this.right.isSatisfiedBy(item);
    }
}

class NotSpecification<T> extends AbstractSpecification<T> {
    constructor(private specification: Specification<T>) {
        super();
    }

    isSatisfiedBy(item: T): boolean {
        return !this.specification.isSatisfiedBy(item);
    }
}

// Specifications específicas para FIIs
export class HighDividendYieldSpecification extends AbstractSpecification<FII> {
    constructor(private minYield: number = 6.0) {
        super();
    }

    isSatisfiedBy(fii: FII): boolean {
        return fii.dividendYield >= this.minYield;
    }
}

export class LowPVPSpecification extends AbstractSpecification<FII> {
    constructor(private maxPVP: number = 1.2) {
        super();
    }

    isSatisfiedBy(fii: FII): boolean {
        return fii.pvp <= this.maxPVP;
    }
}

export class PriceRangeSpecification extends AbstractSpecification<FII> {
    constructor(
        private minPrice: number = 5.0,
        private maxPrice: number = 1000.0
    ) {
        super();
    }

    isSatisfiedBy(fii: FII): boolean {
        return fii.price >= this.minPrice && fii.price <= this.maxPrice;
    }
}

export class BuyRecommendationSpecification extends AbstractSpecification<FII> {
    isSatisfiedBy(fii: FII): boolean {
        const highYield = new HighDividendYieldSpecification(6.0);
        const lowPVP = new LowPVPSpecification(1.2);
        const priceRange = new PriceRangeSpecification(5.0, 1000.0);

        return highYield.and(lowPVP).and(priceRange).isSatisfiedBy(fii);
    }
} 