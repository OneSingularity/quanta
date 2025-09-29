'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SubscriptionTier, UserSubscription } from '../../../../packages/core/src/schemas';

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  tier: SubscriptionTier;
  hasFeature: (feature: string) => boolean;
  isLoading: boolean;
  upgradeRequired: (feature: string) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);


const TIER_FEATURES: Record<SubscriptionTier, string[]> = {
  free: [
    'basic_signals',
    'live_data',
    'ai_analysis',
  ],
  pro: [
    'basic_signals',
    'live_data',
    'ai_analysis',
    'portfolio_analytics',
    'advanced_signals',
    'backtesting',
    'custom_alerts',
    'real_time_monitoring',
    'correlation_analysis',
    'risk_metrics',
  ],
  enterprise: [
    'basic_signals',
    'live_data',
    'ai_analysis',
    'portfolio_analytics',
    'advanced_signals',
    'backtesting',
    'custom_alerts',
    'real_time_monitoring',
    'correlation_analysis',
    'risk_metrics',
    'api_access',
    'white_label',
    'priority_support',
    'unlimited_backtests',
    'advanced_risk_management',
    'model_marketplace',
  ],
};

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const mockSubscription: UserSubscription = {
      id: 'user_123',
      tier: 'free',
      features: TIER_FEATURES.free,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setSubscription(mockSubscription);
    setIsLoading(false);
  }, []);

  const hasFeature = (feature: string): boolean => {
    if (!subscription) return false;
    return subscription.features.includes(feature);
  };

  const upgradeRequired = (feature: string): boolean => {
    if (!subscription) return true;
    return !hasFeature(feature);
  };

  const tier = subscription?.tier || 'free';

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        tier,
        hasFeature,
        isLoading,
        upgradeRequired,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

export function FeatureGate({ 
  feature, 
  children, 
  fallback 
}: { 
  feature: string; 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  const { hasFeature } = useSubscription();

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="upgrade-prompt p-6 text-center">
      <div className="text-quantum-gradient text-lg font-semibold mb-2">
        Premium Feature
      </div>
      <p className="text-gray-400 mb-4">
        Upgrade to Pro or Enterprise to access this feature
      </p>
      <button className="btn-quantum">
        Upgrade Now
      </button>
    </div>
  );
}

export function SubscriptionBadge({ tier }: { tier: SubscriptionTier }) {
  const badgeClasses = {
    free: 'badge bg-gray-600/20 text-gray-300 border-gray-600/30',
    pro: 'badge-cosmic',
    enterprise: 'badge-quantum',
  };

  const tierLabels = {
    free: 'Free',
    pro: 'Pro',
    enterprise: 'Enterprise',
  };

  return (
    <span className={badgeClasses[tier]}>
      {tierLabels[tier]}
    </span>
  );
}
