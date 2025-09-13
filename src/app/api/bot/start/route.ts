import { NextRequest, NextResponse } from 'next/server';
import { enhancedTradingBot } from '@/lib/enhanced-trading-bot';

export async function POST(_request: NextRequest) {
  try {
    const success = await enhancedTradingBot.start();
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Trading bot started successfully',
        status: enhancedTradingBot.getStatus(),
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to start trading bot',
        error: 'Bot may already be running or target already reached',
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error starting bot:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}