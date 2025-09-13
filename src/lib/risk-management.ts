// Risk Management System

import { RiskMetrics, MarketData, TechnicalIndicators } from '@/types/trading';

export class RiskManager {
  calculateRiskMetrics(
    marketData: MarketData,
    indicators: TechnicalIndicators,
    accountBalance: number,
    maxRiskPerTrade: number = 0.02 // 2% default
  ): RiskMetrics {
    const volatility = this.calculateVolatility(indicators.atr, marketData.price);
    const stopLossDistance = this.calculateOptimalStopLoss(volatility, indicators.atr);
    const takeProfitDistance = this.calculateOptimalTakeProfit(stopLossDistance);
    const positionSize = this.calculatePositionSize(
      accountBalance,
      maxRiskPerTrade,
      stopLossDistance,
      marketData.price
    );

    return {
      currentRisk: maxRiskPerTrade,
      maxRisk: maxRiskPerTrade,
      positionSize,
      stopLossDistance,
      takeProfitDistance,
      riskRewardRatio: takeProfitDistance / stopLossDistance,
      volatility,
    };
  }

  private calculateVolatility(atr: number, currentPrice: number): number {
    // Volatility as percentage of current price
    return (atr / currentPrice) * 100;
  }

  private calculateOptimalStopLoss(volatility: number, atr: number): number {
    // Stop loss based on ATR (Average True Range)
    // More volatile = wider stop loss
    const baseStopLoss = atr * 1.5; // 1.5x ATR
    const volatilityMultiplier = Math.max(1, volatility / 2); // Adjust based on volatility
    
    return baseStopLoss * volatilityMultiplier;
  }

  private calculateOptimalTakeProfit(stopLossDistance: number, riskRewardRatio: number = 2): number {
    // Take profit based on risk-reward ratio
    return stopLossDistance * riskRewardRatio;
  }

  private calculatePositionSize(
    accountBalance: number,
    riskPercentage: number,
    stopLossDistance: number,
    currentPrice: number
  ): number {
    if (stopLossDistance <= 0) return 0;

    // Maximum dollar amount to risk
    const maxRiskAmount = accountBalance * riskPercentage;
    
    // Position size = Risk Amount / Stop Loss Distance
    const positionSize = maxRiskAmount / stopLossDistance;
    
    // Convert to quantity (assuming we're trading in units, not dollars)
    const quantity = positionSize / currentPrice;
    
    return Math.max(0.001, quantity); // Minimum position size
  }

  calculateDynamicStopLoss(
    entryPrice: number,
    currentPrice: number,
    positionType: 'LONG' | 'SHORT',
    atr: number,
    trailMultiplier: number = 2
  ): number {
    const trailDistance = atr * trailMultiplier;
    
    if (positionType === 'LONG') {
      // For long positions, stop loss moves up with price
      const dynamicStopLoss = currentPrice - trailDistance;
      const initialStopLoss = entryPrice - trailDistance;
      return Math.max(dynamicStopLoss, initialStopLoss);
    } else {
      // For short positions, stop loss moves down with price
      const dynamicStopLoss = currentPrice + trailDistance;
      const initialStopLoss = entryPrice + trailDistance;
      return Math.min(dynamicStopLoss, initialStopLoss);
    }
  }

  calculateDynamicTakeProfit(
    entryPrice: number,
    currentPrice: number,
    positionType: 'LONG' | 'SHORT',
    volatility: number,
    baseRiskReward: number = 2
  ): number {
    // Adjust take profit based on market volatility
    const volatilityAdjustment = Math.max(1, volatility / 10); // Higher volatility = wider targets
    const adjustedRiskReward = baseRiskReward * volatilityAdjustment;
    
    const stopLossDistance = Math.abs(currentPrice - entryPrice) * 0.5; // Simplified
    
    if (positionType === 'LONG') {
      return entryPrice + (stopLossDistance * adjustedRiskReward);
    } else {
      return entryPrice - (stopLossDistance * adjustedRiskReward);
    }
  }

  assessMarketRisk(
    indicators: TechnicalIndicators,
    marketData: MarketData
  ): {
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
    score: number; // 0-100
    factors: string[];
  } {
    let riskScore = 0;
    const factors: string[] = [];

    // RSI risk assessment
    if (indicators.rsi > 80 || indicators.rsi < 20) {
      riskScore += 25;
      factors.push(`Extreme RSI: ${indicators.rsi.toFixed(1)}`);
    } else if (indicators.rsi > 70 || indicators.rsi < 30) {
      riskScore += 15;
      factors.push(`High RSI: ${indicators.rsi.toFixed(1)}`);
    }

    // Volatility assessment
    const volatility = (indicators.atr / marketData.price) * 100;
    if (volatility > 5) {
      riskScore += 30;
      factors.push(`High volatility: ${volatility.toFixed(1)}%`);
    } else if (volatility > 3) {
      riskScore += 15;
      factors.push(`Medium volatility: ${volatility.toFixed(1)}%`);
    }

    // MACD divergence
    if (Math.abs(indicators.macd.histogram) > Math.abs(indicators.macd.macd) * 0.5) {
      riskScore += 10;
      factors.push('MACD divergence detected');
    }

    // Bollinger Band squeeze/expansion
    const bbWidth = (indicators.bollingerBands.upper - indicators.bollingerBands.lower) / indicators.bollingerBands.middle;
    if (bbWidth > 0.1) {
      riskScore += 15;
      factors.push('High Bollinger Band width');
    }

    // Market change assessment
    if (Math.abs(marketData.change24h) > 10) {
      riskScore += 20;
      factors.push(`Large 24h change: ${marketData.change24h.toFixed(1)}%`);
    }

    // Determine risk level
    let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
    if (riskScore > 75) level = 'EXTREME';
    else if (riskScore > 50) level = 'HIGH';
    else if (riskScore > 25) level = 'MEDIUM';
    else level = 'LOW';

    return {
      level,
      score: Math.min(100, riskScore),
      factors,
    };
  }

  shouldReducePositionSize(riskAssessment: ReturnType<typeof this.assessMarketRisk>): boolean {
    return riskAssessment.level === 'HIGH' || riskAssessment.level === 'EXTREME';
  }

  getPositionSizeMultiplier(riskAssessment: ReturnType<typeof this.assessMarketRisk>): number {
    switch (riskAssessment.level) {
      case 'LOW': return 1.0;
      case 'MEDIUM': return 0.8;
      case 'HIGH': return 0.5;
      case 'EXTREME': return 0.25;
      default: return 1.0;
    }
  }
}