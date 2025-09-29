'use client';

import React, { useState, useEffect } from 'react';
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
}

export default function AttentionFeed() {
  const [cards, setCards] = useState<AttentionCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      case 'buy': return 'border-green-500 bg-green-50';
      case 'sell': return 'border-red-500 bg-red-50';
      case 'watch': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'buy': return '📈';
      case 'sell': return '📉';
      case 'watch': return '👀';
      default: return '❓';
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
          <div key={i} className="p-4 border rounded-lg animate-pulse">
            <div className="skeleton w-3/4 h-5 mb-2"></div>
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
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🔍</div>
          <div className="text-sm">No attention cards</div>
          <div className="text-xs text-gray-400 mt-1">
            Waiting for signal triggers...
          </div>
        </div>
      ) : (
        cards.map((card) => (
          <div
            key={card.id}
            className={`attention-card-enter border-l-4 rounded-lg p-4 ${getDirectionColor(card.direction)}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getDirectionIcon(card.direction)}</span>
                <span className="font-bold text-lg">{card.symbol}</span>
                <span className={`badge ${
                  card.direction === 'buy' ? 'badge-success' :
                  card.direction === 'sell' ? 'badge-danger' :
                  'badge-warning'
                }`}>
                  {card.direction.toUpperCase()}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  Score: {(card.score * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-600">
                  TTL: {formatTimeToLive(card.timeToLive)}
                </div>
              </div>
            </div>

            {/* Reasons */}
            <div className="space-y-2 mb-3">
              {Object.entries(card.reasons as Record<string, string>).map(([key, reason]) => (
                <div key={key} className="text-sm">
                  <span className="font-medium text-gray-700">
                    {key.replace('_', ' ').toUpperCase()}:
                  </span>
                  <span className="ml-2 text-gray-600">{reason}</span>
                </div>
              ))}
            </div>

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

            {/* Confidence */}
            <div className="mt-3 pt-2 border-t">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Confidence</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${card.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-700 font-medium">
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
