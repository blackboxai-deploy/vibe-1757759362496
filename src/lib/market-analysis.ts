// Market Analysis and Technical Indicators

import { MarketData, TechnicalIndicators, MarketAnalysis } from '@/types/trading';

export class MarketAnalyzer {
  private priceHistory: number[] = [];
  private volumeHistory: number[] = [];
  private maxHistoryLength = 50;

  async calculateIndicators(marketData: MarketData): Promise<TechnicalIndicators> {
    // Add current price to history
    this.priceHistory.push(marketData.price);
    this.volumeHistory.push(marketData.volume);

    // Keep only recent history
    if (this.priceHistory.length > this.maxHistoryLength) {
      this.priceHistory.shift();
      this.volumeHistory.shift();
    }

    // Need at least 20 data points for meaningful calculations
    if (this.priceHistory.length < 20) {
      return this.getDefaultIndicators(marketData.price);
    }

    const rsi = this.calculateRSI(this.priceHistory);
    const macd = this.calculateMACD(this.priceHistory);
    const bollingerBands = this.calculateBollingerBands(this.priceHistory);
    const sma20 = this.calculateSMA(this.priceHistory, 20);
    const ema20 = this.calculateEMA(this.priceHistory, 20);
    const atr = this.calculateATR(this.priceHistory);

    return {
      rsi,
      macd,
      bollingerBands,
      sma20,
      ema20,
      atr,
      volume: marketData.volume,
    };
  }

  async analyzeMarket(marketData: MarketData, indicators: TechnicalIndicators): Promise<MarketAnalysis> {
    const signals = {
      rsi: this.analyzeRSI(indicators.rsi),
      macd: this.analyzeMACD(indicators.macd),
      bollinger: this.analyzeBollingerBands(marketData.price, indicators.bollingerBands),
      trend: this.analyzeTrend(marketData.price, indicators.sma20, indicators.ema20),
    };

    // Calculate overall trend and strength
    const trend = this.determineTrend(signals);
    const strength = this.calculateStrength(signals, indicators);
    const confidence = this.calculateConfidence(signals, indicators);
    const recommendation = this.generateRecommendation(signals, strength, confidence);

    return {
      trend,
      strength,
      signals,
      confidence,
      recommendation,
    };
  }

  private calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    // Calculate initial average gain and loss
    for (let i = prices.length - period; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
    if (prices.length < 26) {
      return { macd: 0, signal: 0, histogram: 0 };
    }

    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macd = ema12 - ema26;

    // For signal line, we'd need MACD history, so we'll simulate
    const signal = macd * 0.9; // Simplified signal line
    const histogram = macd - signal;

    return { macd, signal, histogram };
  }

  private calculateBollingerBands(prices: number[], period: number = 20): { upper: number; middle: number; lower: number } {
    if (prices.length < period) {
      const price = prices[prices.length - 1];
      return { upper: price * 1.02, middle: price, lower: price * 0.98 };
    }

    const sma = this.calculateSMA(prices, period);
    const squared_diffs = prices.slice(-period).map(price => Math.pow(price - sma, 2));
    const variance = squared_diffs.reduce((sum, diff) => sum + diff, 0) / period;
    const std_dev = Math.sqrt(variance);

    return {
      upper: sma + (2 * std_dev),
      middle: sma,
      lower: sma - (2 * std_dev),
    };
  }

  private calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0;
    
    const recentPrices = prices.slice(-period);
    return recentPrices.reduce((sum, price) => sum + price, 0) / period;
  }

  private calculateEMA(prices: number[], period: number): number {
    if (prices.length === 0) return 0;
    if (prices.length === 1) return prices[0];

    const multiplier = 2 / (period + 1);
    let ema = prices[0];

    for (let i = 1; i < prices.length; i++) {
      ema = ((prices[i] - ema) * multiplier) + ema;
    }

    return ema;
  }

  private calculateATR(prices: number[], period: number = 14): number {
    if (prices.length < 2) return 0;

    const trueRanges: number[] = [];
    
    for (let i = 1; i < prices.length; i++) {
      const high = prices[i];
      const low = prices[i] * 0.99; // Simulate low price
      const previousClose = prices[i - 1];
      
      const tr = Math.max(
        high - low,
        Math.abs(high - previousClose),
        Math.abs(low - previousClose)
      );
      
      trueRanges.push(tr);
    }

    return this.calculateSMA(trueRanges, Math.min(period, trueRanges.length));
  }

  private analyzeRSI(rsi: number): 'BUY' | 'SELL' | 'NEUTRAL' {
    if (rsi > 70) return 'SELL'; // Overbought
    if (rsi < 30) return 'BUY';  // Oversold
    return 'NEUTRAL';
  }

  private analyzeMACD(macd: { macd: number; signal: number; histogram: number }): 'BUY' | 'SELL' | 'NEUTRAL' {
    if (macd.macd > macd.signal && macd.histogram > 0) return 'BUY';
    if (macd.macd < macd.signal && macd.histogram < 0) return 'SELL';
    return 'NEUTRAL';
  }

  private analyzeBollingerBands(price: number, bands: { upper: number; middle: number; lower: number }): 'BUY' | 'SELL' | 'NEUTRAL' {
    if (price <= bands.lower) return 'BUY';  // Price at lower band
    if (price >= bands.upper) return 'SELL'; // Price at upper band
    return 'NEUTRAL';
  }

  private analyzeTrend(currentPrice: number, sma20: number, ema20: number): 'BUY' | 'SELL' | 'NEUTRAL' {
    if (currentPrice > sma20 && currentPrice > ema20) return 'BUY';  // Uptrend
    if (currentPrice < sma20 && currentPrice < ema20) return 'SELL'; // Downtrend
    return 'NEUTRAL';
  }

  private determineTrend(signals: MarketAnalysis['signals']): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    const buySignals = Object.values(signals).filter(signal => signal === 'BUY').length;
    const sellSignals = Object.values(signals).filter(signal => signal === 'SELL').length;

    if (buySignals > sellSignals + 1) return 'BULLISH';
    if (sellSignals > buySignals + 1) return 'BEARISH';
    return 'NEUTRAL';
  }

  private calculateStrength(signals: MarketAnalysis['signals'], indicators: TechnicalIndicators): number {
    let strength = 50; // Base strength

    // RSI contribution
    if (indicators.rsi > 70 || indicators.rsi < 30) {
      strength += Math.abs(indicators.rsi - 50);
    }

    // MACD contribution
    strength += Math.abs(indicators.macd.histogram) * 10;

    // Trend contribution
    if (signals.trend !== 'NEUTRAL') {
      strength += 20;
    }

    return Math.min(100, Math.max(0, strength));
  }

  private calculateConfidence(signals: MarketAnalysis['signals'], indicators: TechnicalIndicators): number {
    let confidence = 0;

    // Count aligned signals
    const buySignals = Object.values(signals).filter(signal => signal === 'BUY').length;
    const sellSignals = Object.values(signals).filter(signal => signal === 'SELL').length;

    if (buySignals >= 3 || sellSignals >= 3) {
      confidence = 85;
    } else if (buySignals >= 2 || sellSignals >= 2) {
      confidence = 65;
    } else {
      confidence = 30;
    }

    // Adjust confidence based on RSI extremes
    if (indicators.rsi > 80 || indicators.rsi < 20) {
      confidence += 10;
    }

    return Math.min(100, confidence);
  }

  private generateRecommendation(
    signals: MarketAnalysis['signals'],
    _strength: number,
    confidence: number
  ): MarketAnalysis['recommendation'] {
    const buySignals = Object.values(signals).filter(signal => signal === 'BUY').length;
    const sellSignals = Object.values(signals).filter(signal => signal === 'SELL').length;

    if (confidence > 80) {
      if (buySignals > sellSignals) return 'STRONG_BUY';
      if (sellSignals > buySignals) return 'STRONG_SELL';
    }

    if (confidence > 60) {
      if (buySignals > sellSignals) return 'BUY';
      if (sellSignals > buySignals) return 'SELL';
    }

    return 'HOLD';
  }

  private getDefaultIndicators(currentPrice: number): TechnicalIndicators {
    return {
      rsi: 50,
      macd: { macd: 0, signal: 0, histogram: 0 },
      bollingerBands: {
        upper: currentPrice * 1.02,
        middle: currentPrice,
        lower: currentPrice * 0.98,
      },
      sma20: currentPrice,
      ema20: currentPrice,
      atr: currentPrice * 0.01,
      volume: 0,
    };
  }
}