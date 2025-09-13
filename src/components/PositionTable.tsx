"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Position } from '@/types/trading';

interface PositionTableProps {
  positions: Position[];
  currentPrice: number;
}

export function PositionTable({ positions, currentPrice }: PositionTableProps) {
  const openPositions = positions.filter(p => p.status === 'OPEN');
  const closedPositions = positions.filter(p => p.status === 'CLOSED').slice(-5); // Last 5 closed

  const calculatePnL = (position: Position, price: number) => {
    const priceChange = price - position.entryPrice;
    if (position.type === 'LONG') {
      return priceChange * position.quantity;
    } else {
      return -priceChange * position.quantity;
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDuration = (timestamp: Date) => {
    const minutes = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <span>Positions</span>
          <Badge variant="outline" className="text-slate-300">
            {openPositions.length} Open
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Open Positions */}
        {openPositions.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Open Positions</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600 text-slate-400">
                    <th className="text-left py-2">Type</th>
                    <th className="text-right py-2">Entry</th>
                    <th className="text-right py-2">Current</th>
                    <th className="text-right py-2">Qty</th>
                    <th className="text-right py-2">P&L</th>
                    <th className="text-right py-2">SL</th>
                    <th className="text-right py-2">TP</th>
                    <th className="text-right py-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {openPositions.map((position) => {
                    const pnl = calculatePnL(position, currentPrice);
                    const pnlPercent = (pnl / (position.entryPrice * position.quantity)) * 100;
                    
                    return (
                      <tr key={position.id} className="border-b border-slate-700/50">
                        <td className="py-3">
                          <Badge 
                            variant={position.type === 'LONG' ? "default" : "secondary"}
                            className={position.type === 'LONG' 
                              ? "bg-green-600 hover:bg-green-700" 
                              : "bg-red-600 hover:bg-red-700"
                            }
                          >
                            {position.type}
                          </Badge>
                        </td>
                        <td className="text-right py-3 text-slate-300">
                          {formatCurrency(position.entryPrice)}
                        </td>
                        <td className="text-right py-3 text-white font-medium">
                          {formatCurrency(currentPrice)}
                        </td>
                        <td className="text-right py-3 text-slate-300">
                          {position.quantity.toFixed(4)}
                        </td>
                        <td className={`text-right py-3 font-medium ${
                          pnl >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                          <div className="text-xs opacity-80">
                            {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(1)}%
                          </div>
                        </td>
                        <td className="text-right py-3 text-red-400 text-xs">
                          {formatCurrency(position.stopLoss)}
                        </td>
                        <td className="text-right py-3 text-green-400 text-xs">
                          {formatCurrency(position.takeProfit)}
                        </td>
                        <td className="text-right py-3 text-slate-400 text-xs">
                          {getDuration(position.timestamp)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Closed Positions */}
        {closedPositions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-3">Recent Closed Positions</h4>
            <div className="space-y-2">
              {closedPositions.map((position) => {
                const pnl = position.unrealizedPnL || calculatePnL(position, position.currentPrice);
                const pnlPercent = (pnl / (position.entryPrice * position.quantity)) * 100;
                
                return (
                  <div key={position.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={position.type === 'LONG' ? "default" : "secondary"}
                        className={position.type === 'LONG' 
                          ? "bg-green-600/20 text-green-400 border-green-400" 
                          : "bg-red-600/20 text-red-400 border-red-400"
                        }
                      >
                        {position.type}
                      </Badge>
                      <div className="text-sm">
                        <div className="text-white">
                          {position.quantity.toFixed(4)} @ {formatCurrency(position.entryPrice)}
                        </div>
                        <div className="text-xs text-slate-400">
                          Closed at {formatTime(position.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${
                        pnl >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                      </div>
                      <div className={`text-xs ${
                        pnl >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {openPositions.length === 0 && closedPositions.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-slate-400 mb-2">No positions yet</p>
            <p className="text-sm text-slate-500">
              Start the bot to begin automated trading
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}