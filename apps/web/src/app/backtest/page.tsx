'use client';

import React, { useState } from 'react';
import { FeatureGate, useSubscription } from '../../contexts/SubscriptionContext';
import Navigation from '../../components/Navigation';

interface BacktestResult {
  id: string;
  strategyName: string;
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  overfittingScore: number;
  tradesCount: number;
  createdAt: string;
}

export default function BacktestPage() {
  const { hasFeature } = useSubscription();
  const [isRunning, setIsRunning] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState('rsi_momentum');
  
  const [backtestResults, setBacktestResults] = useState<BacktestResult[]>([
    {
      id: '1',
      strategyName: 'RSI Momentum',
      totalReturn: 24.5,
      sharpeRatio: 1.85,
      maxDrawdown: -8.2,
      winRate: 68.5,
      profitFactor: 1.92,
      overfittingScore: 15.2,
      tradesCount: 142,
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      strategyName: 'Mean Reversion',
      totalReturn: 18.7,
      sharpeRatio: 1.42,
      maxDrawdown: -12.1,
      winRate: 72.3,
      profitFactor: 1.68,
      overfittingScore: 28.7,
      tradesCount: 89,
      createdAt: '2024-01-14T15:45:00Z',
    },
    {
      id: '3',
      strategyName: 'Breakout Scanner',
      totalReturn: 31.2,
      sharpeRatio: 2.15,
      maxDrawdown: -6.8,
      winRate: 58.9,
      profitFactor: 2.34,
      overfittingScore: 42.1,
      tradesCount: 67,
      createdAt: '2024-01-13T09:15:00Z',
    },
  ]);

  const strategies = [
    { value: 'rsi_momentum', label: 'RSI Momentum Strategy' },
    { value: 'mean_reversion', label: 'Mean Reversion Strategy' },
    { value: 'breakout_scanner', label: 'Breakout Scanner' },
    { value: 'sentiment_fusion', label: 'Sentiment Fusion (Pro)' },
    { value: 'ml_ensemble', label: 'ML Ensemble (Enterprise)' },
  ];

  const runBacktest = async () => {
    setIsRunning(true);
    
    setTimeout(() => {
      const newResult: BacktestResult = {
        id: Date.now().toString(),
        strategyName: strategies.find(s => s.value === selectedStrategy)?.label || 'Unknown',
        totalReturn: Math.random() * 40 - 10,
        sharpeRatio: Math.random() * 2 + 0.5,
        maxDrawdown: -(Math.random() * 15 + 5),
        winRate: Math.random() * 30 + 50,
        profitFactor: Math.random() * 2 + 0.8,
        overfittingScore: Math.random() * 50,
        tradesCount: Math.floor(Math.random() * 200 + 50),
        createdAt: new Date().toISOString(),
      };
      
      setBacktestResults([newResult, ...backtestResults]);
      setIsRunning(false);
    }, 3000);
  };

  const getOverfittingColor = (score: number) => {
    if (score > 35) return 'text-danger';
    if (score > 20) return 'text-warning';
    return 'text-success';
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold glow-text mb-2">Strategy Backtesting</h1>
          <p className="text-gray-400">Walk-forward analysis with overfitting detection</p>
        </div>

        <FeatureGate feature="backtesting">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="card-premium mb-6">
                <h2 className="text-xl font-semibold text-cosmic-300 mb-4">Backtest Configuration</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Strategy</label>
                    <select 
                      value={selectedStrategy}
                      onChange={(e) => setSelectedStrategy(e.target.value)}
                      className="input-cosmic w-full"
                    >
                      {strategies.map((strategy) => (
                        <option key={strategy.value} value={strategy.value}>
                          {strategy.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Time Period</label>
                    <select className="input-cosmic w-full">
                      <option value="1y">Last 1 Year</option>
                      <option value="2y">Last 2 Years</option>
                      <option value="3y">Last 3 Years</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Initial Capital</label>
                    <input 
                      type="number" 
                      defaultValue={100000}
                      className="input-cosmic w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Commission (%)</label>
                    <input 
                      type="number" 
                      defaultValue={0.1}
                      step={0.01}
                      className="input-cosmic w-full"
                    />
                  </div>
                </div>

                <button 
                  onClick={runBacktest}
                  disabled={isRunning}
                  className={`btn-quantum w-full ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isRunning ? 'Running Backtest...' : 'Run Backtest'}
                </button>
              </div>

              <div className="card-premium">
                <h2 className="text-xl font-semibold text-cosmic-300 mb-4">Backtest Results</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-cosmic-800/30">
                        <th className="text-left py-3 text-gray-400 font-medium">Strategy</th>
                        <th className="text-right py-3 text-gray-400 font-medium">Return</th>
                        <th className="text-right py-3 text-gray-400 font-medium">Sharpe</th>
                        <th className="text-right py-3 text-gray-400 font-medium">Max DD</th>
                        <th className="text-right py-3 text-gray-400 font-medium">Win Rate</th>
                        <th className="text-right py-3 text-gray-400 font-medium">Overfit Score</th>
                        <th className="text-right py-3 text-gray-400 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backtestResults.map((result) => (
                        <tr key={result.id} className="border-b border-cosmic-800/20 hover:bg-void-200/50">
                          <td className="py-4">
                            <span className="font-medium text-cosmic-300">{result.strategyName}</span>
                            <div className="text-xs text-gray-400">{result.tradesCount} trades</div>
                          </td>
                          <td className={`text-right py-4 font-medium ${result.totalReturn > 0 ? 'text-success' : 'text-danger'}`}>
                            {formatPercentage(result.totalReturn)}
                          </td>
                          <td className="text-right py-4 text-nebula-400 font-medium">
                            {result.sharpeRatio.toFixed(2)}
                          </td>
                          <td className="text-right py-4 text-danger font-medium">
                            {formatPercentage(result.maxDrawdown)}
                          </td>
                          <td className="text-right py-4 text-gray-300">
                            {result.winRate.toFixed(1)}%
                          </td>
                          <td className={`text-right py-4 font-medium ${getOverfittingColor(result.overfittingScore)}`}>
                            {result.overfittingScore.toFixed(1)}
                          </td>
                          <td className="text-right py-4 text-gray-400 text-sm">
                            {formatDate(result.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card-premium">
                <h2 className="text-xl font-semibold text-cosmic-300 mb-4">Anti-Overfitting</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Walk-Forward Periods</span>
                    <span className="text-cosmic-400 font-medium">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Out-of-Sample %</span>
                    <span className="text-cosmic-400 font-medium">25%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Monte Carlo Runs</span>
                    <span className="text-cosmic-400 font-medium">1000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Purged CV</span>
                    <span className="text-success font-medium">Enabled</span>
                  </div>
                </div>
              </div>

              <div className="card-premium">
                <h2 className="text-xl font-semibold text-cosmic-300 mb-4">Performance Metrics</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Profit Factor</span>
                    <span className="text-success font-medium">1.92</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Calmar Ratio</span>
                    <span className="text-nebula-400 font-medium">2.98</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Sortino Ratio</span>
                    <span className="text-cosmic-400 font-medium">2.45</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Tail Ratio</span>
                    <span className="text-quantum-400 font-medium">1.18</span>
                  </div>
                </div>
              </div>

              <div className="card-premium">
                <h2 className="text-xl font-semibold text-cosmic-300 mb-4">Risk Analysis</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">VaR (95%)</span>
                    <span className="text-danger font-medium">-2.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">CVaR (95%)</span>
                    <span className="text-danger font-medium">-4.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Skewness</span>
                    <span className="text-warning font-medium">-0.15</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Kurtosis</span>
                    <span className="text-warning font-medium">3.42</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FeatureGate>
      </div>
    </div>
  );
}
