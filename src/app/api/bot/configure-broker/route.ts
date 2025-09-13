import { NextRequest, NextResponse } from 'next/server';
import { enhancedTradingBot } from '@/lib/enhanced-trading-bot';
import { BrokerConfig } from '@/types/broker';

export async function POST(request: NextRequest) {
  try {
    const brokerConfig: BrokerConfig = await request.json();
    
    // Validate required fields
    if (!brokerConfig.name || !brokerConfig.apiKey || !brokerConfig.serverUrl) {
      return NextResponse.json({
        success: false,
        message: 'Missing required broker configuration fields',
        error: 'name, apiKey, and serverUrl are required',
      }, { status: 400 });
    }

    // Configure broker
    const success = await enhancedTradingBot.configureBroker(brokerConfig);
    
    if (success) {
      const accountInfo = await enhancedTradingBot.getBrokerAccountInfo();
      
      return NextResponse.json({
        success: true,
        message: `Successfully connected to ${brokerConfig.name}`,
        data: {
          brokerConnected: true,
          accountInfo,
          status: enhancedTradingBot.getStatus(),
        },
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `Failed to connect to ${brokerConfig.name}`,
        error: 'Broker connection failed - check credentials and server URL',
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Broker configuration error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET(_request: NextRequest) {
  try {
    const isConnected = enhancedTradingBot.getBrokerConnection();
    const accountInfo = isConnected ? await enhancedTradingBot.getBrokerAccountInfo() : null;
    
    return NextResponse.json({
      success: true,
      data: {
        brokerConnected: isConnected,
        accountInfo,
      },
    });
  } catch (error) {
    console.error('Error getting broker status:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}