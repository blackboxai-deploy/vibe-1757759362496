// Broker Integration Manager

import { BrokerConfig, BrokerConnection, BrokerAccountInfo, MarketDataFeed, OrderRequest, BrokerOrder, EconomicEvent, NewsItem } from '@/types/broker';

export interface BrokerAdapter {
  connect(): Promise<boolean>;
  disconnect(): Promise<boolean>;
  getAccountInfo(): Promise<BrokerAccountInfo>;
  getMarketData(symbol: string): Promise<MarketDataFeed>;
  placeOrder(order: OrderRequest): Promise<string>;
  closeOrder(ticket: string): Promise<boolean>;
  getOpenOrders(): Promise<BrokerOrder[]>;
  getOrderHistory(): Promise<BrokerOrder[]>;
  subscribeToMarketData(symbol: string, callback: (data: MarketDataFeed) => void): void;
}

export class MetaTraderAdapter implements BrokerAdapter {
  private config: BrokerConfig;
  private connection: BrokerConnection;

  constructor(config: BrokerConfig) {
    this.config = config;
    this.connection = {
      isConnected: false,
      latency: 0,
    };
  }

  async connect(): Promise<boolean> {
    try {
      // Simulate MT4/MT5 connection
      // In production, this would use actual MT4/MT5 API or DLL
      
      const response = await fetch(`${this.config.serverUrl}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          account: this.config.accountId,
          server: this.config.serverUrl,
        }),
      });

      if (response.ok) {
        this.connection.isConnected = true;
        this.connection.connectionTime = new Date();
        this.connection.latency = await this.measureLatency();
        return true;
      }
      
      throw new Error(`Connection failed: ${response.statusText}`);
    } catch (error) {
      this.connection.error = error instanceof Error ? error.message : 'Unknown error';
      return false;
    }
  }

  async disconnect(): Promise<boolean> {
    this.connection.isConnected = false;
    this.connection.connectionTime = undefined;
    return true;
  }

  async getAccountInfo(): Promise<BrokerAccountInfo> {
    if (!this.connection.isConnected) {
      throw new Error('Not connected to broker');
    }

    // Simulate account info retrieval
    return {
      balance: 10000,
      equity: 10000,
      margin: 0,
      freeMargin: 10000,
      marginLevel: 0,
      currency: 'USD',
      leverage: 100,
      accountNumber: this.config.accountId || '12345',
      serverName: this.config.serverUrl,
    };
  }

  async getMarketData(symbol: string): Promise<MarketDataFeed> {
    if (!this.connection.isConnected) {
      throw new Error('Not connected to broker');
    }

    // Simulate real market data
    const basePrice = symbol.includes('BTC') ? 45000 : 
                     symbol.includes('EUR') ? 1.0950 : 
                     symbol.includes('GBP') ? 1.2650 : 1.0000;

    const spread = basePrice * 0.0001; // 1 pip spread
    const bid = basePrice - spread / 2;
    const ask = basePrice + spread / 2;

    return {
      symbol,
      bid,
      ask,
      spread: ask - bid,
      volume: Math.floor(Math.random() * 1000000),
      timestamp: new Date(),
      high: basePrice * 1.002,
      low: basePrice * 0.998,
      open: basePrice * 0.9995,
      close: basePrice,
    };
  }

  async placeOrder(order: OrderRequest): Promise<string> {
    if (!this.connection.isConnected) {
      throw new Error('Not connected to broker');
    }

    // Simulate order placement
    const ticket = `MT_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    // In production, send to MT4/MT5
    console.log('Placing order:', order);
    
    return ticket;
  }

  async closeOrder(ticket: string): Promise<boolean> {
    if (!this.connection.isConnected) {
      throw new Error('Not connected to broker');
    }

    console.log('Closing order:', ticket);
    return true;
  }

  async getOpenOrders(): Promise<BrokerOrder[]> {
    if (!this.connection.isConnected) {
      throw new Error('Not connected to broker');
    }

    // Return simulated open orders
    return [];
  }

  async getOrderHistory(): Promise<BrokerOrder[]> {
    if (!this.connection.isConnected) {
      throw new Error('Not connected to broker');
    }

    return [];
  }

  subscribeToMarketData(symbol: string, callback: (data: MarketDataFeed) => void): void {
    // Simulate real-time market data updates
    const interval = setInterval(async () => {
      try {
        const data = await this.getMarketData(symbol);
        callback(data);
      } catch (error) {
        console.error('Market data subscription error:', error);
      }
    }, 1000); // Update every second

    // Store interval ID for cleanup
    (this as any)[`${symbol}_interval`] = interval;
  }

  private async measureLatency(): Promise<number> {
    const start = Date.now();
    try {
      await fetch(`${this.config.serverUrl}/ping`);
      return Date.now() - start;
    } catch {
      return 999; // High latency on error
    }
  }
}

export class OandaAdapter implements BrokerAdapter {
  private config: BrokerConfig;
  private connection: BrokerConnection;

  constructor(config: BrokerConfig) {
    this.config = config;
    this.connection = {
      isConnected: false,
      latency: 0,
    };
  }

  async connect(): Promise<boolean> {
    try {
      const response = await fetch('https://api-fxtrade.oanda.com/v3/accounts', {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (response.ok) {
        this.connection.isConnected = true;
        this.connection.connectionTime = new Date();
        return true;
      }

      throw new Error(`OANDA connection failed: ${response.statusText}`);
    } catch (error) {
      this.connection.error = error instanceof Error ? error.message : 'Unknown error';
      return false;
    }
  }

  async disconnect(): Promise<boolean> {
    this.connection.isConnected = false;
    return true;
  }

  async getAccountInfo(): Promise<BrokerAccountInfo> {
    if (!this.connection.isConnected) {
      throw new Error('Not connected to OANDA');
    }

    const response = await fetch(`https://api-fxtrade.oanda.com/v3/accounts/${this.config.accountId}`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });

    const data = await response.json();
    
    return {
      balance: parseFloat(data.account.balance),
      equity: parseFloat(data.account.NAV),
      margin: parseFloat(data.account.marginUsed),
      freeMargin: parseFloat(data.account.marginAvailable),
      marginLevel: parseFloat(data.account.marginRate) * 100,
      currency: data.account.currency,
      leverage: this.config.maxLeverage,
      accountNumber: data.account.id,
      serverName: 'OANDA',
    };
  }

  async getMarketData(symbol: string): Promise<MarketDataFeed> {
    if (!this.connection.isConnected) {
      throw new Error('Not connected to OANDA');
    }

    const instrument = this.convertToOandaSymbol(symbol);
    const response = await fetch(`https://api-fxtrade.oanda.com/v3/instruments/${instrument}/candles?count=1&granularity=M1`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });

    const data = await response.json();
    const candle = data.candles[0];

    return {
      symbol,
      bid: parseFloat(candle.bid.c),
      ask: parseFloat(candle.ask.c),
      spread: parseFloat(candle.ask.c) - parseFloat(candle.bid.c),
      volume: parseInt(candle.volume),
      timestamp: new Date(candle.time),
      high: parseFloat(candle.bid.h),
      low: parseFloat(candle.bid.l),
      open: parseFloat(candle.bid.o),
      close: parseFloat(candle.bid.c),
    };
  }

  async placeOrder(order: OrderRequest): Promise<string> {
    if (!this.connection.isConnected) {
      throw new Error('Not connected to OANDA');
    }

    const orderData = {
      order: {
        type: order.type === 'BUY' ? 'MARKET' : 'MARKET',
        instrument: this.convertToOandaSymbol(order.symbol),
        units: order.type === 'BUY' ? order.volume : -order.volume,
        stopLossOnFill: order.stopLoss ? {
          price: order.stopLoss.toString(),
        } : undefined,
        takeProfitOnFill: order.takeProfit ? {
          price: order.takeProfit.toString(),
        } : undefined,
      },
    };

    const response = await fetch(`https://api-fxtrade.oanda.com/v3/accounts/${this.config.accountId}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();
    return result.orderCreateTransaction.id;
  }

  async closeOrder(ticket: string): Promise<boolean> {
    if (!this.connection.isConnected) {
      throw new Error('Not connected to OANDA');
    }

    const response = await fetch(`https://api-fxtrade.oanda.com/v3/accounts/${this.config.accountId}/trades/${ticket}/close`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });

    return response.ok;
  }

  async getOpenOrders(): Promise<BrokerOrder[]> {
    if (!this.connection.isConnected) {
      throw new Error('Not connected to OANDA');
    }

    const response = await fetch(`https://api-fxtrade.oanda.com/v3/accounts/${this.config.accountId}/trades`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });

    const data = await response.json();
    
    return data.trades.map((trade: any) => ({
      ticket: trade.id,
      symbol: this.convertFromOandaSymbol(trade.instrument),
      type: parseFloat(trade.currentUnits) > 0 ? 'BUY' : 'SELL',
      volume: Math.abs(parseFloat(trade.currentUnits)),
      openPrice: parseFloat(trade.price),
      currentPrice: parseFloat(trade.unrealizedPL) / parseFloat(trade.currentUnits) + parseFloat(trade.price),
      stopLoss: trade.stopLossOrder ? parseFloat(trade.stopLossOrder.price) : undefined,
      takeProfit: trade.takeProfitOrder ? parseFloat(trade.takeProfitOrder.price) : undefined,
      profit: parseFloat(trade.unrealizedPL),
      commission: 0,
      swap: parseFloat(trade.financing),
      comment: '',
      openTime: new Date(trade.openTime),
      status: 'OPEN',
    }));
  }

  async getOrderHistory(): Promise<BrokerOrder[]> {
    // Implementation similar to getOpenOrders but for closed trades
    return [];
  }

  subscribeToMarketData(symbol: string, callback: (data: MarketDataFeed) => void): void {
    // OANDA streaming API implementation would go here
    const interval = setInterval(async () => {
      try {
        const data = await this.getMarketData(symbol);
        callback(data);
      } catch (error) {
        console.error('OANDA market data error:', error);
      }
    }, 1000);

    (this as any)[`${symbol}_interval`] = interval;
  }

  private convertToOandaSymbol(symbol: string): string {
    // Convert standard symbols to OANDA format
    return symbol.replace('/', '_');
  }

  private convertFromOandaSymbol(instrument: string): string {
    // Convert OANDA format back to standard
    return instrument.replace('_', '/');
  }
}

export class BrokerManager {
  private adapters: Map<string, BrokerAdapter> = new Map();
  private activeAdapter: BrokerAdapter | null = null;

  addBroker(id: string, config: BrokerConfig): void {
    let adapter: BrokerAdapter;

    switch (config.type) {
      case 'MT4':
      case 'MT5':
        adapter = new MetaTraderAdapter(config);
        break;
      case 'OANDA':
        adapter = new OandaAdapter(config);
        break;
      default:
        throw new Error(`Unsupported broker type: ${config.type}`);
    }

    this.adapters.set(id, adapter);
  }

  async connectToBroker(id: string): Promise<boolean> {
    const adapter = this.adapters.get(id);
    if (!adapter) {
      throw new Error(`Broker ${id} not found`);
    }

    const connected = await adapter.connect();
    if (connected) {
      this.activeAdapter = adapter;
    }

    return connected;
  }

  async disconnectFromBroker(): Promise<boolean> {
    if (this.activeAdapter) {
      const result = await this.activeAdapter.disconnect();
      this.activeAdapter = null;
      return result;
    }
    return true;
  }

  getActiveBroker(): BrokerAdapter | null {
    return this.activeAdapter;
  }

  async getAccountInfo(): Promise<BrokerAccountInfo | null> {
    if (!this.activeAdapter) return null;
    return await this.activeAdapter.getAccountInfo();
  }

  async placeOrder(order: OrderRequest): Promise<string | null> {
    if (!this.activeAdapter) return null;
    return await this.activeAdapter.placeOrder(order);
  }

  async closeOrder(ticket: string): Promise<boolean> {
    if (!this.activeAdapter) return false;
    return await this.activeAdapter.closeOrder(ticket);
  }

  async getOpenOrders(): Promise<BrokerOrder[]> {
    if (!this.activeAdapter) return [];
    return await this.activeAdapter.getOpenOrders();
  }
}

// Market Data Provider for real-time feeds
export class MarketDataProvider {
  private _providers: Map<string, any> = new Map();

  async getEconomicEvents(): Promise<EconomicEvent[]> {
    // Integrate with economic calendar APIs (e.g., Forex Factory, Investing.com)
    // Simulated data for now
    return [
      {
        id: '1',
        currency: 'USD',
        event: 'Federal Funds Rate',
        importance: 'HIGH',
        forecast: 5.25,
        previous: 5.00,
        timestamp: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        impact: 'POSITIVE',
      },
    ];
  }

  async getNewsItems(): Promise<NewsItem[]> {
    // Integrate with news APIs (Alpha Vantage, NewsAPI, etc.)
    // Simulated data for now
    return [
      {
        id: '1',
        title: 'Federal Reserve Announces Interest Rate Decision',
        content: 'The Federal Reserve announced its latest interest rate decision...',
        source: 'Reuters',
        timestamp: new Date(),
        sentiment: 0.2, // Slightly positive
        relevance: 0.9,
        symbols: ['USD/EUR', 'BTC/USD'],
        impact: 'HIGH',
      },
    ];
  }

  async getMultiTimeframeData(_symbol: string): Promise<any> {
    // Get data for multiple timeframes
    return {
      m1: [],
      m5: [],
      m15: [],
      h1: [],
      h4: [],
      d1: [],
    };
  }
}

// Export singleton instances
export const brokerManager = new BrokerManager();
export const marketDataProvider = new MarketDataProvider();