// Position Management System

import { Position, MarketData, RiskMetrics } from '@/types/trading';

export class PositionManager {
  createPosition(
    marketData: MarketData,
    type: 'LONG' | 'SHORT',
    riskMetrics: RiskMetrics,
    accountBalance: number
  ): Position {
    const entryPrice = marketData.price;
    const quantity = this.calculateOptimalQuantity(riskMetrics, accountBalance, entryPrice);
    
    const { stopLoss, takeProfit } = this.calculateStopLossAndTakeProfit(
      entryPrice,
      type,
      riskMetrics
    );

    return {
      id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      symbol: marketData.symbol,
      type,
      entryPrice,
      currentPrice: entryPrice,
      quantity,
      stopLoss,
      takeProfit,
      unrealizedPnL: 0,
      timestamp: new Date(),
      status: 'OPEN',
    };
  }

  private calculateOptimalQuantity(
    riskMetrics: RiskMetrics,
    accountBalance: number,
    entryPrice: number
  ): number {
    // Use the position size from risk metrics
    let baseQuantity = riskMetrics.positionSize;
    
    // Ensure minimum viable quantity
    const minQuantity = 0.001;
    
    // Ensure we don't exceed account balance
    const maxQuantity = (accountBalance * 0.9) / entryPrice; // Use max 90% of balance
    
    // Apply risk-based position sizing
    baseQuantity = Math.min(baseQuantity, maxQuantity);
    baseQuantity = Math.max(baseQuantity, minQuantity);
    
    return parseFloat(baseQuantity.toFixed(6));
  }

  private calculateStopLossAndTakeProfit(
    entryPrice: number,
    type: 'LONG' | 'SHORT',
    riskMetrics: RiskMetrics
  ): { stopLoss: number; takeProfit: number } {
    const stopLossDistance = riskMetrics.stopLossDistance;
    const takeProfitDistance = riskMetrics.takeProfitDistance;

    let stopLoss: number;
    let takeProfit: number;

    if (type === 'LONG') {
      stopLoss = entryPrice - stopLossDistance;
      takeProfit = entryPrice + takeProfitDistance;
    } else {
      stopLoss = entryPrice + stopLossDistance;
      takeProfit = entryPrice - takeProfitDistance;
    }

    return {
      stopLoss: parseFloat(stopLoss.toFixed(2)),
      takeProfit: parseFloat(takeProfit.toFixed(2)),
    };
  }

  updateStopLoss(
    position: Position,
    currentPrice: number,
    atr: number,
    useTrailingStop: boolean = true
  ): number {
    if (!useTrailingStop) {
      return position.stopLoss;
    }

    const trailDistance = atr * 2; // 2x ATR for trailing stop
    let newStopLoss = position.stopLoss;

    if (position.type === 'LONG') {
      // For long positions, only move stop loss up
      const trailingStopLoss = currentPrice - trailDistance;
      newStopLoss = Math.max(position.stopLoss, trailingStopLoss);
    } else {
      // For short positions, only move stop loss down
      const trailingStopLoss = currentPrice + trailDistance;
      newStopLoss = Math.min(position.stopLoss, trailingStopLoss);
    }

    return parseFloat(newStopLoss.toFixed(2));
  }

  updateTakeProfit(
    position: Position,
    _currentPrice: number,
    marketVolatility: number,
    adjustForVolatility: boolean = true
  ): number {
    if (!adjustForVolatility) {
      return position.takeProfit;
    }

    // Adjust take profit based on current market conditions
    const volatilityMultiplier = Math.max(0.8, Math.min(1.5, 1 + (marketVolatility - 2) / 10));
    
    const originalDistance = Math.abs(position.takeProfit - position.entryPrice);
    const adjustedDistance = originalDistance * volatilityMultiplier;

    let newTakeProfit: number;
    
    if (position.type === 'LONG') {
      newTakeProfit = position.entryPrice + adjustedDistance;
    } else {
      newTakeProfit = position.entryPrice - adjustedDistance;
    }

    return parseFloat(newTakeProfit.toFixed(2));
  }

  shouldClosePosition(
    position: Position,
    currentPrice: number,
    _marketData: MarketData
  ): { shouldClose: boolean; reason: string } {
    // Check stop loss
    if (position.type === 'LONG' && currentPrice <= position.stopLoss) {
      return { shouldClose: true, reason: 'Stop loss hit' };
    }
    
    if (position.type === 'SHORT' && currentPrice >= position.stopLoss) {
      return { shouldClose: true, reason: 'Stop loss hit' };
    }

    // Check take profit
    if (position.type === 'LONG' && currentPrice >= position.takeProfit) {
      return { shouldClose: true, reason: 'Take profit reached' };
    }
    
    if (position.type === 'SHORT' && currentPrice <= position.takeProfit) {
      return { shouldClose: true, reason: 'Take profit reached' };
    }

    // Check for emergency conditions
    const positionAge = Date.now() - position.timestamp.getTime();
    const maxPositionAge = 24 * 60 * 60 * 1000; // 24 hours

    if (positionAge > maxPositionAge) {
      return { shouldClose: true, reason: 'Maximum hold time exceeded' };
    }

    // Check for extreme market moves
    const priceChange = Math.abs((currentPrice - position.entryPrice) / position.entryPrice);
    if (priceChange > 0.2) { // 20% move
      const unrealizedPnL = this.calculateUnrealizedPnL(position, currentPrice);
      if (unrealizedPnL < 0 && Math.abs(unrealizedPnL) > position.entryPrice * position.quantity * 0.1) {
        return { shouldClose: true, reason: 'Emergency exit - large unrealized loss' };
      }
    }

    return { shouldClose: false, reason: '' };
  }

  calculateUnrealizedPnL(position: Position, currentPrice: number): number {
    const priceChange = currentPrice - position.entryPrice;
    
    if (position.type === 'LONG') {
      return priceChange * position.quantity;
    } else {
      return -priceChange * position.quantity;
    }
  }

  calculatePositionValue(position: Position, currentPrice: number): number {
    return currentPrice * position.quantity;
  }

  calculatePositionRisk(position: Position, _currentPrice: number): number {
    let potentialLoss: number;
    
    if (position.type === 'LONG') {
      potentialLoss = Math.max(0, (position.entryPrice - position.stopLoss) * position.quantity);
    } else {
      potentialLoss = Math.max(0, (position.stopLoss - position.entryPrice) * position.quantity);
    }
    
    return potentialLoss;
  }

  getPositionSummary(position: Position, currentPrice: number) {
    const unrealizedPnL = this.calculateUnrealizedPnL(position, currentPrice);
    const positionValue = this.calculatePositionValue(position, currentPrice);
    const risk = this.calculatePositionRisk(position, currentPrice);
    const durationMinutes = Math.floor((Date.now() - position.timestamp.getTime()) / 60000);

    return {
      id: position.id,
      symbol: position.symbol,
      type: position.type,
      entryPrice: position.entryPrice,
      currentPrice,
      quantity: position.quantity,
      unrealizedPnL,
      unrealizedPnLPercent: (unrealizedPnL / (position.entryPrice * position.quantity)) * 100,
      positionValue,
      risk,
      stopLoss: position.stopLoss,
      takeProfit: position.takeProfit,
      duration: durationMinutes,
      status: position.status,
    };
  }
}