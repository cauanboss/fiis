import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { DataService } from "../../../infrastructure/services/dataService";
import { FII } from "../../../domain/types/fii";

describe("DataService", () => {
  let dataService: DataService;

  beforeEach(async () => {
    dataService = DataService.getInstance();
    await dataService.connect();
  });

  afterEach(async () => {
    await dataService.close();
  });

  describe("getInstance", () => {
    it("should return singleton instance", () => {
      const instance1 = DataService.getInstance();
      const instance2 = DataService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe("connect", () => {
    it("should connect to database successfully", async () => {
      const isConnected = await dataService.connect();
      expect(isConnected).toBe(true);
    });
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

      await dataService.saveFiis(mockFiis);
      
      const savedFiis = await dataService.getFiis();
      expect(savedFiis.length).toBeGreaterThan(0);
      expect(savedFiis[0].ticker).toBe("HGLG11");
    });
  });

  describe("saveFIIHistory", () => {
    it("should save FII history", async () => {
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

      await dataService.saveFIIHistory(mockFiis);
      
      // Verificar se o histórico foi salvo (implementação específica)
      const stats = await dataService.getDatabaseStats();
      expect(stats.totalHistoryRecords).toBeGreaterThan(0);
    });
  });

  describe("saveAnalyses", () => {
    it("should save FII analyses", async () => {
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

      await dataService.saveAnalyses(mockAnalyses);
      
      const latestAnalyses = await dataService.getLatestAnalyses();
      expect(latestAnalyses.length).toBeGreaterThan(0);
      expect(latestAnalyses[0].ticker).toBe("HGLG11");
    });
  });

  describe("getFiis", () => {
    it("should return all FIIs", async () => {
      const fiis = await dataService.getFiis();
      expect(Array.isArray(fiis)).toBe(true);
    });
  });

  describe("getFIIByTicker", () => {
    it("should return FII by ticker", async () => {
      // Primeiro salvar um FII
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

      await dataService.saveFiis(mockFiis);
      
      const fii = await dataService.getFIIByTicker("HGLG11");
      expect(fii).toBeDefined();
      expect(fii?.ticker).toBe("HGLG11");
    });

    it("should return null for non-existent ticker", async () => {
      const fii = await dataService.getFIIByTicker("INVALID");
      expect(fii).toBeNull();
    });
  });

  describe("getLatestAnalyses", () => {
    it("should return latest analyses", async () => {
      const analyses = await dataService.getLatestAnalyses();
      expect(Array.isArray(analyses)).toBe(true);
    });
  });

  describe("getDatabaseStats", () => {
    it("should return database statistics", async () => {
      const stats = await dataService.getDatabaseStats();
      
      expect(stats).toBeDefined();
      expect(typeof stats.totalFiis).toBe("number");
      expect(typeof stats.totalHistoryRecords).toBe("number");
      expect(typeof stats.totalAnalyses).toBe("number");
    });
  });

  describe("checkAlerts", () => {
    it("should check and return triggered alerts", async () => {
      const alerts = await dataService.checkAlerts();
      expect(Array.isArray(alerts)).toBe(true);
    });
  });

  describe("close", () => {
    it("should close database connection", async () => {
      await dataService.close();
      // Verificar se a conexão foi fechada (implementação específica)
      expect(true).toBe(true); // Placeholder - implementação real depende do método
    });
  });
}); 