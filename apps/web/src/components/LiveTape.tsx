'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Tick } from '@quanta/core';

interface TickWithFeatures extends Tick {
  change?: number;
  changePercent?: number;
  r_1s?: number;
  r_5s?: number;
  rv_30s?: number;
}

export default function LiveTape() {
  const [ticks, setTicks] = useState<Map<string, TickWithFeatures>>(new Map());
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const eventSourceRef = useRef<EventSource | null>(null);
  const priceHistoryRef = useRef<Map<string, Array<{ ts: number; price: number }>>>(new Map());

  useEffect(() => {
    connectToSSE();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const connectToSSE = () => {
    setConnectionStatus('connecting');
    
    const eventSource = new EventSource('/api/worker-proxy/sse/ticks?symbol=BTC-USDT|ETH-USDT|SOL-USDT');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setConnectionStatus('connected');
    };

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'tick') {
          const tick = message.data as Tick;
          updateTick(tick);
        } else if (message.type === 'ping') {
          console.log('Heartbeat received');
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = () => {
      setConnectionStatus('disconnected');
      setTimeout(() => {
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          connectToSSE();
        }
      }, 3000);
    };
  };

  const updateTick = (newTick: Tick) => {
    const symbol = newTick.symbol;
    const currentTime = Date.now();
    const currentPrice = newTick.last || 0;

    if (!priceHistoryRef.current.has(symbol)) {
      priceHistoryRef.current.set(symbol, []);
    }
    
    const history = priceHistoryRef.current.get(symbol)!;
    history.push({ ts: currentTime, price: currentPrice });
    
    const fiveMinutesAgo = currentTime - 5 * 60 * 1000;
    const filteredHistory = history.filter(h => h.ts >= fiveMinutesAgo);
    priceHistoryRef.current.set(symbol, filteredHistory);

    const features = calculateFeatures(symbol, currentPrice, currentTime);

    setTicks(prev => {
      const updated = new Map(prev);
      const prevTick = updated.get(symbol);
      
      const tickWithFeatures: TickWithFeatures = {
        ...newTick,
        change: prevTick ? currentPrice - (prevTick.last || 0) : 0,
        changePercent: prevTick && prevTick.last ? ((currentPrice - prevTick.last) / prevTick.last) * 100 : 0,
        ...features,
      };
      
      updated.set(symbol, tickWithFeatures);
      return updated;
    });
  };

  const calculateFeatures = (symbol: string, currentPrice: number, currentTime: number) => {
    const history = priceHistoryRef.current.get(symbol) || [];
    
    if (history.length < 2) {
      return { r_1s: 0, r_5s: 0, rv_30s: 0 };
    }

    const oneSecondAgo = currentTime - 1000;
    const price1sAgo = findPriceAtTime(history, oneSecondAgo);
    const r_1s = price1sAgo ? (currentPrice - price1sAgo) / price1sAgo : 0;

    const fiveSecondsAgo = currentTime - 5000;
    const price5sAgo = findPriceAtTime(history, fiveSecondsAgo);
    const r_5s = price5sAgo ? (currentPrice - price5sAgo) / price5sAgo : 0;

    const thirtySecondsAgo = currentTime - 30000;
    const recentPrices = history.filter(h => h.ts >= thirtySecondsAgo);
    const rv_30s = calculateRealizedVolatility(recentPrices);

    return { r_1s, r_5s, rv_30s };
  };

  const findPriceAtTime = (history: Array<{ ts: number; price: number }>, targetTime: number): number | null => {
    if (history.length === 0) return null;
    
    let closest = history[0];
    if (!closest) return null;
    
    let minDiff = Math.abs(closest.ts - targetTime);

    for (const point of history) {
      const diff = Math.abs(point.ts - targetTime);
      if (diff < minDiff) {
        minDiff = diff;
        closest = point;
      }
    }

    return closest?.price || null;
  };

  const calculateRealizedVolatility = (prices: Array<{ ts: number; price: number }>): number => {
    if (prices.length < 2) return 0;

    let sumSquaredReturns = 0;
    for (let i = 1; i < prices.length; i++) {
      const currentPrice = prices[i];
      const prevPrice = prices[i-1];
      
      if (!currentPrice || !prevPrice || prevPrice.price === 0) continue;
      
      const ret = (currentPrice.price - prevPrice.price) / prevPrice.price;
      sumSquaredReturns += ret * ret;
    }

    return Math.sqrt(sumSquaredReturns / (prices.length - 1));
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500 live-indicator' :
            connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
            'bg-red-500'
          }`}></div>
          <span className="text-sm text-gray-600 capitalize">{connectionStatus}</span>
        </div>
        <span className="text-xs text-gray-500">
          {Array.from(ticks.values()).length} symbols
        </span>
      </div>

      {/* Tick Data */}
      <div className="space-y-2">
        {Array.from(ticks.values()).map((tick) => (
          <div key={tick.symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="font-semibold text-gray-900 w-20">
                {tick.symbol.replace('-USDT', '')}
              </div>
              <div className="text-lg font-mono">
                ${formatPrice(tick.last || 0)}
              </div>
              <div className={`text-sm font-medium ${getChangeColor(tick.changePercent || 0)}`}>
                {formatPercent(tick.changePercent || 0)}
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-xs text-gray-600">
              <div className="text-center">
                <div className="text-gray-500">1s</div>
                <div className={getChangeColor((tick.r_1s || 0) * 100)}>
                  {formatPercent((tick.r_1s || 0) * 100)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">5s</div>
                <div className={getChangeColor((tick.r_5s || 0) * 100)}>
                  {formatPercent((tick.r_5s || 0) * 100)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">RV30s</div>
                <div>{((tick.rv_30s || 0) * 100).toFixed(3)}%</div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">Spread</div>
                <div>
                  {tick.ask && tick.bid ? 
                    ((tick.ask - tick.bid) / tick.last! * 100).toFixed(3) + '%' : 
                    'N/A'
                  }
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {ticks.size === 0 && connectionStatus === 'connected' && (
        <div className="text-center py-8 text-gray-500">
          <div className="animate-pulse">Waiting for live data...</div>
        </div>
      )}

      {connectionStatus === 'disconnected' && (
        <div className="text-center py-8 text-red-600">
          <div>Connection lost. Attempting to reconnect...</div>
        </div>
      )}
    </div>
  );
}
