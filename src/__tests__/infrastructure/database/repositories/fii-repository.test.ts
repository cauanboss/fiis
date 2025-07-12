import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { FIIRepository } from "../../../../infrastructure/database/repositories/fiiRepository";
import { PrismaClient } from "@prisma/client";
import { FII } from "../../../../domain/types/fii";

describe("FIIRepository", () => {
  let repository: FIIRepository;
  let prisma: PrismaClient;

  beforeEach(async () => {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: "file:./test.db"
        }
      }
    });
    repository = new FIIRepository(prisma);
    
    // Limpar banco de teste de forma segura
    try {
      await prisma.fIIAnalysis.deleteMany();
      await prisma.fIIHistory.deleteMany();
      await prisma.fII.deleteMany();
    } catch (error) {
      // Ignorar erros se as tabelas não existirem
      console.log("Tabelas não existem ainda, continuando...");
    }
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  describe("saveFiis", () => {
    it("should save FIIs to database", async () => {
      const mockFiis: FII[] = [
        {
          ticker: "HGLG11",
          name: "CSHG Logística",
          price: 150.50,
          dividendYield: 8.5,
          pvp: 0.95,
          lastDividend: 1.25,
          dividendYield12m: 8.5,
          priceVariation: 2.5,
          source: "Test",
          lastUpdate: new Date()
        }
      ];

      await repository.saveFiis(mockFiis);
      
      const savedFII = await prisma.fII.findUnique({
        where: { ticker: "HGLG11" }
      });

      expect(savedFII).toBeDefined();
      expect(savedFII?.ticker).toBe("HGLG11");
      expect(savedFII?.name).toBe("CSHG Logística");
      expect(savedFII?.price).toBe(150.50);
    });

    it("should update existing FIIs", async () => {
      // Criar FII inicial
      await prisma.fII.create({
        data: {
          ticker: "HGLG11",
          name: "CSHG Logística",
          price: 150.00,
          dividendYield: 8.0,
          pvp: 0.95,
          lastDividend: 1.20,
          dividendYield12m: 8.0,
          priceVariation: 2.0,
          source: "Test",
          lastUpdate: new Date()
        }
      });

      // Atualizar com novos dados
      const updatedFiis: FII[] = [
        {
          ticker: "HGLG11",
          name: "CSHG Logística Atualizado",
          price: 155.00,
          dividendYield: 8.5,
          pvp: 0.90,
          lastDividend: 1.30,
          dividendYield12m: 8.5,
          priceVariation: 3.0,
          source: "Test",
          lastUpdate: new Date()
        }
      ];

      await repository.saveFiis(updatedFiis);
      
      const updatedFII = await prisma.fII.findUnique({
        where: { ticker: "HGLG11" }
      });

      expect(updatedFII?.price).toBe(155.00);
      expect(updatedFII?.dividendYield).toBe(8.5);
      expect(updatedFII?.name).toBe("CSHG Logística Atualizado");
    });
  });

  describe("getFiis", () => {
    it("should return all FIIs", async () => {
      // Criar FIIs de teste
      await prisma.fII.createMany({
        data: [
          {
            ticker: "HGLG11",
            name: "CSHG Logística",
            price: 150.50,
            dividendYield: 8.5,
            pvp: 0.95,
            lastDividend: 1.25,
            dividendYield12m: 8.5,
            priceVariation: 2.5,
            source: "Test",
            lastUpdate: new Date()
          },
          {
            ticker: "XPML11",
            name: "XP Malls",
            price: 95.30,
            dividendYield: 6.2,
            pvp: 1.15,
            lastDividend: 0.85,
            dividendYield12m: 6.2,
            priceVariation: -1.2,
            source: "Test",
            lastUpdate: new Date()
          }
        ]
      });

      const fiis = await repository.getFiis();
      
      expect(fiis.length).toBe(2);
      expect(fiis[0].ticker).toBe("HGLG11");
      expect(fiis[1].ticker).toBe("XPML11");
    });

    it("should return empty array when no FIIs exist", async () => {
      const fiis = await repository.getFiis();
      expect(fiis).toEqual([]);
    });
  });

  describe("getFIIByTicker", () => {
    it("should return FII by ticker", async () => {
      await prisma.fII.create({
        data: {
          ticker: "HGLG11",
          name: "CSHG Logística",
          price: 150.50,
          dividendYield: 8.5,
          pvp: 0.95,
          lastDividend: 1.25,
          dividendYield12m: 8.5,
          priceVariation: 2.5,
          source: "Test",
          lastUpdate: new Date()
        }
      });

      const fii = await repository.getFIIByTicker("HGLG11");
      
      expect(fii).toBeDefined();
      expect(fii?.ticker).toBe("HGLG11");
      expect(fii?.name).toBe("CSHG Logística");
    });

    it("should return null for non-existent ticker", async () => {
      const fii = await repository.getFIIByTicker("INVALID");
      expect(fii).toBeNull();
    });
  });

  describe("saveFIIHistory", () => {
    it("should save FII history", async () => {
      // First create the FII record
      await prisma.fII.create({
        data: {
          ticker: "HGLG11",
          name: "CSHG Logística",
          price: 150.50,
          dividendYield: 8.5,
          pvp: 0.95,
          lastDividend: 1.25,
          dividendYield12m: 8.5,
          priceVariation: 2.5,
          source: "Test",
          lastUpdate: new Date()
        }
      });

      const mockFiis: FII[] = [
        {
          ticker: "HGLG11",
          name: "CSHG Logística",
          price: 150.50,
          dividendYield: 8.5,
          pvp: 0.95,
          lastDividend: 1.25,
          dividendYield12m: 8.5,
          priceVariation: 2.5,
          source: "Test",
          lastUpdate: new Date()
        }
      ];

      await repository.saveFIIHistory(mockFiis);
      
      const history = await prisma.fIIHistory.findMany({
        where: { ticker: "HGLG11" }
      });

      expect(history.length).toBe(1);
      expect(history[0].ticker).toBe("HGLG11");
      expect(history[0].price).toBe(150.50);
    });
  });

  describe("saveAnalyses", () => {
    it("should save FII analyses", async () => {
      // First create the FII record
      await prisma.fII.create({
        data: {
          ticker: "HGLG11",
          name: "CSHG Logística",
          price: 150.50,
          dividendYield: 8.5,
          pvp: 0.95,
          lastDividend: 1.25,
          dividendYield12m: 8.5,
          priceVariation: 2.5,
          source: "Test",
          lastUpdate: new Date()
        }
      });

      const mockAnalyses = [
        {
          ticker: "HGLG11",
          name: "CSHG Logística",
          price: 150.50,
          dividendYield: 8.5,
          pvp: 0.95,
          score: 0.85,
          rank: 1,
          recommendation: "BUY" as const,
          analysis: "Excelente oportunidade de investimento"
        }
      ];

      await repository.saveAnalyses(mockAnalyses);
      
      const analyses = await prisma.fIIAnalysis.findMany({
        where: { ticker: "HGLG11" }
      });

      expect(analyses.length).toBe(1);
      expect(analyses[0].ticker).toBe("HGLG11");
      expect(analyses[0].score).toBe(0.85);
      expect(analyses[0].recommendation).toBe("BUY");
    });
  });

  describe("getLatestAnalyses", () => {
    it("should return latest analyses", async () => {
      // First create the FII record
      await prisma.fII.create({
        data: {
          ticker: "HGLG11",
          name: "CSHG Logística",
          price: 150.50,
          dividendYield: 8.5,
          pvp: 0.95,
          lastDividend: 1.25,
          dividendYield12m: 8.5,
          priceVariation: 2.5,
          source: "Test",
          lastUpdate: new Date()
        }
      });

      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Criar análises com timestamps diferentes
      await prisma.fIIAnalysis.createMany({
        data: [
          {
            ticker: "HGLG11",
            name: "CSHG Logística",
            price: 150.50,
            dividendYield: 8.5,
            pvp: 0.95,
            score: 0.85,
            rank: 1,
            recommendation: "BUY",
            analysis: "Análise antiga",
            timestamp: yesterday
          },
          {
            ticker: "HGLG11",
            name: "CSHG Logística",
            price: 155.00,
            dividendYield: 8.8,
            pvp: 0.90,
            score: 0.88,
            rank: 1,
            recommendation: "BUY",
            analysis: "Análise recente",
            timestamp: now
          }
        ]
      });

      const latestAnalyses = await repository.getLatestAnalyses();
      
      expect(latestAnalyses.length).toBe(1);
      expect(latestAnalyses[0].ticker).toBe("HGLG11");
      expect(latestAnalyses[0].price).toBe(155.00); // Deve retornar a mais recente
    });
  });

  describe("getDatabaseStats", () => {
    it("should return correct database statistics", async () => {
      // Criar dados de teste
      await prisma.fII.createMany({
        data: [
          {
            ticker: "HGLG11",
            name: "CSHG Logística",
            price: 150.50,
            dividendYield: 8.5,
            pvp: 0.95,
            lastDividend: 1.25,
            dividendYield12m: 8.5,
            priceVariation: 2.5,
            source: "Test",
            lastUpdate: new Date()
          },
          {
            ticker: "XPML11",
            name: "XP Malls",
            price: 95.30,
            dividendYield: 6.2,
            pvp: 1.15,
            lastDividend: 0.85,
            dividendYield12m: 6.2,
            priceVariation: -1.2,
            source: "Test",
            lastUpdate: new Date()
          }
        ]
      });

      await prisma.fIIHistory.createMany({
        data: [
          {
            ticker: "HGLG11",
            price: 150.50,
            dividendYield: 8.5,
            pvp: 0.95,
            lastDividend: 1.25,
            source: "Test"
          }
        ]
      });

      await prisma.fIIAnalysis.createMany({
        data: [
          {
            ticker: "HGLG11",
            name: "CSHG Logística",
            price: 150.50,
            dividendYield: 8.5,
            pvp: 0.95,
            score: 0.85,
            rank: 1,
            recommendation: "BUY",
            analysis: "Análise"
          }
        ]
      });

      const stats = await repository.getDatabaseStats();
      
      expect(stats.totalFiis).toBe(2);
      expect(stats.totalHistoryRecords).toBe(1);
      expect(stats.totalAnalyses).toBe(1);
    });
  });
}); 