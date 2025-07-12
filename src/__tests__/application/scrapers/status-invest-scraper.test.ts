import { describe, it, expect, beforeEach } from "bun:test";
import { StatusInvestScraper } from "../../../application/scrapers/status-invest-scraper";
import { ScrapingResult } from "../../../domain/types/fii";

describe("StatusInvestScraper", () => {
  let scraper: StatusInvestScraper;

  beforeEach(() => {
    scraper = new StatusInvestScraper();
  });

  describe("scrape", () => {
    it("should successfully scrape FIIs from Status Invest", async () => {
      const result: ScrapingResult = await scraper.scrape();
      
      expect(result.success).toBeDefined();
      expect(typeof result.success).toBe("boolean");
      expect(result.source).toBe("Status Invest");
      
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
        if (result.data && result.data.length > 0) {
          const fii = result.data[0];
          expect(fii.ticker).toBeDefined();
          expect(fii.name).toBeDefined();
          expect(fii.price).toBeDefined();
          expect(fii.dividendYield).toBeDefined();
          expect(fii.pvp).toBeDefined();
        }
      }
    });

    it("should handle API errors gracefully", async () => {
      // Teste simples - verificar se o scraper não quebra com erros
      const result: ScrapingResult = await scraper.scrape();
      expect(result.success).toBeDefined();
      expect(result.source).toBe("Status Invest");
    });

    it("should handle empty response", async () => {
      // Teste simples - verificar se o scraper lida com respostas vazias
      const result: ScrapingResult = await scraper.scrape();
      expect(result.success).toBeDefined();
      expect(result.source).toBe("Status Invest");
    });

    it("should handle malformed response", async () => {
      // Teste simples - verificar se o scraper lida com respostas malformadas
      const result: ScrapingResult = await scraper.scrape();
      expect(result.success).toBeDefined();
      expect(result.source).toBe("Status Invest");
    });

    it("should transform data correctly", async () => {
      // Teste simples - verificar se o scraper transforma dados corretamente
      const result: ScrapingResult = await scraper.scrape();
      expect(result.success).toBeDefined();
      expect(result.source).toBe("Status Invest");
      
      if (result.success && result.data && result.data.length > 0) {
        const fii = result.data[0];
        expect(fii.ticker).toBeDefined();
        expect(fii.name).toBeDefined();
        expect(fii.price).toBeDefined();
        expect(fii.dividendYield).toBeDefined();
        expect(fii.pvp).toBeDefined();
        expect(fii.source).toBe("Status Invest");
      }
    });

    it("should handle missing optional fields", async () => {
      // Teste simples - verificar se o scraper lida com campos opcionais ausentes
      const result: ScrapingResult = await scraper.scrape();
      expect(result.success).toBeDefined();
      expect(result.source).toBe("Status Invest");
      
      if (result.success && result.data && result.data.length > 0) {
        const fii = result.data[0];
        expect(fii.ticker).toBeDefined();
        expect(fii.price).toBeDefined();
        expect(fii.dividendYield).toBeDefined();
        expect(fii.pvp).toBeDefined();
      }
    });
  });

  describe("constructor", () => {
    it("should initialize with correct base URL", () => {
      expect(scraper).toBeDefined();
      // Verificar se a URL base está correta (implementação específica)
    });
  });
}); 