// Trading Bot TypeScript Interfaces

export interface BotConfig {
  initialCapital: number;
  targetProfit: number;
  maxRiskPerTrade: number;
  maxDailyLoss: number;
  riskRewardRatio: number;
}

export interface BotStatus {
  isRunning: boolean;
  currentBalance: number;
  totalProfit: number;
  targetReached: boolean;
  tradesCount: number;
  winRate: number;
  maxDrawdown: number;
  lastAction: string;
  startTime?: Date;
}

export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  timestamp: Date;
  high24h: number;
  low24h: number;
  change24h: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  sma20: number;
  ema20: number;
  atr: number;
  volume: number;
}

export interface MarketAnalysis {
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  strength: number; // 0-100
  signals: {
    rsi: 'BUY' | 'SELL' | 'NEUTRAL';
    macd: 'BUY' | 'SELL' | 'NEUTRAL';
    bollinger: 'BUY' | 'SELL' | 'NEUTRAL';
    trend: 'BUY' | 'SELL' | 'NEUTRAL';
  };
  confidence: number; // 0-100
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
}

export interface Position {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  stopLoss: number;
  takeProfit: number;
  unrealizedPnL: number;
  timestamp: Date;
  status: 'OPEN' | 'CLOSED' | 'PENDING';
}

export interface Trade {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  profit: number;
  duration: number; // in minutes
  timestamp: Date;
  reason: string; // Exit reason
}

export interface RiskMetrics {
  currentRisk: number;
  maxRisk: number;
  positionSize: number;
  stopLossDistance: number;
  takeProfitDistance: number;
  riskRewardRatio: number;
  volatility: number;
}

export interface BotAction {
  type: 'START' | 'STOP' | 'OPEN_POSITION' | 'CLOSE_POSITION' | 'UPDATE_SL' | 'UPDATE_TP' | 'UPDATE' | 'RESET' | 'BROKER_CONNECTED' | 'BROKER_ERROR' | 'BROKER_ORDER' | 'BROKER_CLOSE' | 'TARGET_REACHED';
  timestamp: Date;
  details: string;
  success: boolean;
  error?: string;
}

export interface BotState {
  config: BotConfig;
  status: BotStatus;
  positions: Position[];
  trades: Trade[];
  marketData: MarketData;
  analysis: MarketAnalysis;
  indicators: TechnicalIndicators;
  riskMetrics: RiskMetrics;
  actions: BotAction[];
}