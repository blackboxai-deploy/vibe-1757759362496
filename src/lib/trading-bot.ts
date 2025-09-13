// Core Trading Bot Logic

import { BotState, BotConfig, BotStatus, Position, Trade, BotAction } from '@/types/trading';
import { MarketAnalyzer } from './market-analysis';
import { RiskManager } from './risk-management';
import { PositionManager } from './position-manager';

export class TradingBot {
  private state: BotState;
  private marketAnalyzer: MarketAnalyzer;
  private riskManager: RiskManager;
  private positionManager: PositionManager;
  private intervalId?: ReturnType<typeof setInterval>;

  constructor() {
    this.state = this.initializeState();
    this.marketAnalyzer = new MarketAnalyzer();
    this.riskManager = new RiskManager();
    this.positionManager = new PositionManager();
  }

  private initializeState(): BotState {
    const config: BotConfig = {
      initialCapital: 50,
      targetProfit: 100,
      maxRiskPerTrade: 0.02, // 2% risk per trade
      maxDailyLoss: 0.1, // 10% max daily loss
      riskRewardRatio: 2.0, // 1:2 risk reward
    };

    const status: BotStatus = {
      isRunning: false,
      currentBalance: config.initialCapital,
      totalProfit: 0,
      targetReached: false,
      tradesCount: 0,
      winRate: 0,
      maxDrawdown: 0,
      lastAction: 'Initialized',
    };

    return {
      config,
      status,
      positions: [],
      trades: [],
      marketData: {
        symbol: 'BTC/USD',
        price: 0,
        volume: 0,
        timestamp: new Date(),
        high24h: 0,
        low24h: 0,
        change24h: 0,
      },
      analysis: {
        trend: 'NEUTRAL',
        strength: 50,
        signals: {
          rsi: 'NEUTRAL',
          macd: 'NEUTRAL',
          bollinger: 'NEUTRAL',
          trend: 'NEUTRAL',
        },
        confidence: 0,
        recommendation: 'HOLD',
      },
      indicators: {
        rsi: 50,
        macd: { macd: 0, signal: 0, histogram: 0 },
        bollingerBands: { upper: 0, middle: 0, lower: 0 },
        sma20: 0,
        ema20: 0,
        atr: 0,
        volume: 0,
      },
      riskMetrics: {
        currentRisk: 0,
        maxRisk: 0.02,
        positionSize: 0,
        stopLossDistance: 0,
        takeProfitDistance: 0,
        riskRewardRatio: 2.0,
        volatility: 0,
      },
      actions: [],
    };
  }

  async start(): Promise<boolean> {
    try {
      if (this.state.status.targetReached) {
        this.addAction('START', 'Cannot start: Target already reached. Reset required.', false);
        return false;
      }

      this.state.status.isRunning = true;
      this.state.status.startTime = new Date();
      this.addAction('START', 'Trading bot started successfully', true);

      // Start the main trading loop
      this.intervalId = setInterval(() => {
        this.runTradingCycle();
      }, 5000); // Run every 5 seconds

      return true;
    } catch (error) {
      this.addAction('START', `Failed to start bot: ${error}`, false);
      return false;
    }
  }

  async stop(): Promise<boolean> {
    try {
      this.state.status.isRunning = false;
      
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = undefined;
      }

      // Close all open positions
      await this.closeAllPositions('Manual stop');
      
      this.addAction('STOP', 'Trading bot stopped successfully', true);
      return true;
    } catch (error) {
      this.addAction('STOP', `Failed to stop bot: ${error}`, false);
      return false;
    }
  }

  private async runTradingCycle(): Promise<void> {
    try {
      // Check if target is reached
      if (this.state.status.totalProfit >= this.state.config.targetProfit) {
        this.state.status.targetReached = true;
        await this.stop();
        this.addAction('STOP', `Target profit of $${this.state.config.targetProfit} reached!`, true);
        return;
      }

      // Update market data and analysis
      await this.updateMarketData();
      await this.updateAnalysis();

      // Manage existing positions
      await this.managePositions();

      // Check for new trading opportunities
      if (this.shouldOpenPosition()) {
        await this.openNewPosition();
      }

      this.updateBotMetrics();
    } catch (error) {
      console.error('Trading cycle error:', error);
      this.addAction('UPDATE', `Trading cycle error: ${error}`, false);
    }
  }

  private async updateMarketData(): Promise<void> {
    // Simulate market data - in real implementation, this would fetch from an exchange API
    const basePrice = 45000; // Base BTC price
    const volatility = 0.02; // 2% volatility
    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    const newPrice = this.state.marketData.price || basePrice;
    
    this.state.marketData = {
      ...this.state.marketData,
      price: newPrice + (newPrice * randomChange),
      volume: Math.floor(Math.random() * 1000000),
      timestamp: new Date(),
      change24h: randomChange * 100,
    };

    // Update high/low if necessary
    if (this.state.marketData.price > this.state.marketData.high24h) {
      this.state.marketData.high24h = this.state.marketData.price;
    }
    if (this.state.marketData.price < this.state.marketData.low24h || this.state.marketData.low24h === 0) {
      this.state.marketData.low24h = this.state.marketData.price;
    }
  }

  private async updateAnalysis(): Promise<void> {
    // Update technical indicators
    this.state.indicators = await this.marketAnalyzer.calculateIndicators(this.state.marketData);
    
    // Perform market analysis
    this.state.analysis = await this.marketAnalyzer.analyzeMarket(
      this.state.marketData,
      this.state.indicators
    );

    // Update risk metrics
    this.state.riskMetrics = this.riskManager.calculateRiskMetrics(
      this.state.marketData,
      this.state.indicators,
      this.state.status.currentBalance
    );
  }

  private async managePositions(): Promise<void> {
    for (const position of this.state.positions) {
      if (position.status === 'OPEN') {
        // Update position current price
        position.currentPrice = this.state.marketData.price;
        position.unrealizedPnL = this.calculateUnrealizedPnL(position);

        // Check stop loss and take profit
        if (this.shouldClosePosition(position)) {
          await this.closePosition(position.id, 'Automated exit condition met');
        }
      }
    }
  }

  private shouldOpenPosition(): boolean {
    // Don't open new positions if we already have open positions (for simplicity)
    if (this.state.positions.some(p => p.status === 'OPEN')) {
      return false;
    }

    // Check if we have a strong signal
    const analysis = this.state.analysis;
    return (
      analysis.confidence > 70 &&
      (analysis.recommendation === 'STRONG_BUY' || analysis.recommendation === 'STRONG_SELL')
    );
  }

  private async openNewPosition(): Promise<void> {
    const analysis = this.state.analysis;
    const isLong = analysis.recommendation === 'STRONG_BUY';
    
    const position = this.positionManager.createPosition(
      this.state.marketData,
      isLong ? 'LONG' : 'SHORT',
      this.state.riskMetrics,
      this.state.status.currentBalance
    );

    this.state.positions.push(position);
    this.addAction(
      'OPEN_POSITION',
      `Opened ${position.type} position at $${position.entryPrice.toFixed(2)}`,
      true
    );
  }

  private shouldClosePosition(position: Position): boolean {
    const currentPrice = this.state.marketData.price;
    
    if (position.type === 'LONG') {
      return currentPrice <= position.stopLoss || currentPrice >= position.takeProfit;
    } else {
      return currentPrice >= position.stopLoss || currentPrice <= position.takeProfit;
    }
  }

  private async closePosition(positionId: string, reason: string): Promise<void> {
    const position = this.state.positions.find(p => p.id === positionId);
    if (!position || position.status !== 'OPEN') return;

    position.status = 'CLOSED';
    position.currentPrice = this.state.marketData.price;
    
    const profit = this.calculateRealizedPnL(position);
    
    // Create trade record
    const trade: Trade = {
      id: `trade_${Date.now()}`,
      symbol: position.symbol,
      type: position.type,
      entryPrice: position.entryPrice,
      exitPrice: position.currentPrice,
      quantity: position.quantity,
      profit,
      duration: Math.floor((new Date().getTime() - position.timestamp.getTime()) / 60000),
      timestamp: new Date(),
      reason,
    };

    this.state.trades.push(trade);
    this.state.status.currentBalance += profit;
    this.state.status.totalProfit = this.state.status.currentBalance - this.state.config.initialCapital;
    this.state.status.tradesCount++;

    this.addAction(
      'CLOSE_POSITION',
      `Closed ${position.type} position. P&L: $${profit.toFixed(2)}`,
      true
    );
  }

  private async closeAllPositions(reason: string): Promise<void> {
    const openPositions = this.state.positions.filter(p => p.status === 'OPEN');
    for (const position of openPositions) {
      await this.closePosition(position.id, reason);
    }
  }

  private calculateUnrealizedPnL(position: Position): number {
    const currentPrice = position.currentPrice;
    const entryPrice = position.entryPrice;
    const quantity = position.quantity;

    if (position.type === 'LONG') {
      return (currentPrice - entryPrice) * quantity;
    } else {
      return (entryPrice - currentPrice) * quantity;
    }
  }

  private calculateRealizedPnL(position: Position): number {
    return this.calculateUnrealizedPnL(position);
  }

  private updateBotMetrics(): void {
    // Calculate win rate
    if (this.state.trades.length > 0) {
      const winningTrades = this.state.trades.filter(t => t.profit > 0).length;
      this.state.status.winRate = (winningTrades / this.state.trades.length) * 100;
    }

    // Update max drawdown
    const currentDrawdown = (this.state.config.initialCapital - this.state.status.currentBalance) / this.state.config.initialCapital;
    if (currentDrawdown > this.state.status.maxDrawdown) {
      this.state.status.maxDrawdown = currentDrawdown;
    }
  }

  private addAction(type: BotAction['type'], details: string, success: boolean, error?: string): void {
    this.state.actions.unshift({
      type,
      timestamp: new Date(),
      details,
      success,
      error,
    });

    // Keep only last 50 actions
    if (this.state.actions.length > 50) {
      this.state.actions = this.state.actions.slice(0, 50);
    }

    this.state.status.lastAction = details;
  }

  // Public getters
  getState(): BotState {
    return { ...this.state };
  }

  getStatus(): BotStatus {
    return { ...this.state.status };
  }

  reset(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    
    this.state = this.initializeState();
    this.addAction('RESET', 'Trading bot reset to initial state', true);
  }
}

// Singleton instance
export const tradingBot = new TradingBot();