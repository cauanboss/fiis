import { PrismaClient } from '@prisma/client';

export class Database {
  private static instance: Database;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'mongodb://localhost:27017/fiis'
        }
      },
      log: ['error', 'warn'],
      errorFormat: 'pretty'
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
      // Use a simple query instead of raw SQL for MongoDB
      await this.prisma.fII.findFirst();
      return true;
    } catch (error) {
      console.error('❌ Health check falhou:', error);
      return false;
    }
  }
} 