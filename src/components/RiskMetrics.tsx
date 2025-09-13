"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RiskMetrics as RiskMetricsType, MarketAnalysis } from '@/types/trading';

interface RiskMetricsProps {
  riskMetrics: RiskMetricsType;
  analysis: MarketAnalysis;
}

export function RiskMetrics({ riskMetrics, analysis }: RiskMetricsProps) {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatPercent = (value: number) => `${value.toFixed(2)}%`;

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'HIGH': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'EXTREME': return 'text-red-500 bg-red-500/20 border-red-500/30';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    if (confidence >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  // Simulate risk assessment based on volatility and analysis
  const currentRiskLevel = riskMetrics.volatility > 5 ? 'HIGH' : 
                          riskMetrics.volatility > 3 ? 'MEDIUM' : 'LOW';

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Risk Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-slate-700/30">
            <p className="text-xs text-slate-400 mb-1">Current Risk</p>
            <p className="text-lg font-bold text-white">
              {formatPercent(riskMetrics.currentRisk * 100)}
            </p>
            <p className="text-xs text-slate-400">per trade</p>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-slate-700/30">
            <p className="text-xs text-slate-400 mb-1">Risk Level</p>
            <Badge className={getRiskLevelColor(currentRiskLevel)} variant="outline">
              {currentRiskLevel}
            </Badge>
            <p className="text-xs text-slate-400 mt-1">market risk</p>
          </div>
        </div>

        {/* Position Sizing */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-300">Position Sizing</h4>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Position Size</span>
            <span className="text-white font-medium">
              {riskMetrics.positionSize.toFixed(4)} units
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Risk/Reward Ratio</span>
            <span className="text-green-400 font-medium">
              1:{riskMetrics.riskRewardRatio.toFixed(1)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Market Volatility</span>
            <div className="flex items-center gap-2">
              <div className="w-16 bg-slate-700 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    riskMetrics.volatility > 5 ? 'bg-red-400' :
                    riskMetrics.volatility > 3 ? 'bg-yellow-400' :
                    'bg-green-400'
                  }`}
                  style={{ width: `${Math.min(100, riskMetrics.volatility * 10)}%` }}
                />
              </div>
              <span className="text-white text-sm">
                {formatPercent(riskMetrics.volatility)}
              </span>
            </div>
          </div>
        </div>

        {/* Stop Loss & Take Profit */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-300">Exit Levels</h4>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Stop Loss Distance</span>
            <span className="text-red-400 font-medium">
              {formatCurrency(riskMetrics.stopLossDistance)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Take Profit Distance</span>
            <span className="text-green-400 font-medium">
              {formatCurrency(riskMetrics.takeProfitDistance)}
            </span>
          </div>
        </div>

        {/* Analysis Confidence */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-300">Analysis Quality</h4>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Signal Confidence</span>
            <div className="flex items-center gap-2">
              <div className="w-20 bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${analysis.confidence}%` }}
                />
              </div>
              <span className={`text-sm font-medium ${getConfidenceColor(analysis.confidence)}`}>
                {analysis.confidence}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Signal Strength</span>
            <div className="flex items-center gap-2">
              <div className="w-20 bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${analysis.strength}%` }}
                />
              </div>
              <span className="text-white text-sm">
                {analysis.strength.toFixed(0)}
              </span>
            </div>
          </div>
        </div>

        {/* Risk Guidelines */}
        <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600">
          <h4 className="text-xs font-medium text-slate-300 mb-2">Risk Guidelines</h4>
          <div className="space-y-1 text-xs text-slate-400">
            <p>• Maximum 2% risk per trade</p>
            <p>• Stop losses adjusted for volatility</p>
            <p>• Position sizes scaled with confidence</p>
            <p>• Risk-reward ratio maintained at 1:2+</p>
          </div>
        </div>

        {/* Current Market Risk Assessment */}
        <div className={`p-3 rounded-lg border ${
          currentRiskLevel === 'HIGH' ? 'bg-red-900/20 border-red-500/30' :
          currentRiskLevel === 'MEDIUM' ? 'bg-yellow-900/20 border-yellow-500/30' :
          'bg-green-900/20 border-green-500/30'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-300">Market Risk Status</span>
            <Badge className={getRiskLevelColor(currentRiskLevel)} variant="outline">
              {currentRiskLevel} RISK
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            {currentRiskLevel === 'HIGH' 
              ? 'High volatility detected. Position sizes reduced for capital protection.'
              : currentRiskLevel === 'MEDIUM'
              ? 'Moderate market conditions. Standard risk management applied.'
              : 'Low volatility environment. Normal position sizing active.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}