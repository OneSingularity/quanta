'use client';

import React, { useState, useEffect } from 'react';
import { FeatureGate, useSubscription } from '../../contexts/SubscriptionContext';
import Navigation from '../../components/Navigation';

interface CorrelationData {
  symbol1: string;
  symbol2: string;
  correlation: number;
}

interface PortfolioMetrics {
  totalValue: number;
  totalPnL: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  var95: number;
}

interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  weight: number;
}

export default function PortfolioPage() {
  const { hasFeature } = useSubscription();
  const [portfolioMetrics, setPortfolioMetrics] = useState<PortfolioMetrics>({
    totalValue: 125420.50,
    totalPnL: 8420.50,
    sharpeRatio: 1.85,
    maxDrawdown: -12.3,
    volatility: 18.7,
    var95: -2850.00,
  });

  const [positions, setPositions] = useState<Position[]>([
    { symbol: 'BTC', quantity: 2.5, avgPrice: 42000, currentPrice: 43500, unrealizedPnL: 3750, weight: 65.2 },
    { symbol: 'ETH', quantity: 15.0, avgPrice: 2800, currentPrice: 2950, unrealizedPnL: 2250, weight: 26.5 },
    { symbol: 'SOL', quantity: 100, avgPrice: 85, currentPrice: 92, unrealizedPnL: 700, weight: 5.5 },
    { symbol: 'AVAX', quantity: 50, avgPrice: 35, currentPrice: 38, unrealizedPnL: 150, weight: 2.8 },
  ]);

  const [correlationMatrix, setCorrelationMatrix] = useState<CorrelationData[]>([
    { symbol1: 'BTC', symbol2: 'ETH', correlation: 0.85 },
    { symbol1: 'BTC', symbol2: 'SOL', correlation: 0.72 },
    { symbol1: 'BTC', symbol2: 'AVAX', correlation: 0.68 },
    { symbol1: 'ETH', symbol2: 'SOL', correlation: 0.78 },
    { symbol1: 'ETH', symbol2: 'AVAX', correlation: 0.74 },
    { symbol1: 'SOL', symbol2: 'AVAX', correlation: 0.82 },
  ]);

  const getCorrelationColor = (correlation: number) => {
    if (correlation > 0.8) return 'text-danger';
    if (correlation > 0.6) return 'text-warning';
    return 'text-success';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold glow-text mb-2">Portfolio Analytics</h1>
          <p className="text-gray-400">Advanced portfolio management and risk analysis</p>
        </div>

        <FeatureGate feature="portfolio_analytics">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <div className="card-premium mb-6">
                <h2 className="text-xl font-semibold text-cosmic-300 mb-4">Portfolio Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="metric-card p-4">
                    <div className="text-sm text-gray-400 mb-1">Total Value</div>
                    <div className="text-2xl font-bold text-cosmic-300">
                      {formatCurrency(portfolioMetrics.totalValue)}
                    </div>
                  </div>
                  <div className="metric-card p-4">
                    <div className="text-sm text-gray-400 mb-1">Total P&L</div>
                    <div className={`text-2xl font-bold ${portfolioMetrics.totalPnL > 0 ? 'text-success' : 'text-danger'}`}>
                      {formatCurrency(portfolioMetrics.totalPnL)}
                    </div>
                  </div>
                  <div className="metric-card p-4">
                    <div className="text-sm text-gray-400 mb-1">Sharpe Ratio</div>
                    <div className="text-2xl font-bold text-nebula-400">
                      {portfolioMetrics.sharpeRatio.toFixed(2)}
                    </div>
                  </div>
                  <div className="metric-card p-4">
                    <div className="text-sm text-gray-400 mb-1">Max Drawdown</div>
                    <div className="text-2xl font-bold text-danger">
                      {formatPercentage(portfolioMetrics.maxDrawdown)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-premium">
                <h2 className="text-xl font-semibold text-cosmic-300 mb-4">Current Positions</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-cosmic-800/30">
                        <th className="text-left py-3 text-gray-400 font-medium">Asset</th>
                        <th className="text-right py-3 text-gray-400 font-medium">Quantity</th>
                        <th className="text-right py-3 text-gray-400 font-medium">Avg Price</th>
                        <th className="text-right py-3 text-gray-400 font-medium">Current Price</th>
                        <th className="text-right py-3 text-gray-400 font-medium">P&L</th>
                        <th className="text-right py-3 text-gray-400 font-medium">Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map((position) => (
                        <tr key={position.symbol} className="border-b border-cosmic-800/20">
                          <td className="py-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-cosmic-600 flex items-center justify-center text-white font-bold text-sm">
                                {position.symbol.charAt(0)}
                              </div>
                              <span className="font-medium text-cosmic-300">{position.symbol}</span>
                            </div>
                          </td>
                          <td className="text-right py-4 text-gray-300">{position.quantity}</td>
                          <td className="text-right py-4 text-gray-300">{formatCurrency(position.avgPrice)}</td>
                          <td className="text-right py-4 text-gray-300">{formatCurrency(position.currentPrice)}</td>
                          <td className={`text-right py-4 font-medium ${position.unrealizedPnL > 0 ? 'text-success' : 'text-danger'}`}>
                            {formatCurrency(position.unrealizedPnL)}
                          </td>
                          <td className="text-right py-4 text-gray-300">{position.weight.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card-premium">
                <h2 className="text-xl font-semibold text-cosmic-300 mb-4">Risk Metrics</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Volatility (30d)</span>
                    <span className="text-warning font-medium">{portfolioMetrics.volatility}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">VaR (95%)</span>
                    <span className="text-danger font-medium">{formatCurrency(portfolioMetrics.var95)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Beta (vs BTC)</span>
                    <span className="text-nebula-400 font-medium">0.92</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Information Ratio</span>
                    <span className="text-cosmic-400 font-medium">1.23</span>
                  </div>
                </div>
              </div>

              <div className="card-premium">
                <h2 className="text-xl font-semibold text-cosmic-300 mb-4">Correlation Matrix</h2>
                <div className="space-y-3">
                  {correlationMatrix.map((corr, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">
                        {corr.symbol1} × {corr.symbol2}
                      </span>
                      <span className={`font-medium ${getCorrelationColor(corr.correlation)}`}>
                        {corr.correlation.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-premium">
                <h2 className="text-xl font-semibold text-cosmic-300 mb-4">Rebalancing</h2>
                <p className="text-gray-400 text-sm mb-4">
                  Portfolio is 8.2% overweight in BTC. Consider rebalancing.
                </p>
                <button className="btn-orbital w-full">
                  Optimize Allocation
                </button>
              </div>
            </div>
          </div>
        </FeatureGate>
      </div>
    </div>
  );
}
