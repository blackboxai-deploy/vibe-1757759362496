"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MarketData, MarketAnalysis, TechnicalIndicators } from '@/types/trading';

interface AnalysisChartProps {
  marketData: MarketData;
  analysis: MarketAnalysis;
  indicators: TechnicalIndicators;
}

export function AnalysisChart({ marketData, analysis, indicators }: AnalysisChartProps) {
  const formatPrice = (price: number) => `$${price.toLocaleString()}`;
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  const getSignalColor = (signal: 'BUY' | 'SELL' | 'NEUTRAL') => {
    switch (signal) {
      case 'BUY': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'SELL': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getRecommendationColor = (rec: MarketAnalysis['recommendation']) => {
    switch (rec) {
      case 'STRONG_BUY': return 'bg-green-600 hover:bg-green-700';
      case 'BUY': return 'bg-green-500 hover:bg-green-600';
      case 'STRONG_SELL': return 'bg-red-600 hover:bg-red-700';
      case 'SELL': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-slate-600 hover:bg-slate-700';
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Market Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Market Price */}
        <div className="text-center p-4 rounded-lg bg-slate-700/30">
          <div className="text-sm text-slate-400 mb-1">{marketData.symbol}</div>
          <div className="text-3xl font-bold text-white mb-2">
            {formatPrice(marketData.price)}
          </div>
          <div className={`text-sm font-medium ${
            marketData.change24h >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {marketData.change24h >= 0 ? '+' : ''}{formatPercent(marketData.change24h)} (24h)
          </div>
        </div>

        {/* Overall Analysis */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Trend</span>
            <Badge className={`${
              analysis.trend === 'BULLISH' ? 'bg-green-600/20 text-green-400 border-green-400/20' :
              analysis.trend === 'BEARISH' ? 'bg-red-600/20 text-red-400 border-red-400/20' :
              'bg-slate-600/20 text-slate-400 border-slate-400/20'
            }`}>
              {analysis.trend}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Strength</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${analysis.strength}%` }}
                />
              </div>
              <span className="text-white text-sm">{analysis.strength.toFixed(0)}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Confidence</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${analysis.confidence}%` }}
                />
              </div>
              <span className="text-white text-sm">{analysis.confidence.toFixed(0)}%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Recommendation</span>
            <Badge className={getRecommendationColor(analysis.recommendation)}>
              {analysis.recommendation.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {/* Technical Indicators */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-300">Technical Indicators</h4>
          
          {/* RSI */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">RSI (14)</span>
              <div className="flex items-center gap-2">
                <Badge className={getSignalColor(analysis.signals.rsi)} variant="outline">
                  {analysis.signals.rsi}
                </Badge>
                <span className="text-white text-sm">{indicators.rsi.toFixed(1)}</span>
              </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  indicators.rsi > 70 ? 'bg-red-400' :
                  indicators.rsi < 30 ? 'bg-green-400' :
                  'bg-blue-400'
                }`}
                style={{ width: `${indicators.rsi}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Oversold (30)</span>
              <span>Overbought (70)</span>
            </div>
          </div>

          {/* MACD */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">MACD</span>
            <div className="flex items-center gap-2">
              <Badge className={getSignalColor(analysis.signals.macd)} variant="outline">
                {analysis.signals.macd}
              </Badge>
              <div className="text-right">
                <div className="text-xs text-white">
                  {indicators.macd.macd.toFixed(2)}
                </div>
                <div className="text-xs text-slate-400">
                  Signal: {indicators.macd.signal.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Bollinger Bands */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Bollinger Bands</span>
            <div className="flex items-center gap-2">
              <Badge className={getSignalColor(analysis.signals.bollinger)} variant="outline">
                {analysis.signals.bollinger}
              </Badge>
              <div className="text-right text-xs">
                <div className="text-slate-300">
                  Upper: {formatPrice(indicators.bollingerBands.upper)}
                </div>
                <div className="text-slate-400">
                  Lower: {formatPrice(indicators.bollingerBands.lower)}
                </div>
              </div>
            </div>
          </div>

          {/* Trend */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Trend (SMA/EMA)</span>
            <div className="flex items-center gap-2">
              <Badge className={getSignalColor(analysis.signals.trend)} variant="outline">
                {analysis.signals.trend}
              </Badge>
              <div className="text-right text-xs">
                <div className="text-slate-300">
                  SMA20: {formatPrice(indicators.sma20)}
                </div>
                <div className="text-slate-400">
                  EMA20: {formatPrice(indicators.ema20)}
                </div>
              </div>
            </div>
          </div>

          {/* ATR (Volatility) */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">ATR (Volatility)</span>
            <div className="text-right">
              <div className="text-sm text-white">
                {formatPrice(indicators.atr)}
              </div>
              <div className="text-xs text-slate-400">
                {((indicators.atr / marketData.price) * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* Market Summary */}
        <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600">
          <p className="text-xs text-slate-400 mb-2">Market Summary</p>
          <p className="text-sm text-slate-300">
            The market is showing <span className="text-white font-medium">{analysis.trend.toLowerCase()}</span> trend 
            with <span className="text-white font-medium">{analysis.strength.toFixed(0)}% strength</span>. 
            Analysis confidence is <span className="text-white font-medium">{analysis.confidence}%</span> 
            based on technical indicators alignment.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}