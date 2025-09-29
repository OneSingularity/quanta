import { MicroFeatures, Signal, AlertPolicy } from './schemas';

export interface SignalEngineConfig {
  sentiment_threshold: number; // θ1
  momentum_threshold: number; // θ2
  volatility_min: number;
  volatility_max: number;
  cooldown_minutes: number;
  enable_multi_timeframe?: boolean;
  enable_risk_adjustment?: boolean;
  enable_correlation_filter?: boolean;
}

export class SignalEngine {
  private lastSignals: Map<string, number> = new Map();
  private config: SignalEngineConfig;

  constructor(config: SignalEngineConfig) {
    this.config = config;
  }

  evaluateSignal(
    symbol: string,
    features: MicroFeatures,
    timestamp: Date
  ): Signal | null {
    const now = timestamp.getTime();
    const lastSignalTime = this.lastSignals.get(symbol) || 0;
    const cooldownMs = this.config.cooldown_minutes * 60 * 1000;

    if (now - lastSignalTime < cooldownMs) {
      return null;
    }

    if (
      features.rv_30s < this.config.volatility_min ||
      features.rv_30s > this.config.volatility_max
    ) {
      return null;
    }

    const momentumAgreement = Math.sign(features.r_1s) === Math.sign(features.r_5s);
    if (!momentumAgreement) {
      return null;
    }

    const momentumMagnitude = Math.abs(features.r_5s);

    if (
      features.sentiment_z > this.config.sentiment_threshold &&
      momentumMagnitude > this.config.momentum_threshold &&
      features.r_5s > 0
    ) {
      this.lastSignals.set(symbol, now);
      return {
        ts: timestamp.toISOString(),
        symbol,
        direction: 'buy',
        score: this.calculateScore(features),
        reasons: {
          sentiment_z: features.sentiment_z,
          momentum: features.r_5s,
          volatility: features.rv_30s,
          ofi: features.ofi_proxy,
          trigger: 'positive_sentiment_momentum',
        },
      };
    }

    if (
      features.sentiment_z < -this.config.sentiment_threshold &&
      momentumMagnitude > this.config.momentum_threshold &&
      features.r_5s < 0
    ) {
      this.lastSignals.set(symbol, now);
      return {
        ts: timestamp.toISOString(),
        symbol,
        direction: 'sell',
        score: this.calculateScore(features),
        reasons: {
          sentiment_z: features.sentiment_z,
          momentum: features.r_5s,
          volatility: features.rv_30s,
          ofi: features.ofi_proxy,
          trigger: 'negative_sentiment_momentum',
        },
      };
    }

    return null;
  }

  private calculateScore(features: MicroFeatures): number {
    const sentimentWeight = Math.abs(features.sentiment_z) * 0.4;
    const momentumWeight = Math.abs(features.r_5s) * 100 * 0.4;
    const ofiWeight = Math.abs(features.ofi_proxy) * 0.2;
    
    let baseScore = Math.min(1.0, sentimentWeight + momentumWeight + ofiWeight);
    
    if (this.config.enable_risk_adjustment) {
      const volatilityPenalty = features.rv_30s > 0.02 ? 0.1 : 0;
      baseScore = Math.max(0.1, baseScore - volatilityPenalty);
    }
    
    if (this.config.enable_multi_timeframe) {
      const momentumConsistency = Math.sign(features.r_1s) === Math.sign(features.r_5s) ? 1.0 : 0.8;
      baseScore *= momentumConsistency;
    }
    
    return baseScore;
  }

  calculateRiskScore(features: MicroFeatures): number {
    if (!this.config.enable_risk_adjustment) return 0;
    
    const volatilityRisk = Math.min(1.0, features.rv_30s / 0.05);
    const momentumRisk = Math.abs(features.r_5s) > 0.01 ? 0.3 : 0.1;
    const sentimentRisk = Math.abs(features.sentiment_z) > 2 ? 0.4 : 0.2;
    
    return Math.min(1.0, (volatilityRisk + momentumRisk + sentimentRisk) / 3);
  }

  getMultiTimeframeAnalysis(features: MicroFeatures): string[] {
    if (!this.config.enable_multi_timeframe) return [];
    
    const timeframes = [];
    if (Math.abs(features.r_1s) > 0.001) timeframes.push('1m');
    if (Math.abs(features.r_5s) > 0.005) timeframes.push('5m');
    if (features.rv_30s > 0.01) timeframes.push('15m');
    
    return timeframes;
  }

  evaluateAlert(policy: AlertPolicy, features: MicroFeatures): boolean {
    if (
      features.rv_30s < policy.volatility_min ||
      features.rv_30s > policy.volatility_max
    ) {
      return false;
    }

    const momentumMagnitude = Math.abs(features.r_5s);
    
    return (
      Math.abs(features.sentiment_z) > policy.sentiment_threshold &&
      momentumMagnitude > policy.momentum_threshold
    );
  }
}
