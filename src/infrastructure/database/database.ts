import { PrismaClient } from '@prisma/client';

export class Database {
  private static instance: Database;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'file:./src/infrastructure/database/data/fiis.db'
        }
      }
    });
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  getClient(): PrismaClient {
    return this.prisma;
  }

  async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      console.log('✅ Conectado ao banco de dados');
    } catch (error) {
      console.error('❌ Erro ao conectar ao banco:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
    console.log('🔌 Desconectado do banco de dados');
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('❌ Health check falhou:', error);
      return false;
    }
  }
} 