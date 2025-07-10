import { FII, FIIAnalysis, AnalysisConfig } from '../domain/types/fii.js';

export class FIIAnalyzer {
  private defaultConfig: AnalysisConfig = {
    minDividendYield: 6.0,
    maxPVP: 1.2,
    minPrice: 5.0,
    maxPrice: 200.0,
    weightDividendYield: 0.4,
    weightPVP: 0.3,
    weightPrice: 0.2,
    weightLiquidity: 0.1
  };

  analyze(fiis: FII[], config?: Partial<AnalysisConfig>): FIIAnalysis[] {
    const analysisConfig = { ...this.defaultConfig, ...config };
    
    // Filtrar FIIs que atendem aos critérios básicos
    const filteredFiis = fiis.filter(fii => 
      fii.dividendYield >= analysisConfig.minDividendYield &&
      fii.pvp <= analysisConfig.maxPVP &&
      fii.price >= analysisConfig.minPrice &&
      fii.price <= analysisConfig.maxPrice &&
      fii.price > 0
    );

    // Calcular scores para cada FII
    const analyses = filteredFiis.map(fii => {
      const score = this.calculateScore(fii, analysisConfig);
      const recommendation = this.getRecommendation(score);
      const analysis = this.generateAnalysis(fii, score);

      return {
        ticker: fii.ticker,
        name: fii.name,
        price: fii.price,
        dividendYield: fii.dividendYield,
        pvp: fii.pvp,
        score: score,
        rank: 0, // Será definido depois
        recommendation: recommendation,
        analysis: analysis
      };
    });

    // Ordenar por score e definir ranking
    analyses.sort((a, b) => b.score - a.score);
    analyses.forEach((analysis, index) => {
      analysis.rank = index + 1;
    });

    return analyses;
  }

  private calculateScore(fii: FII, config: AnalysisConfig): number {
    let score = 0;

    // Score baseado no Dividend Yield (0-1)
    const dyScore = Math.min(fii.dividendYield / 20, 1); // Máximo 20% = score 1
    score += dyScore * config.weightDividendYield;

    // Score baseado no P/VP (0-1)
    const pvpScore = Math.max(0, 1 - (fii.pvp - 0.5) / 0.5); // P/VP 0.5 = score 1
    score += pvpScore * config.weightPVP;

    // Score baseado no preço (0-1)
    const priceScore = Math.max(0, 1 - Math.abs(fii.price - 50) / 50); // Preço R$50 = score 1
    score += priceScore * config.weightPrice;

    // Score baseado na liquidez (se disponível)
    const liquidityScore = this.calculateLiquidityScore(fii);
    score += liquidityScore * config.weightLiquidity;

    // Bônus para FIIs com DY muito alto
    if (fii.dividendYield > 15) {
      score += 0.1;
    }

    // Penalidade para FIIs com P/VP muito alto
    if (fii.pvp > 1.5) {
      score -= 0.1;
    }

    return Math.max(0, Math.min(1, score));
  }

  private calculateLiquidityScore(fii: FII): number {
    // Implementação básica - pode ser expandida com dados reais de liquidez
    if (fii.price > 100) return 0.8; // FIIs caros tendem a ter mais liquidez
    if (fii.price > 50) return 0.6;
    if (fii.price > 20) return 0.4;
    return 0.2;
  }

  private getRecommendation(score: number): 'BUY' | 'HOLD' | 'SELL' {
    if (score >= 0.7) return 'BUY';
    if (score >= 0.4) return 'HOLD';
    return 'SELL';
  }

  private generateAnalysis(fii: FII, score: number): string {
    const analysis = [];

    // Análise do Dividend Yield
    if (fii.dividendYield > 15) {
      analysis.push(`DY excepcional de ${fii.dividendYield.toFixed(2)}%`);
    } else if (fii.dividendYield > 10) {
      analysis.push(`DY atrativo de ${fii.dividendYield.toFixed(2)}%`);
    } else if (fii.dividendYield > 6) {
      analysis.push(`DY adequado de ${fii.dividendYield.toFixed(2)}%`);
    } else {
      analysis.push(`DY baixo de ${fii.dividendYield.toFixed(2)}%`);
    }

    // Análise do P/VP
    if (fii.pvp < 0.8) {
      analysis.push(`P/VP descontado de ${fii.pvp.toFixed(2)}`);
    } else if (fii.pvp < 1.0) {
      analysis.push(`P/VP atrativo de ${fii.pvp.toFixed(2)}`);
    } else if (fii.pvp < 1.2) {
      analysis.push(`P/VP adequado de ${fii.pvp.toFixed(2)}`);
    } else {
      analysis.push(`P/VP alto de ${fii.pvp.toFixed(2)}`);
    }

    // Análise do preço
    if (fii.price < 20) {
      analysis.push(`Preço acessível de R$ ${fii.price.toFixed(2)}`);
    } else if (fii.price < 50) {
      analysis.push(`Preço moderado de R$ ${fii.price.toFixed(2)}`);
    } else {
      analysis.push(`Preço elevado de R$ ${fii.price.toFixed(2)}`);
    }

    // Recomendação final
    if (score >= 0.8) {
      analysis.push('Forte recomendação de compra');
    } else if (score >= 0.6) {
      analysis.push('Recomendação de compra');
    } else if (score >= 0.4) {
      analysis.push('Manter posição');
    } else {
      analysis.push('Considerar venda');
    }

    return analysis.join('. ');
  }

  // Métodos para análise avançada
  analyzeBySector(fiis: FII[]): Map<string, FII[]> {
    const sectorMap = new Map<string, FII[]>();
    
    fiis.forEach(fii => {
      const sector = this.detectSector(fii);
      if (!sectorMap.has(sector)) {
        sectorMap.set(sector, []);
      }
      sectorMap.get(sector)!.push(fii);
    });

    return sectorMap;
  }

  private detectSector(fii: FII): string {
    // Detecção básica de setor por ticker
    const ticker = fii.ticker.toLowerCase();
    
    if (ticker.includes('log') || ticker.includes('ware')) return 'Logística';
    if (ticker.includes('shop') || ticker.includes('mall')) return 'Shopping';
    if (ticker.includes('office') || ticker.includes('corp')) return 'Escritório';
    if (ticker.includes('hosp') || ticker.includes('health')) return 'Saúde';
    if (ticker.includes('educ') || ticker.includes('school')) return 'Educação';
    if (ticker.includes('hotel') || ticker.includes('inn')) return 'Hotelaria';
    if (ticker.includes('resid') || ticker.includes('res')) return 'Residencial';
    if (ticker.includes('agro') || ticker.includes('farm')) return 'Agropecuária';
    
    return 'Diversos';
  }

  getTopPerformers(fiis: FII[], count: number = 10): FII[] {
    return fiis
      .filter(fii => fii.dividendYield > 0)
      .sort((a, b) => b.dividendYield - a.dividendYield)
      .slice(0, count);
  }

  getValueOpportunities(fiis: FII[], count: number = 10): FII[] {
    return fiis
      .filter(fii => fii.pvp > 0 && fii.pvp < 1.0)
      .sort((a, b) => a.pvp - b.pvp)
      .slice(0, count);
  }
} 