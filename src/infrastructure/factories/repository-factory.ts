import { PrismaClient } from '@prisma/client';
import { FIIRepositoryInterface } from '../../domain/repositories/fii-repository.interface.js';
import { AlertRepositoryInterface } from '../../domain/repositories/alert-repository.interface.js';
import { FIIRepository } from '../repository/fiiRepository.js';
import { AlertRepository } from '../repository/alertRepository.js';

export class RepositoryFactory {
    private static prisma: PrismaClient | null = null;

    private static getPrisma(): PrismaClient {
        if (!this.prisma) {
            this.prisma = new PrismaClient();
        }
        return this.prisma;
    }

    static createFIIRepository(): FIIRepositoryInterface {
        return new FIIRepository(this.getPrisma());
    }

    static createAlertRepository(): AlertRepositoryInterface {
        return new AlertRepository(this.getPrisma());
    }

    static async disconnect(): Promise<void> {
        if (this.prisma) {
            await this.prisma.$disconnect();
            this.prisma = null;
        }
    }

    static getPrismaClient(): PrismaClient {
        return this.getPrisma();
    }
} 