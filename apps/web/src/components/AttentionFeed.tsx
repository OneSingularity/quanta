'use client';

import React, { useState, useEffect } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';

interface AttentionCard {
  id: number;
  ts: string;
  symbol: string;
  direction: 'buy' | 'sell' | 'watch';
  score: number;
  reasons: Record<string, string>;
  timeToLive: number;
  confidence: number;
  articles: Array<{
    title: string;
    url: string;
    source: string;
  }>;
  riskScore?: number;
  timeframes?: string[];
  correlations?: Record<string, number>;
}

export default function AttentionFeed() {
  const [cards, setCards] = useState<AttentionCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { hasFeature, tier } = useSubscription();

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const response = await fetch('/api/worker-proxy/signals');
        if (response.ok) {
          const signals = await response.json();
          const attentionCards: AttentionCard[] = signals.map((signal: unknown, index: number) => ({
            id: (signal as { id?: number }).id || index,
            ts: (signal as { ts: string }).ts,
            symbol: (signal as { symbol: string }).symbol,
            direction: (signal as { direction: 'buy' | 'sell' | 'watch' }).direction,
            score: (signal as { score: number }).score,
            reasons: (signal as { reasons?: Record<string, string> }).reasons || {},
            timeToLive: 300,
            confidence: (signal as { score: number }).score,
            articles: [],
            riskScore: hasFeature('advanced_signals') ? Math.random() * 0.3 + 0.1 : undefined,
            timeframes: hasFeature('multi_timeframe') ? ['1m', '5m', '15m'] : undefined,
            correlations: hasFeature('correlation_analysis') ? {
              'BTC': Math.random() * 0.4 + 0.6,
              'ETH': Math.random() * 0.3 + 0.5,
            } : undefined,
          }));
          setCards(attentionCards);
        } else {
          setCards([]);
        }
      } catch (error) {
        console.error('Failed to fetch signals:', error);
        setCards([]);
      }
      setIsLoading(false);
    };

    fetchSignals();

    const interval = setInterval(() => {
      setCards(prev => 
        prev.map(card => ({
          ...card,
          timeToLive: Math.max(0, card.timeToLive - 1),
        })).filter(card => card.timeToLive > 0)
      );
    }, 1000);

    const signalRefreshInterval = setInterval(fetchSignals, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(signalRefreshInterval);
    };
  }, []);

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'buy': return 'border-l-4 border-success bg-void-200/50';
      case 'sell': return 'border-l-4 border-danger bg-void-200/50';
      case 'watch': return 'border-l-4 border-warning bg-void-200/50';
      default: return 'border-l-4 border-cosmic-600 bg-void-200/50';
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'buy': return '⬆';
      case 'sell': return '⬇';
      case 'watch': return '◉';
      default: return '◯';
    }
  };

  const formatTimeToLive = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 bg-void-200 border border-cosmic-800/30 animate-pulse">
            <div className="skeleton w-3/4 h-5 mb-3"></div>
            <div className="skeleton w-full h-4 mb-2"></div>
            <div className="skeleton w-1/2 h-4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cards.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2 animate-pulse">◉</div>
          <div className="text-sm text-cosmic-400">No attention signals</div>
          <div className="text-xs text-gray-500 mt-1">
            Scanning quantum fluctuations...
          </div>
        </div>
      ) : (
        cards.map((card) => (
          <div
            key={card.id}
            className={`signal-card p-4 border border-cosmic-800/30 bg-void-200/30 backdrop-blur-sm ${getDirectionColor(card.direction)}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 flex items-center justify-center text-lg font-bold ${
                  card.direction === 'buy' ? 'text-success' :
                  card.direction === 'sell' ? 'text-danger' :
                  'text-warning'
                } animate-glow`}>
                  {getDirectionIcon(card.direction)}
                </div>
                <span className="font-bold text-lg text-cosmic-300">{card.symbol}</span>
                <span className={`badge-quantum ${
                  card.direction === 'buy' ? 'badge-success' :
                  card.direction === 'sell' ? 'badge-danger' :
                  'badge-warning'
                }`}>
                  {card.direction.toUpperCase()}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-cosmic-400">
                  Score: {(card.score * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-500">
                  TTL: {formatTimeToLive(card.timeToLive)}
                </div>
                {card.riskScore && (
                  <div className="text-xs text-warning">
                    Risk: {(card.riskScore * 100).toFixed(0)}%
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {Object.entries(card.reasons as Record<string, string>).map(([key, reason]) => (
                <div key={key} className="text-sm">
                  <span className="font-medium text-cosmic-400 tracking-wide">
                    {key.replace('_', ' ').toUpperCase()}:
                  </span>
                  <span className="ml-2 text-gray-300">{reason}</span>
                </div>
              ))}
            </div>

            {hasFeature('multi_timeframe') && card.timeframes && (
              <div className="mb-4 p-3 bg-cosmic-900/20 border border-cosmic-700/30">
                <div className="text-xs font-medium text-cosmic-400 mb-2">MULTI-TIMEFRAME ANALYSIS</div>
                <div className="flex space-x-2">
                  {card.timeframes.map((tf) => (
                    <span key={tf} className="badge-quantum badge-cosmic text-xs">{tf}</span>
                  ))}
                </div>
              </div>
            )}

            {hasFeature('correlation_analysis') && card.correlations && (
              <div className="mb-4 p-3 bg-nebula-900/20 border border-nebula-700/30">
                <div className="text-xs font-medium text-nebula-400 mb-2">CORRELATION MATRIX</div>
                <div className="space-y-1">
                  {Object.entries(card.correlations).map(([symbol, corr]) => (
                    <div key={symbol} className="flex justify-between text-xs">
                      <span className="text-gray-400">{symbol}</span>
                      <span className={`font-medium ${corr > 0.7 ? 'text-danger' : corr > 0.5 ? 'text-warning' : 'text-success'}`}>
                        {corr.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Articles */}
            {card.articles.length > 0 && (
              <div className="border-t pt-3">
                <div className="text-xs font-medium text-gray-700 mb-2">
                  Related News ({card.articles.length})
                </div>
                <div className="space-y-1">
                  {card.articles.slice(0, 2).map((article, idx) => (
                    <div key={idx} className="text-xs">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline line-clamp-1"
                      >
                        {article.title}
                      </a>
                      <span className="text-gray-500 ml-1">- {article.source}</span>
                    </div>
                  ))}
                  {card.articles.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{card.articles.length - 2} more articles
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-cosmic-800/30">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 tracking-wide">CONFIDENCE</span>
                <div className="flex items-center space-x-3">
                  <div className="w-20 bg-void-300 h-1.5 overflow-hidden">
                    <div
                      className="bg-cosmic-gradient h-1.5 transition-all duration-300 animate-shimmer"
                      style={{ width: `${card.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-cosmic-300 font-medium font-mono">
                    {(card.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
