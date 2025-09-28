import { MicroFeatures, Signal, AlertPolicy } from './schemas';

export interface SignalEngineConfig {
  sentiment_threshold: number; // θ1
  momentum_threshold: number; // θ2
  volatility_min: number;
  volatility_max: number;
  cooldown_minutes: number;
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
    
    return Math.min(1.0, sentimentWeight + momentumWeight + ofiWeight);
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
