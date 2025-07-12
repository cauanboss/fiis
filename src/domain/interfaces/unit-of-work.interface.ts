import { FIIRepositoryInterface } from '../repositories/fii-repository.interface.js';
import { AlertRepositoryInterface } from '../repositories/alert-repository.interface.js';

export interface UnitOfWorkInterface {
    fiiRepository: FIIRepositoryInterface;
    alertRepository: AlertRepositoryInterface;

    beginTransaction(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    isInTransaction(): boolean;
} 