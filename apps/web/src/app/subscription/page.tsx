'use client';

import React from 'react';
import { useSubscription, SubscriptionBadge } from '../../contexts/SubscriptionContext';
import Navigation from '../../components/Navigation';

interface SubscriptionPlan {
  tier: 'free' | 'pro' | 'enterprise';
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export default function SubscriptionPage() {
  const { tier } = useSubscription();

  const plans: SubscriptionPlan[] = [
    {
      tier: 'free',
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started with crypto trading',
      features: [
        'Basic live market data',
        'Simple trading signals',
        'AI market analysis',
        'Basic alerts',
        'Community support',
      ],
    },
    {
      tier: 'pro',
      name: 'Pro',
      price: '$29',
      description: 'Advanced features for serious traders',
      features: [
        'Everything in Free',
        'Advanced portfolio analytics',
        'Multi-timeframe signals',
        'Strategy backtesting',
        'Custom alert builder',
        'Real-time monitoring',
        'Correlation analysis',
        'Risk metrics & VaR',
        'Priority support',
      ],
      popular: true,
    },
    {
      tier: 'enterprise',
      name: 'Enterprise',
      price: '$99',
      description: 'Complete trading infrastructure for professionals',
      features: [
        'Everything in Pro',
        'API access',
        'White-label options',
        'Unlimited backtests',
        'Advanced risk management',
        'Model marketplace',
        'Custom integrations',
        'Dedicated support',
        'Advanced ML models',
      ],
    },
  ];

  const usageStats = {
    signalsGenerated: 1247,
    backtestsRun: 23,
    alertsTriggered: 89,
    apiCalls: tier === 'enterprise' ? 15420 : 0,
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold glow-text mb-2">Subscription Management</h1>
          <p className="text-gray-400">Manage your plan and view usage statistics</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2">
            <div className="card-premium mb-6">
              <h2 className="text-xl font-semibold text-cosmic-300 mb-6">Choose Your Plan</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.tier}
                    className={`relative p-6 border-2 transition-all duration-300 hover:scale-105 ${
                      plan.tier === 'free' 
                        ? 'subscription-tier-free' 
                        : plan.tier === 'pro'
                        ? 'subscription-tier-pro'
                        : 'subscription-tier-enterprise'
                    } ${tier === plan.tier ? 'ring-2 ring-cosmic-500' : ''}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="badge-cosmic px-4 py-1">MOST POPULAR</span>
                      </div>
                    )}
                    
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-cosmic-300 mb-2">{plan.name}</h3>
                      <div className="text-3xl font-bold glow-text mb-2">
                        {plan.price}
                        {plan.price !== '$0' && <span className="text-lg text-gray-400">/month</span>}
                      </div>
                      <p className="text-gray-400 text-sm">{plan.description}</p>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <div className="w-4 h-4 bg-cosmic-600 flex items-center justify-center mr-3">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      className={`w-full ${
                        tier === plan.tier
                          ? 'btn-secondary cursor-not-allowed'
                          : plan.tier === 'pro'
                          ? 'btn-quantum'
                          : plan.tier === 'enterprise'
                          ? 'btn-orbital'
                          : 'btn-primary'
                      }`}
                      disabled={tier === plan.tier}
                    >
                      {tier === plan.tier ? 'Current Plan' : `Upgrade to ${plan.name}`}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-premium">
              <h2 className="text-xl font-semibold text-cosmic-300 mb-4">Billing Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Payment Method</label>
                  <div className="flex items-center space-x-3 p-3 bg-void-200 border border-cosmic-800/50">
                    <div className="w-8 h-5 bg-cosmic-600 flex items-center justify-center text-white text-xs font-bold">
                      VISA
                    </div>
                    <span className="text-gray-300">•••• •••• •••• 4242</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Next Billing Date</label>
                  <div className="p-3 bg-void-200 border border-cosmic-800/50 text-gray-300">
                    February 15, 2024
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card-premium">
              <h2 className="text-xl font-semibold text-cosmic-300 mb-4">Current Plan</h2>
              <div className="text-center mb-4">
                <SubscriptionBadge tier={tier} />
                <div className="text-2xl font-bold glow-text mt-2">
                  {plans.find(p => p.tier === tier)?.name}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status</span>
                  <span className="text-success font-medium">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Renewal</span>
                  <span className="text-cosmic-400 font-medium">Auto</span>
                </div>
              </div>
            </div>

            <div className="card-premium">
              <h2 className="text-xl font-semibold text-cosmic-300 mb-4">Usage This Month</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Signals Generated</span>
                  <span className="text-cosmic-400 font-medium">{usageStats.signalsGenerated.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Backtests Run</span>
                  <span className="text-nebula-400 font-medium">{usageStats.backtestsRun}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Alerts Triggered</span>
                  <span className="text-quantum-400 font-medium">{usageStats.alertsTriggered}</span>
                </div>
                {tier === 'enterprise' && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">API Calls</span>
                    <span className="text-success font-medium">{usageStats.apiCalls.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="card-premium">
              <h2 className="text-xl font-semibold text-cosmic-300 mb-4">Account Actions</h2>
              <div className="space-y-3">
                <button className="btn-secondary w-full">
                  Download Invoice
                </button>
                <button className="btn-secondary w-full">
                  Update Payment Method
                </button>
                <button className="btn-secondary w-full text-danger">
                  Cancel Subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
