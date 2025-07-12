import { describe, it, expect } from "bun:test";
import { DisplayUtils } from "../../../domain/utils/display";
import { FIIAnalysis } from "../../../domain/types/fii";

describe("DisplayUtils", () => {
  describe("formatCurrency", () => {
    it("should format currency correctly", () => {
      expect(DisplayUtils.formatCurrency(150.50)).toContain("R$");
      expect(DisplayUtils.formatCurrency(150.50)).toContain("150,50");
      expect(DisplayUtils.formatCurrency(0)).toContain("R$");
      expect(DisplayUtils.formatCurrency(0)).toContain("0,00");
      expect(DisplayUtils.formatCurrency(1000)).toContain("R$");
      expect(DisplayUtils.formatCurrency(1000)).toContain("1.000,00");
      expect(DisplayUtils.formatCurrency(1234.56)).toContain("R$");
      expect(DisplayUtils.formatCurrency(1234.56)).toContain("1.234,56");
    });

    it("should handle negative values", () => {
      expect(DisplayUtils.formatCurrency(-150.50)).toContain("-R$");
      expect(DisplayUtils.formatCurrency(-150.50)).toContain("150,50");
    });
  });

  describe("formatPercentage", () => {
    it("should format percentage correctly", () => {
      expect(DisplayUtils.formatPercentage(8.5)).toBe("8,50%");
      expect(DisplayUtils.formatPercentage(0)).toBe("0,00%");
      expect(DisplayUtils.formatPercentage(15.75)).toBe("15,75%");
    });

    it("should handle negative percentages", () => {
      expect(DisplayUtils.formatPercentage(-2.5)).toBe("-2,50%");
    });
  });

  describe("formatNumber", () => {
    it("should format numbers correctly", () => {
      expect(DisplayUtils.formatNumber(150.50)).toBe("150,50");
      expect(DisplayUtils.formatNumber(0)).toBe("0,00");
      expect(DisplayUtils.formatNumber(1000)).toBe("1.000,00");
    });

    it("should handle decimals", () => {
      expect(DisplayUtils.formatNumber(0.95)).toBe("0,95");
      expect(DisplayUtils.formatNumber(1.234)).toBe("1,23");
    });
  });

  describe("getRecommendationColor", () => {
    it("should return correct colors for recommendations", () => {
      expect(DisplayUtils.getRecommendationColor("BUY")).toBe("green");
      expect(DisplayUtils.getRecommendationColor("HOLD")).toBe("yellow");
      expect(DisplayUtils.getRecommendationColor("SELL")).toBe("red");
    });

    it("should handle invalid recommendations", () => {
      expect(DisplayUtils.getRecommendationColor("INVALID")).toBe("white");
    });
  });

  describe("getRecommendationEmoji", () => {
    it("should return correct emojis for recommendations", () => {
      expect(DisplayUtils.getRecommendationEmoji("BUY")).toBe("🟢");
      expect(DisplayUtils.getRecommendationEmoji("HOLD")).toBe("🟡");
      expect(DisplayUtils.getRecommendationEmoji("SELL")).toBe("🔴");
    });

    it("should handle invalid recommendations", () => {
      expect(DisplayUtils.getRecommendationEmoji("INVALID")).toBe("⚪");
    });
  });

  describe("displayTopFiis", () => {
    it("should display FIIs correctly", () => {
      const mockAnalyses: FIIAnalysis[] = [
        {
          ticker: "HGLG11",
          name: "CSHG Logística",
          price: 150.50,
          dividendYield: 8.5,
          pvp: 0.95,
          score: 0.85,
          rank: 1,
          recommendation: "BUY",
          analysis: "Excelente oportunidade"
        },
        {
          ticker: "XPML11",
          name: "XP Malls",
          price: 95.30,
          dividendYield: 6.2,
          pvp: 1.15,
          score: 0.65,
          rank: 2,
          recommendation: "HOLD",
          analysis: "Oportunidade moderada"
        }
      ];

      // Testar se a função executa sem erro
      expect(() => {
        DisplayUtils.displayTopFiis(mockAnalyses);
      }).not.toThrow();
    });

    it("should handle empty array", () => {
      expect(() => {
        DisplayUtils.displayTopFiis([]);
      }).not.toThrow();
    });
  });

  describe("displayFIIAnalysis", () => {
    it("should display single FII analysis correctly", () => {
      const mockAnalysis: FIIAnalysis = {
        ticker: "HGLG11",
        name: "CSHG Logística",
        price: 150.50,
        dividendYield: 8.5,
        pvp: 0.95,
        score: 0.85,
        rank: 1,
        recommendation: "BUY",
        analysis: "Excelente oportunidade de investimento"
      };

      expect(() => {
        DisplayUtils.displayFIIAnalysis(mockAnalysis);
      }).not.toThrow();
    });
  });

  describe("displaySummary", () => {
    it("should display summary correctly", () => {
      const mockAnalyses: FIIAnalysis[] = [
        {
          ticker: "HGLG11",
          name: "CSHG Logística",
          price: 150.50,
          dividendYield: 8.5,
          pvp: 0.95,
          score: 0.85,
          rank: 1,
          recommendation: "BUY",
          analysis: "Excelente oportunidade"
        },
        {
          ticker: "XPML11",
          name: "XP Malls",
          price: 95.30,
          dividendYield: 6.2,
          pvp: 1.15,
          score: 0.65,
          rank: 2,
          recommendation: "HOLD",
          analysis: "Oportunidade moderada"
        }
      ];

      expect(() => {
        DisplayUtils.displaySummary(mockAnalyses);
      }).not.toThrow();
    });
  });

  describe("displayBuyRecommendations", () => {
    it("should display only BUY recommendations", () => {
      const mockAnalyses: FIIAnalysis[] = [
        {
          ticker: "HGLG11",
          name: "CSHG Logística",
          price: 150.50,
          dividendYield: 8.5,
          pvp: 0.95,
          score: 0.85,
          rank: 1,
          recommendation: "BUY",
          analysis: "Excelente oportunidade"
        },
        {
          ticker: "XPML11",
          name: "XP Malls",
          price: 95.30,
          dividendYield: 6.2,
          pvp: 1.15,
          score: 0.65,
          rank: 2,
          recommendation: "HOLD",
          analysis: "Oportunidade moderada"
        }
      ];

      expect(() => {
        DisplayUtils.displayBuyRecommendations(mockAnalyses);
      }).not.toThrow();
    });
  });

  describe("displayHoldRecommendations", () => {
    it("should display only HOLD recommendations", () => {
      const mockAnalyses: FIIAnalysis[] = [
        {
          ticker: "HGLG11",
          name: "CSHG Logística",
          price: 150.50,
          dividendYield: 8.5,
          pvp: 0.95,
          score: 0.85,
          rank: 1,
          recommendation: "BUY",
          analysis: "Excelente oportunidade"
        },
        {
          ticker: "XPML11",
          name: "XP Malls",
          price: 95.30,
          dividendYield: 6.2,
          pvp: 1.15,
          score: 0.65,
          rank: 2,
          recommendation: "HOLD",
          analysis: "Oportunidade moderada"
        }
      ];

      expect(() => {
        DisplayUtils.displayHoldRecommendations(mockAnalyses);
      }).not.toThrow();
    });
  });

  describe("displaySellRecommendations", () => {
    it("should display only SELL recommendations", () => {
      const mockAnalyses: FIIAnalysis[] = [
        {
          ticker: "HGLG11",
          name: "CSHG Logística",
          price: 150.50,
          dividendYield: 8.5,
          pvp: 0.95,
          score: 0.85,
          rank: 1,
          recommendation: "BUY",
          analysis: "Excelente oportunidade"
        },
        {
          ticker: "BADS11",
          name: "Bad FII",
          price: 10.50,
          dividendYield: 4.0,
          pvp: 1.50,
          score: 0.25,
          rank: 3,
          recommendation: "SELL",
          analysis: "Evitar investimento"
        }
      ];

      expect(() => {
        DisplayUtils.displaySellRecommendations(mockAnalyses);
      }).not.toThrow();
    });
  });
}); 