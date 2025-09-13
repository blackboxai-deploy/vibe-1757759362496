"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { BrokerConfig } from '@/types/broker';

interface BrokerConfigurationProps {
  onConfigureBroker: (config: BrokerConfig) => Promise<boolean>;
  isConnected: boolean;
  isConfiguring: boolean;
}

export function BrokerConfiguration({ onConfigureBroker, isConnected, isConfiguring }: BrokerConfigurationProps) {
  const [config, setConfig] = useState<Partial<BrokerConfig>>({
    name: '',
    type: 'MT4',
    apiKey: '',
    secretKey: '',
    serverUrl: '',
    accountId: '',
    testMode: true,
    maxLeverage: 100,
    minOrderSize: 0.01,
    supportedSymbols: ['BTC/USD', 'EUR/USD', 'GBP/USD', 'USD/JPY'],
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleConfigChange = (field: keyof BrokerConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!config.name || !config.apiKey || !config.serverUrl) {
      alert('Please fill in all required fields');
      return;
    }

    const fullConfig: BrokerConfig = {
      id: `broker_${Date.now()}`,
      name: config.name!,
      type: config.type!,
      apiKey: config.apiKey!,
      secretKey: config.secretKey,
      serverUrl: config.serverUrl!,
      accountId: config.accountId,
      testMode: config.testMode ?? true,
      maxLeverage: config.maxLeverage ?? 100,
      minOrderSize: config.minOrderSize ?? 0.01,
      supportedSymbols: config.supportedSymbols ?? ['BTC/USD'],
    };

    await onConfigureBroker(fullConfig);
  };

  const presetConfigurations = {
    'MT4 Demo': {
      type: 'MT4' as const,
      serverUrl: 'https://demo-mt4-server.com',
      maxLeverage: 500,
      minOrderSize: 0.01,
      testMode: true,
    },
    'MT5 Live': {
      type: 'MT5' as const,
      serverUrl: 'https://live-mt5-server.com',
      maxLeverage: 100,
      minOrderSize: 0.01,
      testMode: false,
    },
    'OANDA Live': {
      type: 'OANDA' as const,
      serverUrl: 'https://api-fxtrade.oanda.com',
      maxLeverage: 50,
      minOrderSize: 1,
      testMode: false,
    },
    'OANDA Demo': {
      type: 'OANDA' as const,
      serverUrl: 'https://api-fxpractice.oanda.com',
      maxLeverage: 50,
      minOrderSize: 1,
      testMode: true,
    },
  };

  const applyPreset = (presetName: string) => {
    const preset = presetConfigurations[presetName as keyof typeof presetConfigurations];
    if (preset) {
      setConfig(prev => ({ ...prev, ...preset }));
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <span>Broker Configuration</span>
          {isConnected && (
            <Badge className="bg-green-600 hover:bg-green-700">
              Connected
            </Badge>
          )}
          {!isConnected && config.apiKey && (
            <Badge variant="outline" className="text-slate-300">
              Not Connected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className={`p-3 rounded-lg border ${
          isConnected 
            ? 'bg-green-900/20 border-green-500/30' 
            : 'bg-slate-700/30 border-slate-600'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">Broker Status</span>
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-slate-500'
            }`} />
          </div>
          <p className="text-xs text-slate-400">
            {isConnected 
              ? 'Connected to broker - Real trading enabled' 
              : 'Configure broker connection for live trading'}
          </p>
        </div>

        {/* Quick Presets */}
        <div className="space-y-3">
          <Label className="text-slate-300">Quick Setup</Label>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(presetConfigurations).map((preset) => (
              <Button
                key={preset}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset)}
                className="text-xs bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
              >
                {preset}
              </Button>
            ))}
          </div>
        </div>

        {/* Basic Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="broker-name" className="text-slate-300">Broker Name *</Label>
            <Input
              id="broker-name"
              value={config.name || ''}
              onChange={(e) => handleConfigChange('name', e.target.value)}
              placeholder="My Broker"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="broker-type" className="text-slate-300">Broker Type *</Label>
            <Select value={config.type || 'MT4'} onValueChange={(value) => handleConfigChange('type', value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="MT4">MetaTrader 4</SelectItem>
                <SelectItem value="MT5">MetaTrader 5</SelectItem>
                <SelectItem value="OANDA">OANDA</SelectItem>
                <SelectItem value="INTERACTIVE_BROKERS">Interactive Brokers</SelectItem>
                <SelectItem value="ALPACA">Alpaca</SelectItem>
                <SelectItem value="BINANCE">Binance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-slate-300">API Key *</Label>
            <Input
              id="api-key"
              type="password"
              value={config.apiKey || ''}
              onChange={(e) => handleConfigChange('apiKey', e.target.value)}
              placeholder="Your API key"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="server-url" className="text-slate-300">Server URL *</Label>
            <Input
              id="server-url"
              value={config.serverUrl || ''}
              onChange={(e) => handleConfigChange('serverUrl', e.target.value)}
              placeholder="https://api.broker.com"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
        </div>

        {/* Test Mode Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
          <div>
            <Label className="text-slate-300">Test Mode</Label>
            <p className="text-xs text-slate-400">Use demo account for testing</p>
          </div>
          <button
            onClick={() => handleConfigChange('testMode', !config.testMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              config.testMode ? 'bg-blue-600' : 'bg-slate-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.testMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Advanced Configuration */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-slate-400 hover:text-white p-0 h-auto"
          >
            {showAdvanced ? '▼' : '▶'} Advanced Configuration
          </Button>
          
          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="secret-key" className="text-slate-300">Secret Key</Label>
                <Input
                  id="secret-key"
                  type="password"
                  value={config.secretKey || ''}
                  onChange={(e) => handleConfigChange('secretKey', e.target.value)}
                  placeholder="Your secret key (if required)"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-id" className="text-slate-300">Account ID</Label>
                <Input
                  id="account-id"
                  value={config.accountId || ''}
                  onChange={(e) => handleConfigChange('accountId', e.target.value)}
                  placeholder="Your account ID"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-leverage" className="text-slate-300">Max Leverage</Label>
                <Input
                  id="max-leverage"
                  type="number"
                  value={config.maxLeverage || 100}
                  onChange={(e) => handleConfigChange('maxLeverage', parseInt(e.target.value))}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="min-order-size" className="text-slate-300">Min Order Size</Label>
                <Input
                  id="min-order-size"
                  type="number"
                  step="0.001"
                  value={config.minOrderSize || 0.01}
                  onChange={(e) => handleConfigChange('minOrderSize', parseFloat(e.target.value))}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Configuration Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={isConfiguring || !config.name || !config.apiKey || !config.serverUrl}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isConfiguring ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Connecting...
              </div>
            ) : (
              'Connect to Broker'
            )}
          </Button>
          
          {isConnected && (
            <Button
              variant="outline"
              onClick={() => {/* Disconnect logic */}}
              className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
            >
              Disconnect
            </Button>
          )}
        </div>

        {/* Important Notes */}
        <div className="p-3 rounded-lg bg-yellow-900/20 border border-yellow-500/30">
          <h4 className="text-sm font-medium text-yellow-400 mb-2">⚠️ Important</h4>
          <div className="text-xs text-yellow-200 space-y-1">
            <p>• Always test with demo accounts before using live funds</p>
            <p>• Keep your API keys secure and never share them</p>
            <p>• Ensure your broker supports API trading</p>
            <p>• Monitor your positions and account balance regularly</p>
            <p>• The bot will place real trades when connected to a live account</p>
          </div>
        </div>

        {/* Demo Mode Notice */}
        {!config.apiKey && (
          <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-500/30">
            <h4 className="text-sm font-medium text-blue-400 mb-2">💡 Demo Mode</h4>
            <p className="text-xs text-blue-200">
              Without broker configuration, the bot runs in simulation mode with virtual trades. 
              Configure a broker to enable real trading.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}