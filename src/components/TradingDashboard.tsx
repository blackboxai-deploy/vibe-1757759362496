"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { BotControls } from './BotControls';
import { PositionTable } from './PositionTable';
import { ProfitTracker } from './ProfitTracker';
import { AnalysisChart } from './AnalysisChart';
import { RiskMetrics } from './RiskMetrics';
import { BrokerConfiguration } from './BrokerConfiguration';
import { SimpleBrokerSetup } from './SimpleBrokerSetup';
import { BotState } from '@/types/trading';
import { BrokerConfig } from '@/types/broker';

export function TradingDashboard() {
  const [botState, setBotState] = useState<BotState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brokerConnected, setBrokerConnected] = useState(false);
  const [isConfiguringBroker, setIsConfiguringBroker] = useState(false);
  const [showBrokerConfig, setShowBrokerConfig] = useState(false);
  const [showFullBrokerConfig, setShowFullBrokerConfig] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const fetchBotStatus = async () => {
    try {
      const response = await fetch('/api/bot/status');
      const data = await response.json();
      
      if (data.success) {
        setBotState(data.data);
        setBrokerConnected(data.data.brokerConnected || false);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch bot status');
      }
    } catch (err) {
      setError('Network error: Unable to fetch bot status');
    } finally {
      setLoading(false);
    }
  };

  const handleBrokerConfiguration = async (config: BrokerConfig): Promise<boolean> => {
    setIsConfiguringBroker(true);
    try {
      const response = await fetch('/api/bot/configure-broker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBrokerConnected(true);
        setShowBrokerConfig(false);
        await fetchBotStatus();
        return true;
      } else {
        setError(data.message || 'Failed to configure broker');
        return false;
      }
    } catch (err) {
      setError('Network error: Unable to configure broker');
      return false;
    } finally {
      setIsConfiguringBroker(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    fetchBotStatus();
    
    // Poll for updates every 2 seconds when bot is running
    const interval = setInterval(() => {
      if (botState?.status.isRunning) {
        fetchBotStatus();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [botState?.status.isRunning]);

  const handleBotAction = async (action: 'start' | 'stop' | 'reset') => {
    setLoading(true);
    try {
      let endpoint = '';
      let method = 'POST';
      
      switch (action) {
        case 'start':
          endpoint = '/api/bot/start';
          break;
        case 'stop':
          endpoint = '/api/bot/stop';
          break;
        case 'reset':
          endpoint = '/api/bot/status';
          break;
      }
      
      const response = await fetch(endpoint, { method });
      const data = await response.json();
      
      if (data.success) {
        await fetchBotStatus();
      } else {
        setError(data.message || `Failed to ${action} bot`);
      }
    } catch (err) {
      setError(`Network error: Unable to ${action} bot`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !botState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading trading bot...</p>
        </div>
      </div>
    );
  }

  if (error && !botState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="bg-slate-800 border-red-500">
          <CardContent className="p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={fetchBotStatus} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!botState) return null;

  const profitPercentage = (botState.status.totalProfit / botState.config.initialCapital) * 100;
  const targetProgress = (botState.status.totalProfit / botState.config.targetProfit) * 100;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent mb-2">
            Smart Trading Bot
          </h1>
          <p className="text-slate-400 text-lg">
            AI-Powered Automated Trading • Target: ${botState.config.initialCapital} → ${botState.config.initialCapital + botState.config.targetProfit}
            {brokerConnected && <span className="text-green-400 ml-2">• Live Trading Active</span>}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="bg-red-900/20 border-red-500">
            <CardContent className="p-4">
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Broker Status */}
        <Card className={`${brokerConnected ? 'bg-green-900/20 border-green-500' : 'bg-yellow-900/20 border-yellow-500'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-300">Trading Mode</p>
                <p className={`font-semibold ${brokerConnected ? 'text-green-400' : 'text-yellow-400'}`}>
                  {brokerConnected ? 'Live Trading' : 'Simulation Mode'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {brokerConnected 
                    ? 'Connected to real broker - Real money trading' 
                    : 'Using simulated data - No real money at risk'}
                </p>
              </div>
              <Button
                variant={brokerConnected ? "outline" : "default"}
                size="sm"
                onClick={() => setShowBrokerConfig(true)}
                className={brokerConnected 
                  ? "border-green-400 text-green-400 hover:bg-green-400 hover:text-black" 
                  : "bg-yellow-600 hover:bg-yellow-700"}
              >
                {brokerConnected ? 'Manage' : 'Setup Broker'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bot Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Bot Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  botState.status.isRunning ? 'bg-green-500 animate-pulse' : 
                  botState.status.targetReached ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="font-semibold">
                  {botState.status.isRunning ? 'Running' : 
                   botState.status.targetReached ? 'Target Reached' : 'Stopped'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {botState.status.lastAction}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Current Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">
                ${botState.status.currentBalance.toFixed(2)}
              </p>
              <p className={`text-sm ${profitPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(1)}% 
                ({botState.status.totalProfit >= 0 ? '+' : ''}${botState.status.totalProfit.toFixed(2)})
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Target Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, targetProgress))}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {targetProgress.toFixed(0)}%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                ${botState.status.totalProfit.toFixed(2)} / $100.00
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Trading Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-white">
                {botState.status.tradesCount} Trades
              </p>
              <p className="text-sm text-slate-400">
                Win Rate: {botState.status.winRate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls and Analysis */}
          <div className="lg:col-span-1 space-y-6">
            {/* Simple Broker Setup */}
            {showBrokerConfig && !showFullBrokerConfig && (
              <SimpleBrokerSetup
                isConnected={brokerConnected}
                onShowFullConfig={() => setShowFullBrokerConfig(true)}
              />
            )}

            {/* Full Broker Configuration */}
            {showBrokerConfig && showFullBrokerConfig && botState && isClient && (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowFullBrokerConfig(false)}
                  className="text-slate-400 hover:text-white p-0 h-auto"
                >
                  ← Back to Simple Setup
                </Button>
                <BrokerConfiguration
                  onConfigureBroker={handleBrokerConfiguration}
                  isConnected={brokerConnected}
                  isConfiguring={isConfiguringBroker}
                />
              </div>
            )}
            <BotControls
              isRunning={botState.status.isRunning}
              targetReached={botState.status.targetReached}
              onStart={() => handleBotAction('start')}
              onStop={() => handleBotAction('stop')}
              onReset={() => handleBotAction('reset')}
              loading={loading}
            />

            <AnalysisChart
              marketData={botState.marketData}
              analysis={botState.analysis}
              indicators={botState.indicators}
            />

            <RiskMetrics
              riskMetrics={botState.riskMetrics}
              analysis={botState.analysis}
            />
          </div>

          {/* Right Column - Trading Activity */}
          <div className="lg:col-span-2 space-y-6">
            <ProfitTracker
              currentBalance={botState.status.currentBalance}
              initialCapital={botState.config.initialCapital}
              targetProfit={botState.config.targetProfit}
              totalProfit={botState.status.totalProfit}
              trades={botState.trades}
            />

            <PositionTable
              positions={botState.positions}
              currentPrice={botState.marketData.price}
            />

            {/* Recent Actions */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {botState.actions?.map((action, index) => (
                    <div key={`action-${index}-${action.timestamp}`} className="flex items-start gap-3 p-2 rounded-lg bg-slate-700/30">
                      <Badge variant={action.success ? "default" : "destructive"} className="text-xs">
                        {action.type}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">{action.details}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(action.timestamp).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </p>
                        {action.error && (
                          <p className="text-xs text-red-400">{action.error}</p>
                        )}
                      </div>
                    </div>
                  )) || (
                    <p className="text-slate-400 text-center py-4">No recent actions</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}