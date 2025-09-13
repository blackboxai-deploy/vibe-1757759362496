"use client";


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SimpleBrokerSetupProps {
  isConnected: boolean;
  onShowFullConfig: () => void;
}

export function SimpleBrokerSetup({ isConnected, onShowFullConfig }: SimpleBrokerSetupProps) {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <span>Broker Connection</span>
          {isConnected ? (
            <Badge className="bg-green-600 hover:bg-green-700">Connected</Badge>
          ) : (
            <Badge variant="outline" className="text-slate-300">Simulation Mode</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`p-4 rounded-lg border ${
          isConnected 
            ? 'bg-green-900/20 border-green-500/30' 
            : 'bg-blue-900/20 border-blue-500/30'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className={`font-medium ${isConnected ? 'text-green-400' : 'text-blue-400'}`}>
                {isConnected ? 'Live Trading Active' : 'Demo Mode Active'}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {isConnected 
                  ? 'Trading with real money through connected broker'
                  : 'Safe simulation environment - no real money at risk'
                }
              </p>
            </div>
            <div className={`w-4 h-4 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-blue-500'
            } animate-pulse`} />
          </div>
          
          {!isConnected && (
            <div className="space-y-3">
              <p className="text-sm text-blue-200">
                The bot is currently running in simulation mode using virtual funds. 
                To enable live trading with real money, configure a broker connection.
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 rounded bg-slate-700/50">
                  <p className="text-xs text-slate-400">Virtual Balance</p>
                  <p className="text-sm font-medium text-white">$50.00</p>
                </div>
                <div className="text-center p-2 rounded bg-slate-700/50">
                  <p className="text-xs text-slate-400">Risk Level</p>
                  <p className="text-sm font-medium text-yellow-400">No Risk</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {!isConnected && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-300">Popular Brokers</h4>
            <div className="grid grid-cols-1 gap-2">
              {[
                { name: 'MetaTrader 4/5', description: 'Most popular forex platform' },
                { name: 'OANDA', description: 'Regulated forex & CFD broker' },
                { name: 'Interactive Brokers', description: 'Professional trading platform' },
                { name: 'Alpaca', description: 'Commission-free stock trading' },
              ].map((broker) => (
                <div key={broker.name} className="flex items-center justify-between p-2 rounded bg-slate-700/30">
                  <div>
                    <p className="text-sm text-white">{broker.name}</p>
                    <p className="text-xs text-slate-400">{broker.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onShowFullConfig}
                    className="text-xs bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500"
                  >
                    Setup
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-slate-700">
          <Button
            onClick={onShowFullConfig}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isConnected ? 'Manage Broker Settings' : 'Configure Broker Connection'}
          </Button>
        </div>

        {!isConnected && (
          <div className="text-xs text-slate-500 space-y-1">
            <p>💡 <strong>Tip:</strong> Start with demo accounts to test the bot safely</p>
            <p>⚠️ <strong>Important:</strong> Only use funds you can afford to lose</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}