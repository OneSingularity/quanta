'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Explanation {
  summary: string;
  confidence: number;
  timeWindow: string;
  keyFactors: Array<{
    type: 'price' | 'sentiment' | 'volume' | 'news';
    description: string;
    impact: 'positive' | 'negative' | 'neutral';
  }>;
  citations: Array<{
    title: string;
    url: string;
    relevance: number;
  }>;
}

export default function ExplainPanel() {
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [timeWindow, setTimeWindow] = useState('5m');

  const generateExplanation = useCallback(async () => {
    setIsLoading(true);

    try {
      const newsResponse = await fetch(`/api/worker-proxy/news/recent?symbol=${selectedSymbol}&limit=5`);

      const recentNews = newsResponse.ok ? await newsResponse.json() : [];

      const { generateExplanation: generateAIExplanation } = await import('../lib/webllm.js');
      
      const aiResult = await generateAIExplanation(
        selectedSymbol,
        timeWindow
      );

      const explanation: Explanation = {
        summary: aiResult.summary,
        confidence: aiResult.confidence,
        timeWindow: timeWindow,
        keyFactors: aiResult.keyFactors,
        citations: recentNews.slice(0, 3).map((article: unknown) => ({
          title: (article as { title: string }).title,
          url: (article as { url: string }).url,
          relevance: 0.8,
        })),
      };

      setExplanation(explanation);
    } catch (error) {
      console.error('Failed to generate explanation:', error);
      
      const fallbackExplanation: Explanation = {
        summary: `Analysis for ${selectedSymbol} over the last ${timeWindow} - AI analysis temporarily unavailable. Please try again later.`,
        confidence: 0.5,
        timeWindow: timeWindow,
        keyFactors: [
          {
            type: 'price',
            description: 'Real-time analysis unavailable',
            impact: 'neutral',
          },
        ],
        citations: [],
      };
      
      setExplanation(fallbackExplanation);
    }

    setIsLoading(false);
  }, [selectedSymbol, timeWindow]);

  useEffect(() => {
    generateExplanation();
  }, [generateExplanation]);

  const getFactorIcon = (type: string) => {
    switch (type) {
      case 'price': return '💰';
      case 'sentiment': return '😊';
      case 'volume': return '📊';
      case 'news': return '📰';
      default: return '📈';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Symbol
            </label>
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="SOL">Solana (SOL)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Window
            </label>
            <select
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="1m">Last 1 minute</option>
              <option value="5m">Last 5 minutes</option>
              <option value="15m">Last 15 minutes</option>
              <option value="1h">Last 1 hour</option>
            </select>
          </div>
        </div>

        <button
          onClick={generateExplanation}
          disabled={isLoading}
          className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Analyzing...</span>
            </div>
          ) : (
            'Refresh Analysis'
          )}
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <div className="skeleton w-full h-4"></div>
          <div className="skeleton w-5/6 h-4"></div>
          <div className="skeleton w-4/5 h-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="skeleton w-full h-16"></div>
            <div className="skeleton w-full h-16"></div>
          </div>
        </div>
      )}

      {/* Explanation Content */}
      {!isLoading && explanation && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-blue-900">AI Analysis Summary</h3>
              <div className="flex items-center space-x-2">
                <div className="text-sm text-blue-700">Confidence:</div>
                <div className="flex items-center space-x-1">
                  <div className="w-16 bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${explanation.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-blue-800">
                    {(explanation.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
            <p className="text-blue-800 leading-relaxed">{explanation.summary}</p>
          </div>

          {/* Key Factors */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Key Factors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {explanation.keyFactors.map((factor, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">{getFactorIcon(factor.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {factor.type}
                        </span>
                        <span className={`text-xs font-medium ${getImpactColor(factor.impact)}`}>
                          {factor.impact}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{factor.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Citations */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Sources & Citations ({explanation.citations.length})
            </h3>
            <div className="space-y-2">
              {explanation.citations.map((citation, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {citation.title}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <span className="text-xs text-gray-500">Relevance:</span>
                    <div className="w-12 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-green-500 h-1.5 rounded-full"
                        style={{ width: `${citation.relevance * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      {(citation.relevance * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <span className="text-yellow-600 text-sm">⚠️</span>
              <div className="text-xs text-yellow-800">
                <strong>Disclaimer:</strong> This analysis is generated by AI for research and educational purposes only.
                Not financial advice. Always do your own research before making investment decisions.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !explanation && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🤖</div>
          <div className="text-lg font-medium mb-2">AI Analysis Ready</div>
          <div className="text-sm">
            Select a symbol and time window to generate insights
          </div>
        </div>
      )}
    </div>
  );
}
