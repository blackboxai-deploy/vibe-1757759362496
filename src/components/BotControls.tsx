"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BotControlsProps {
  isRunning: boolean;
  targetReached: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  loading: boolean;
}

export function BotControls({
  isRunning,
  targetReached,
  onStart,
  onStop,
  onReset,
  loading
}: BotControlsProps) {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Bot Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Control Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={onStart}
            disabled={loading || isRunning}
            className={`${
              isRunning 
                ? 'bg-green-600 hover:bg-green-700' 
                : targetReached
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-semibold h-12`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Loading...
              </div>
            ) : isRunning ? (
              '● Running'
            ) : targetReached ? (
              '✓ Target Reached'
            ) : (
              '▶ Start Bot'
            )}
          </Button>

          <Button
            onClick={onStop}
            disabled={loading || !isRunning}
            variant="destructive"
            className="font-semibold h-12"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Stopping...
              </div>
            ) : (
              '⏹ Stop Bot'
            )}
          </Button>
        </div>

        {/* Reset Button */}
        <Button
          onClick={onReset}
          disabled={loading || isRunning}
          variant="outline"
          className="w-full bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white"
        >
          🔄 Reset to Initial State
        </Button>

        {/* Status Messages */}
        <div className="mt-4 p-3 rounded-lg bg-slate-700/50 border border-slate-600">
          <div className="text-sm space-y-2">
            {targetReached && (
              <div className="text-yellow-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                Target of $100 profit reached! Bot stopped automatically.
              </div>
            )}
            
            {isRunning && (
              <div className="text-green-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Bot is actively analyzing market and managing positions.
              </div>
            )}
            
            {!isRunning && !targetReached && (
              <div className="text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                Bot is ready to start trading. Click Start to begin.
              </div>
            )}
          </div>
        </div>

        {/* Control Information */}
        <div className="text-xs text-slate-400 space-y-1">
          <p><strong>Hard Start:</strong> Starts bot immediately with full automation</p>
          <p><strong>Hard Stop:</strong> Immediately stops bot and closes all positions</p>
          <p><strong>Auto-Stop:</strong> Bot stops automatically when $100 profit is reached</p>
        </div>
      </CardContent>
    </Card>
  );
}