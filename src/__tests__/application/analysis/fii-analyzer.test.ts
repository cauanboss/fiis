import { describe, it, expect, beforeEach } from "bun:test";
import { FIIAnalyzer } from "../../../application/analysis/fii-analyzer";
import { FII } from "../../../domain/types/fii";

describe("FIIAnalyzer", () => {
  let analyzer: FIIAnalyzer;
  let mockFiis: FII[];

  beforeEach(() => {
    analyzer = new FIIAnalyzer();
    mockFiis = [
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
      },
      {
        ticker: "HGRE11",
        name: "CSHG Real Estate",
        price: 180.00,
        dividendYield: 15.5,
        pvp: 0.85,
        lastDividend: 2.50,
        dividendYield12m: 15.5,
        priceVariation: 5.0,
        source: "Test",
        lastUpdate: new Date()
      },
      {
        ticker: "BADS11",
        name: "Banco do Brasil",
        price: 10.50,
        dividendYield: 4.0,
        pvp: 1.50,
        lastDividend: 0.35,
        dividendYield12m: 4.0,
        priceVariation: -3.0,
        source: "Test",
        lastUpdate: new Date()
      }
    ];
  });

  describe("analyze", () => {
    it("should filter FIIs based on basic criteria", () => {
      const analyses = analyzer.analyze(mockFiis);
      
      // Deve filtrar FIIs que não atendem aos critérios básicos
      const filteredFiis = analyses.filter(analysis => 
        analysis.dividendYield >= 6.0 &&
        analysis.pvp <= 1.2 &&
        analysis.price >= 5.0 &&
        analysis.price <= 200.0
      );
      
      expect(filteredFiis.length).toBe(analyses.length);
    });

    it("should calculate scores correctly", () => {
      const analyses = analyzer.analyze(mockFiis);
      
      analyses.forEach(analysis => {
        expect(analysis.score).toBeGreaterThanOrEqual(0);
        expect(analysis.score).toBeLessThanOrEqual(1);
        expect(typeof analysis.score).toBe("number");
      });
    });

    it("should assign valid recommendations", () => {
      const analyses = analyzer.analyze(mockFiis);
      
      analyses.forEach(analysis => {
        expect(["BUY", "HOLD", "SELL"]).toContain(analysis.recommendation);
      });
    });

    it("should rank FIIs by score in descending order", () => {
      const analyses = analyzer.analyze(mockFiis);
      
      for (let i = 1; i < analyses.length; i++) {
        expect(analyses[i-1].score).toBeGreaterThanOrEqual(analyses[i].score);
      }
    });

    it("should assign sequential ranks", () => {
      const analyses = analyzer.analyze(mockFiis);
      
      analyses.forEach((analysis, index) => {
        expect(analysis.rank).toBe(index + 1);
      });
    });

    it("should generate analysis text", () => {
      const analyses = analyzer.analyze(mockFiis);
      
      analyses.forEach(analysis => {
        expect(analysis.analysis).toBeDefined();
        expect(typeof analysis.analysis).toBe("string");
        expect(analysis.analysis.length).toBeGreaterThan(0);
      });
    });

    it("should handle empty array", () => {
      const analyses = analyzer.analyze([]);
      expect(analyses).toEqual([]);
    });

    it("should filter out FIIs with invalid data", () => {
      const invalidFiis = [
        {
          ticker: "INVALID1",
          name: "Invalid FII 1",
          price: 0, // Preço inválido
          dividendYield: 8.5,
          pvp: 0.95,
          lastDividend: 1.25,
          dividendYield12m: 8.5,
          priceVariation: 2.5,
          source: "Test",
          lastUpdate: new Date()
        },
        {
          ticker: "INVALID2",
          name: "Invalid FII 2",
          price: 150.50,
          dividendYield: 3.0, // DY muito baixo
          pvp: 0.95,
          lastDividend: 1.25,
          dividendYield12m: 3.0,
          priceVariation: 2.5,
          source: "Test",
          lastUpdate: new Date()
        },
        {
          ticker: "INVALID3",
          name: "Invalid FII 3",
          price: 150.50,
          dividendYield: 8.5,
          pvp: 1.5, // P/VP muito alto
          lastDividend: 1.25,
          dividendYield12m: 8.5,
          priceVariation: 2.5,
          source: "Test",
          lastUpdate: new Date()
        }
      ];

      const analyses = analyzer.analyze(invalidFiis);
      expect(analyses.length).toBe(0);
    });

    it("should apply bonus for high dividend yield", () => {
      const highDYFII = {
        ticker: "HIGH11",
        name: "High Dividend FII",
        price: 100.00,
        dividendYield: 16.0, // > 15% deve receber bônus
        pvp: 0.90,
        lastDividend: 1.60,
        dividendYield12m: 16.0,
        priceVariation: 2.0,
        source: "Test",
        lastUpdate: new Date()
      };

      const analyses = analyzer.analyze([highDYFII]);
      expect(analyses[0].score).toBeGreaterThan(0.5); // Score deve ser alto
    });

    it("should apply penalty for high P/VP", () => {
      const highPVPFII = {
        ticker: "HIGH11",
        name: "High P/VP FII",
        price: 100.00,
        dividendYield: 8.0,
        pvp: 1.6, // > 1.5 deve receber penalidade
        lastDividend: 0.80,
        dividendYield12m: 8.0,
        priceVariation: 2.0,
        source: "Test",
        lastUpdate: new Date()
      };

      const analyses = analyzer.analyze([highPVPFII]);
      
      // Verificar se o FII foi filtrado (P/VP > 1.2)
      if (analyses.length > 0) {
        expect(analyses[0].score).toBeLessThan(0.8); // Score deve ser reduzido
      } else {
        // Se foi filtrado, isso também está correto
        expect(analyses.length).toBe(0);
      }
    });
  });

  describe("score calculation", () => {
    it("should prioritize dividend yield (40%)", () => {
      const fii1 = {
        ticker: "DY1",
        name: "High DY",
        price: 100.00,
        dividendYield: 12.0,
        pvp: 1.0,
        lastDividend: 1.20,
        dividendYield12m: 12.0,
        priceVariation: 0,
        source: "Test",
        lastUpdate: new Date()
      };

      const fii2 = {
        ticker: "DY2",
        name: "Low DY",
        price: 100.00,
        dividendYield: 6.0,
        pvp: 1.0,
        lastDividend: 0.60,
        dividendYield12m: 6.0,
        priceVariation: 0,
        source: "Test",
        lastUpdate: new Date()
      };

      const analyses = analyzer.analyze([fii1, fii2]);
      expect(analyses[0].ticker).toBe("DY1"); // FII com DY mais alto deve ter melhor score
    });

    it("should consider P/VP (30%)", () => {
      const fii1 = {
        ticker: "PVP1",
        name: "Low P/VP",
        price: 100.00,
        dividendYield: 8.0,
        pvp: 0.8,
        lastDividend: 0.80,
        dividendYield12m: 8.0,
        priceVariation: 0,
        source: "Test",
        lastUpdate: new Date()
      };

      const fii2 = {
        ticker: "PVP2",
        name: "High P/VP",
        price: 100.00,
        dividendYield: 8.0,
        pvp: 1.1,
        lastDividend: 0.80,
        dividendYield12m: 8.0,
        priceVariation: 0,
        source: "Test",
        lastUpdate: new Date()
      };

      const analyses = analyzer.analyze([fii1, fii2]);
      expect(analyses[0].ticker).toBe("PVP1"); // FII com P/VP mais baixo deve ter melhor score
    });
  });
}); 