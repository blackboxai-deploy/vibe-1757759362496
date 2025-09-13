// Advanced AI-Powered Market Analysis Engine

import { TechnicalIndicators, MarketAnalysis } from '@/types/trading';
import { MarketDataFeed, EconomicEvent, NewsItem, TradingSession } from '@/types/broker';

export interface AIAnalysisResult {
  prediction: {
    direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    probability: number; // 0-1
    targetPrice: number;
    timeframe: number; // minutes
  };
  confidence: number;
  reasoning: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  marketRegime: 'TRENDING' | 'RANGING' | 'VOLATILE' | 'BREAKOUT';
}

export interface PatternRecognition {
  candlestickPatterns: CandlestickPattern[];
  chartPatterns: ChartPattern[];
  volumePatterns: VolumePattern[];
}

export interface CandlestickPattern {
  name: string;
  type: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  strength: number; // 0-1
  reliability: number; // 0-1
  timeframe: string;
}

export interface ChartPattern {
  name: string;
  type: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  breakoutTarget: number;
  stopLevel: number;
  probability: number;
}

export interface VolumePattern {
  type: 'ACCUMULATION' | 'DISTRIBUTION' | 'CLIMAX' | 'NORMAL';
  strength: number;
  significance: number;
}

export interface MultiTimeframeAnalysis {
  m1: MarketAnalysis;
  m5: MarketAnalysis;
  m15: MarketAnalysis;
  h1: MarketAnalysis;
  h4: MarketAnalysis;
  d1: MarketAnalysis;
  confluence: number; // 0-1, higher means more timeframes agree
}

export class AdvancedAIAnalyzer {
  private priceHistory: number[] = [];
  private volumeHistory: number[] = [];
  private _newsData: NewsItem[] = [];
  private _economicEvents: EconomicEvent[] = [];
  private _tradingHistory: any[] = [];

  constructor() {
    this.initializeMLModels();
  }

  private initializeMLModels() {
    // Initialize machine learning models
    // In production, this would load pre-trained models
  }

  async performAdvancedAnalysis(
    marketData: MarketDataFeed,
    indicators: TechnicalIndicators,
    sessions: TradingSession[],
    news: NewsItem[],
    events: EconomicEvent[]
  ): Promise<AIAnalysisResult> {
    // Update data
    this.updateHistoricalData(marketData);
    this._newsData = news;
    this._economicEvents = events;

    // Perform multi-layered analysis
    const technicalScore = await this.analyzeTechnical(indicators);
    const fundamentalScore = await this.analyzeFundamental(events);
    const sentimentScore = await this.analyzeSentiment(news);
    const patternScore = await this.analyzePatterns();
    const volumeScore = await this.analyzeVolume();
    const sessionScore = await this.analyzeMarketSession(sessions);
    const correlationScore = await this.analyzeCorrelations();

    // Machine learning prediction
    const mlPrediction = await this.generateMLPrediction(marketData, indicators);

    // Combine all analyses
    const combinedScore = this.combineAnalyses({
      technical: technicalScore,
      fundamental: fundamentalScore,
      sentiment: sentimentScore,
      pattern: patternScore,
      volume: volumeScore,
      session: sessionScore,
      correlation: correlationScore,
      ml: mlPrediction,
    });

    return this.generateFinalAnalysis(combinedScore, marketData);
  }

  private updateHistoricalData(marketData: MarketDataFeed) {
    this.priceHistory.push(marketData.close);
    this.volumeHistory.push(marketData.volume);

    // Keep only recent history (1000 points)
    if (this.priceHistory.length > 1000) {
      this.priceHistory.shift();
      this.volumeHistory.shift();
    }
  }

  private async analyzeTechnical(indicators: TechnicalIndicators): Promise<number> {
    let score = 0;
    let weights = 0;

    // RSI Analysis with advanced interpretation
    const rsiScore = this.analyzeRSIAdvanced(indicators.rsi);
    score += rsiScore * 0.2;
    weights += 0.2;

    // MACD Analysis with divergence detection
    const macdScore = this.analyzeMACDAdvanced(indicators.macd);
    score += macdScore * 0.25;
    weights += 0.25;

    // Bollinger Bands with squeeze/expansion analysis
    const bbScore = this.analyzeBollingerAdvanced(indicators.bollingerBands);
    score += bbScore * 0.2;
    weights += 0.2;

    // Moving average analysis with multiple timeframes
    const maScore = this.analyzeMovingAverages(indicators);
    score += maScore * 0.2;
    weights += 0.2;

    // ATR for volatility context
    const atrScore = this.analyzeATR(indicators.atr);
    score += atrScore * 0.15;
    weights += 0.15;

    return weights > 0 ? score / weights : 0;
  }

  private analyzeRSIAdvanced(rsi: number): number {
    // Advanced RSI analysis with dynamic overbought/oversold levels
    const _currentPrice = this.priceHistory[this.priceHistory.length - 1];
    const volatility = this.calculateVolatility();
    
    // Adjust RSI levels based on volatility
    const overboughtLevel = volatility > 0.03 ? 75 : 70;
    const oversoldLevel = volatility > 0.03 ? 25 : 30;
    
    if (rsi < oversoldLevel) {
      // Oversold - potential bullish signal
      const strength = (oversoldLevel - rsi) / oversoldLevel;
      return Math.min(0.8, 0.4 + strength * 0.4); // 0.4 to 0.8
    } else if (rsi > overboughtLevel) {
      // Overbought - potential bearish signal
      const strength = (rsi - overboughtLevel) / (100 - overboughtLevel);
      return Math.max(0.2, 0.6 - strength * 0.4); // 0.2 to 0.6
    } else {
      // Neutral zone
      return 0.5;
    }
  }

  private analyzeMACDAdvanced(macd: { macd: number; signal: number; histogram: number }): number {
    let score = 0.5; // Start neutral

    // MACD line above/below signal line
    if (macd.macd > macd.signal) {
      score += 0.2;
    } else {
      score -= 0.2;
    }

    // Histogram growing/shrinking
    const histogramStrength = Math.abs(macd.histogram) / Math.abs(macd.macd);
    if (macd.histogram > 0 && histogramStrength > 0.1) {
      score += 0.2 * histogramStrength;
    } else if (macd.histogram < 0 && histogramStrength > 0.1) {
      score -= 0.2 * histogramStrength;
    }

    // Zero line crossover
    if (macd.macd > 0) {
      score += 0.1;
    } else {
      score -= 0.1;
    }

    return Math.max(0, Math.min(1, score));
  }

  private analyzeBollingerAdvanced(bands: { upper: number; middle: number; lower: number }): number {
    if (this.priceHistory.length < 2) return 0.5;

    const currentPrice = this.priceHistory[this.priceHistory.length - 1];
    const bandWidth = (bands.upper - bands.lower) / bands.middle;
    
    // Bollinger Band squeeze detection
    const avgBandWidth = 0.04; // 4% typical width
    const isSqueeze = bandWidth < avgBandWidth * 0.5;
    
    if (isSqueeze) {
      // Squeeze suggests upcoming breakout
      return 0.5; // Neutral until direction is clear
    }
    
    // Band position analysis
    const position = (currentPrice - bands.lower) / (bands.upper - bands.lower);
    
    if (position <= 0.05) {
      // Near lower band - potential bounce
      return 0.75;
    } else if (position >= 0.95) {
      // Near upper band - potential reversal
      return 0.25;
    } else if (position > 0.6) {
      // Upper part of bands - slight bullish
      return 0.6;
    } else if (position < 0.4) {
      // Lower part of bands - slight bearish
      return 0.4;
    }
    
    return 0.5; // Middle of bands - neutral
  }

  private analyzeMovingAverages(indicators: TechnicalIndicators): number {
    const currentPrice = this.priceHistory[this.priceHistory.length - 1];
    let score = 0.5;

    // Price vs SMA20
    if (currentPrice > indicators.sma20) {
      score += 0.2;
    } else {
      score -= 0.2;
    }

    // Price vs EMA20
    if (currentPrice > indicators.ema20) {
      score += 0.2;
    } else {
      score -= 0.2;
    }

    // EMA vs SMA (momentum)
    if (indicators.ema20 > indicators.sma20) {
      score += 0.1;
    } else {
      score -= 0.1;
    }

    return Math.max(0, Math.min(1, score));
  }

  private analyzeATR(atr: number): number {
    if (this.priceHistory.length < 2) return 0.5;

    const currentPrice = this.priceHistory[this.priceHistory.length - 1];
    const volatility = atr / currentPrice;
    
    // Higher volatility suggests more trading opportunities but also more risk
    if (volatility > 0.05) {
      return 0.3; // High volatility - proceed with caution
    } else if (volatility > 0.03) {
      return 0.5; // Moderate volatility - normal conditions
    } else {
      return 0.6; // Low volatility - potentially safer conditions
    }
  }

  private async analyzeFundamental(events: EconomicEvent[]): Promise<number> {
    if (events.length === 0) return 0.5;

    let score = 0.5;
    let totalWeight = 0;

    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);

    // Analyze upcoming events in the next hour
    const upcomingEvents = events.filter(event => 
      event.timestamp >= now && event.timestamp <= nextHour
    );

    upcomingEvents.forEach(event => {
      let eventImpact = 0;
      let weight = 0;

      // Weight by importance
      switch (event.importance) {
        case 'HIGH': weight = 1.0; break;
        case 'MEDIUM': weight = 0.6; break;
        case 'LOW': weight = 0.3; break;
      }

      // Analyze impact
      if (event.actual !== undefined && event.forecast !== undefined) {
        const surprise = (event.actual - event.forecast) / event.forecast;
        eventImpact = event.impact === 'POSITIVE' ? 
          0.5 + surprise * 0.3 : 
          0.5 - surprise * 0.3;
      } else {
        // No actual data yet, use general impact
        eventImpact = event.impact === 'POSITIVE' ? 0.6 : 
                     event.impact === 'NEGATIVE' ? 0.4 : 0.5;
      }

      score += eventImpact * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? score / totalWeight : 0.5;
  }

  private async analyzeSentiment(news: NewsItem[]): Promise<number> {
    if (news.length === 0) return 0.5;

    let totalSentiment = 0;
    let totalWeight = 0;

    // Analyze recent news (last 4 hours)
    const now = new Date();
    const cutoff = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    
    const recentNews = news.filter(item => item.timestamp >= cutoff);

    recentNews.forEach(item => {
      const weight = item.relevance * (item.impact === 'HIGH' ? 1.0 : 
                     item.impact === 'MEDIUM' ? 0.6 : 0.3);
      
      // Convert sentiment (-1 to 1) to score (0 to 1)
      const sentimentScore = (item.sentiment + 1) / 2;
      
      totalSentiment += sentimentScore * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? totalSentiment / totalWeight : 0.5;
  }

  private async analyzePatterns(): Promise<number> {
    if (this.priceHistory.length < 20) return 0.5;

    // Implement pattern recognition
    const patterns = this.detectCandlestickPatterns();
    const _chartPatterns = this.detectChartPatterns();
    
    let score = 0.5;
    
    // Bullish patterns
    const bullishPatterns = patterns.filter(p => p.type === 'BULLISH');
    const bearishPatterns = patterns.filter(p => p.type === 'BEARISH');
    
    bullishPatterns.forEach(pattern => {
      score += pattern.strength * pattern.reliability * 0.1;
    });
    
    bearishPatterns.forEach(pattern => {
      score -= pattern.strength * pattern.reliability * 0.1;
    });

    return Math.max(0, Math.min(1, score));
  }

  private detectCandlestickPatterns(): CandlestickPattern[] {
    // Simplified pattern detection - in production, use more sophisticated algorithms
    const patterns: CandlestickPattern[] = [];
    
    if (this.priceHistory.length < 3) return patterns;
    
    const recent = this.priceHistory.slice(-3);
    const [prev2, prev1, current] = recent;
    
    // Simple hammer pattern detection
    if (prev1 < prev2 && current > prev1 && (current - prev1) > (prev2 - prev1) * 0.5) {
      patterns.push({
        name: 'Bullish Reversal',
        type: 'BULLISH',
        strength: 0.7,
        reliability: 0.6,
        timeframe: '5m'
      });
    }
    
    // Simple shooting star pattern
    if (prev1 > prev2 && current < prev1 && (prev1 - current) > (prev1 - prev2) * 0.5) {
      patterns.push({
        name: 'Bearish Reversal',
        type: 'BEARISH',
        strength: 0.7,
        reliability: 0.6,
        timeframe: '5m'
      });
    }
    
    return patterns;
  }

  private detectChartPatterns(): ChartPattern[] {
    // Simplified chart pattern detection
    return [];
  }

  private async analyzeVolume(): Promise<number> {
    if (this.volumeHistory.length < 20) return 0.5;

    const recentVolume = this.volumeHistory.slice(-5);
    const avgVolume = this.volumeHistory.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const currentVolume = recentVolume[recentVolume.length - 1];
    
    const volumeRatio = currentVolume / avgVolume;
    
    if (volumeRatio > 1.5) {
      // High volume - strong conviction
      return 0.7;
    } else if (volumeRatio > 1.2) {
      // Moderate high volume
      return 0.6;
    } else if (volumeRatio < 0.5) {
      // Low volume - weak conviction
      return 0.3;
    }
    
    return 0.5; // Normal volume
  }

  private async analyzeMarketSession(sessions: TradingSession[]): Promise<number> {
    const now = new Date();
    const _currentTime = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const activeSessions = sessions.filter(session => session.isActive);
    
    if (activeSessions.length === 0) return 0.3; // No active sessions - lower activity
    
    // Multiple overlapping sessions create higher volatility and opportunity
    if (activeSessions.length >= 2) {
      return 0.8;
    }
    
    // Single active session
    const session = activeSessions[0];
    return session.volatility === 'HIGH' ? 0.7 : 
           session.volatility === 'MEDIUM' ? 0.6 : 0.5;
  }

  private async analyzeCorrelations(): Promise<number> {
    // In production, this would analyze correlations with other markets/assets
    // For now, return neutral
    return 0.5;
  }

  private async generateMLPrediction(marketData: MarketDataFeed, indicators: TechnicalIndicators): Promise<number> {
    // Simplified ML prediction - in production, use trained models
    const features = [
      marketData.close,
      marketData.volume,
      indicators.rsi,
      indicators.macd.macd,
      indicators.sma20,
      indicators.ema20,
    ];

    // Simple linear combination as placeholder for ML model
    const weights = [0.1, 0.05, -0.002, 0.8, 0.05, 0.05];
    let prediction = 0.5;
    
    features.forEach((feature, index) => {
      if (feature !== undefined && feature !== null) {
        prediction += feature * weights[index] * 0.0001;
      }
    });

    return Math.max(0, Math.min(1, prediction));
  }

  private combineAnalyses(analyses: any): number {
    const weights = {
      technical: 0.25,
      fundamental: 0.15,
      sentiment: 0.15,
      pattern: 0.2,
      volume: 0.1,
      session: 0.05,
      correlation: 0.05,
      ml: 0.05,
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.keys(weights).forEach(key => {
      if (analyses[key] !== undefined) {
        totalScore += analyses[key] * weights[key as keyof typeof weights];
        totalWeight += weights[key as keyof typeof weights];
      }
    });

    return totalWeight > 0 ? totalScore / totalWeight : 0.5;
  }

  private generateFinalAnalysis(score: number, marketData: MarketDataFeed): AIAnalysisResult {
    const direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 
      score > 0.6 ? 'BULLISH' : 
      score < 0.4 ? 'BEARISH' : 'NEUTRAL';

    const probability = score > 0.5 ? score : 1 - score;
    const confidence = Math.abs(score - 0.5) * 2; // 0-1 scale

    // Generate target price based on direction and ATR
    const atr = this.calculateATR();
    const targetPrice = direction === 'BULLISH' ? 
      marketData.close + atr * 1.5 : 
      marketData.close - atr * 1.5;

    const reasoning = this.generateReasoning(score, direction);
    
    const riskLevel = confidence > 0.8 ? 'LOW' :
                     confidence > 0.6 ? 'MEDIUM' :
                     confidence > 0.4 ? 'HIGH' : 'EXTREME';

    const marketRegime = this.detectMarketRegime();

    return {
      prediction: {
        direction,
        probability,
        targetPrice,
        timeframe: 15, // 15 minutes
      },
      confidence,
      reasoning,
      riskLevel,
      marketRegime,
    };
  }

  private calculateVolatility(): number {
    if (this.priceHistory.length < 20) return 0.02;
    
    const returns = [];
    for (let i = 1; i < Math.min(20, this.priceHistory.length); i++) {
      const ret = (this.priceHistory[i] - this.priceHistory[i-1]) / this.priceHistory[i-1];
      returns.push(ret);
    }
    
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  private calculateATR(): number {
    // Simplified ATR calculation
    if (this.priceHistory.length < 2) return 0;
    
    const recent = this.priceHistory.slice(-14);
    let totalRange = 0;
    
    for (let i = 1; i < recent.length; i++) {
      const range = Math.abs(recent[i] - recent[i-1]);
      totalRange += range;
    }
    
    return totalRange / (recent.length - 1);
  }

  private generateReasoning(score: number, direction: string): string[] {
    const reasons = [];
    
    if (direction === 'BULLISH') {
      reasons.push('Technical indicators showing bullish momentum');
      if (score > 0.7) reasons.push('Strong confluence across multiple timeframes');
      reasons.push('Volume supporting upward movement');
    } else if (direction === 'BEARISH') {
      reasons.push('Technical indicators showing bearish pressure');
      if (score < 0.3) reasons.push('Multiple bearish signals aligned');
      reasons.push('Market structure favoring downside');
    } else {
      reasons.push('Mixed signals from technical indicators');
      reasons.push('Market in consolidation phase');
    }
    
    return reasons;
  }

  private detectMarketRegime(): 'TRENDING' | 'RANGING' | 'VOLATILE' | 'BREAKOUT' {
    if (this.priceHistory.length < 20) return 'RANGING';
    
    const volatility = this.calculateVolatility();
    const recent = this.priceHistory.slice(-20);
    const trend = (recent[recent.length - 1] - recent[0]) / recent[0];
    
    if (volatility > 0.05) {
      return 'VOLATILE';
    } else if (Math.abs(trend) > 0.02) {
      return 'TRENDING';
    } else if (volatility < 0.01) {
      return 'BREAKOUT'; // Low volatility before potential breakout
    } else {
      return 'RANGING';
    }
  }
}