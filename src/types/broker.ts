// Broker Integration Types

export interface BrokerConfig {
  id: string;
  name: string;
  type: 'MT4' | 'MT5' | 'OANDA' | 'INTERACTIVE_BROKERS' | 'ALPACA' | 'BINANCE' | 'CUSTOM';
  apiKey: string;
  secretKey?: string;
  serverUrl: string;
  accountId?: string;
  testMode: boolean;
  maxLeverage: number;
  minOrderSize: number;
  supportedSymbols: string[];
}

export interface BrokerConnection {
  isConnected: boolean;
  connectionTime?: Date;
  lastPing?: Date;
  latency: number;
  accountInfo?: BrokerAccountInfo;
  error?: string;
}

export interface BrokerAccountInfo {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  currency: string;
  leverage: number;
  accountNumber: string;
  serverName: string;
}

export interface MarketDataFeed {
  symbol: string;
  bid: number;
  ask: number;
  spread: number;
  volume: number;
  timestamp: Date;
  high: number;
  low: number;
  open: number;
  close: number;
}

export interface OrderRequest {
  symbol: string;
  type: 'BUY' | 'SELL' | 'BUY_LIMIT' | 'SELL_LIMIT' | 'BUY_STOP' | 'SELL_STOP';
  volume: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  comment?: string;
  magic?: number;
  expiration?: Date;
}

export interface BrokerOrder {
  ticket: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  volume: number;
  openPrice: number;
  currentPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  profit: number;
  commission: number;
  swap: number;
  comment: string;
  openTime: Date;
  closeTime?: Date;
  status: 'PENDING' | 'OPEN' | 'CLOSED' | 'CANCELLED';
}

export interface TradingSession {
  name: string;
  startTime: string; // HH:mm format
  endTime: string;
  timezone: string;
  isActive: boolean;
  volatility: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface EconomicEvent {
  id: string;
  currency: string;
  event: string;
  importance: 'LOW' | 'MEDIUM' | 'HIGH';
  actual?: number;
  forecast?: number;
  previous?: number;
  timestamp: Date;
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  source: string;
  timestamp: Date;
  sentiment: number; // -1 to 1
  relevance: number; // 0 to 1
  symbols: string[];
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
}