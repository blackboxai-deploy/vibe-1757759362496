"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trade } from '@/types/trading';

interface ProfitTrackerProps {
  currentBalance: number;
  initialCapital: number;
  targetProfit: number;
  totalProfit: number;
  trades: Trade[];
}

export function ProfitTracker({
  currentBalance,
  initialCapital,
  targetProfit,
  totalProfit,
  trades
}: ProfitTrackerProps) {
  const profitPercentage = (totalProfit / initialCapital) * 100;
  const targetProgress = (totalProfit / targetProfit) * 100;
  
  const winningTrades = trades.filter(t => t.profit > 0);
  const losingTrades = trades.filter(t => t.profit < 0);
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
  
  const totalWinnings = winningTrades.reduce((sum, trade) => sum + trade.profit, 0);
  const totalLosses = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.profit, 0));
  const profitFactor = totalLosses > 0 ? totalWinnings / totalLosses : totalWinnings > 0 ? Infinity : 0;

  const recentTrades = trades.slice(-10).reverse(); // Last 10 trades, newest first

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Profit Overview */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Profit Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Balance Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400">Balance Progress</span>
              <span className="text-white font-bold">
                ${currentBalance.toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-3 rounded-full transition-all duration-500 relative"
                style={{ 
                  width: `${Math.min(100, (currentBalance / (initialCapital + targetProfit)) * 100)}%` 
                }}
              >
                {/* Target marker */}
                <div 
                  className="absolute top-0 w-1 h-3 bg-yellow-400"
                  style={{ 
                    left: `${(targetProfit / (initialCapital + targetProfit)) * 100}%`,
                    transform: 'translateX(-50%)'
                  }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>${initialCapital}</span>
              <span className="text-yellow-400">Target: ${initialCapital + targetProfit}</span>
            </div>
          </div>

          {/* Profit Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-lg bg-slate-700/30">
              <p className="text-xs text-slate-400 mb-1">Total Profit</p>
              <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
              </p>
              <p className={`text-xs ${profitPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(1)}%
              </p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-slate-700/30">
              <p className="text-xs text-slate-400 mb-1">Target Progress</p>
              <p className="text-2xl font-bold text-cyan-400">
                {Math.min(100, Math.max(0, targetProgress)).toFixed(0)}%
              </p>
              <p className="text-xs text-slate-400">
                ${Math.max(0, targetProfit - totalProfit).toFixed(2)} to go
              </p>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-slate-400">Win Rate</p>
              <p className="font-medium text-white">{winRate.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Trades</p>
              <p className="font-medium text-white">{trades.length}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Profit Factor</p>
              <p className="font-medium text-white">
                {profitFactor === Infinity ? '∞' : profitFactor.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Trades */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentTrades.length > 0 ? recentTrades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    trade.type === 'LONG' 
                      ? 'bg-green-600/20 text-green-400 border border-green-400/20' 
                      : 'bg-red-600/20 text-red-400 border border-red-400/20'
                  }`}>
                    {trade.type === 'LONG' ? '↗' : '↙'}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {trade.symbol} • {trade.quantity.toFixed(4)}
                    </div>
                    <div className="text-xs text-slate-400">
                      Entry: ${trade.entryPrice.toFixed(2)} → Exit: ${trade.exitPrice.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(trade.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-medium ${
                    trade.profit >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-400">
                    {trade.duration}m • {trade.reason}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700 flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
                <p className="text-slate-400 mb-2">No trades yet</p>
                <p className="text-sm text-slate-500">
                  Start the bot to begin trading and track profits
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}