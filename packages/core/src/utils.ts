import { Tick, MicroFeatures } from './schemas';

export class FeatureExtractor {
  private priceHistory: Map<string, number[]> = new Map();
  private timestamps: Map<string, number[]> = new Map();
  private sentimentHistory: Map<string, number[]> = new Map();

  addTick(tick: Tick): void {
    if (!tick.last) return;

    const symbol = tick.symbol;
    const price = tick.last;
    const timestamp = new Date(tick.ts).getTime();

    if (!this.priceHistory.has(symbol)) {
      this.priceHistory.set(symbol, []);
      this.timestamps.set(symbol, []);
    }

    const prices = this.priceHistory.get(symbol)!;
    const times = this.timestamps.get(symbol)!;

    prices.push(price);
    times.push(timestamp);

    const cutoff = timestamp - 60000;
    while (times.length > 0 && times[0]! < cutoff) {
      times.shift();
      prices.shift();
    }
  }

  addSentiment(symbol: string, score: number): void {
    if (!this.sentimentHistory.has(symbol)) {
      this.sentimentHistory.set(symbol, []);
    }

    const sentiments = this.sentimentHistory.get(symbol)!;
    sentiments.push(score);

    if (sentiments.length > 100) {
      sentiments.shift();
    }
  }

  extractFeatures(symbol: string, tick: Tick): MicroFeatures | null {
    const prices = this.priceHistory.get(symbol);
    const times = this.timestamps.get(symbol);
    const sentiments = this.sentimentHistory.get(symbol);

    if (!prices || !times || prices.length < 2) {
      return null;
    }

    const currentTime = new Date(tick.ts).getTime();
    const currentPrice = tick.last!;

    const r_1s = this.calculateReturn(prices, times, currentTime, 1000);
    const r_5s = this.calculateReturn(prices, times, currentTime, 5000);

    const rv_30s = this.calculateRealizedVolatility(prices, times, currentTime, 30000);

    const ofi_proxy = this.calculateOFIProxy(tick);

    const sentiment_z = this.calculateSentimentZScore(sentiments || []);

    return {
      r_1s,
      r_5s,
      rv_30s,
      ofi_proxy,
      sentiment_z,
    };
  }

  private calculateReturn(
    prices: number[],
    times: number[],
    currentTime: number,
    windowMs: number
  ): number {
    const targetTime = currentTime - windowMs;
    let closestIndex = 0;

    for (let i = 0; i < times.length; i++) {
      if (Math.abs(times[i]! - targetTime) < Math.abs(times[closestIndex]! - targetTime)) {
        closestIndex = i;
      }
    }

    const oldPrice = prices[closestIndex];
    const newPrice = prices[prices.length - 1];

    if (!oldPrice || !newPrice || oldPrice === 0) return 0;

    return (newPrice - oldPrice) / oldPrice;
  }

  private calculateRealizedVolatility(
    prices: number[],
    times: number[],
    currentTime: number,
    windowMs: number
  ): number {
    const targetTime = currentTime - windowMs;
    const recentPrices = [];

    for (let i = 0; i < times.length; i++) {
      if (times[i]! >= targetTime) {
        recentPrices.push(prices[i]!);
      }
    }

    if (recentPrices.length < 2) return 0;

    let sumSquaredReturns = 0;
    for (let i = 1; i < recentPrices.length; i++) {
      const ret = (recentPrices[i]! - recentPrices[i - 1]!) / recentPrices[i - 1]!;
      sumSquaredReturns += ret * ret;
    }

    return Math.sqrt(sumSquaredReturns);
  }

  private calculateOFIProxy(tick: Tick): number {
    if (!tick.bid_size || !tick.ask_size) return 0;
    
    const total = tick.bid_size + tick.ask_size;
    if (total === 0) return 0;
    
    return (tick.bid_size - tick.ask_size) / total;
  }

  private calculateSentimentZScore(sentiments: number[]): number {
    if (sentiments.length < 2) return 0;

    const mean = sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;
    const variance = sentiments.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / sentiments.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return 0;

    const latestSentiment = sentiments[sentiments.length - 1]!;
    return (latestSentiment - mean) / stdDev;
  }
}

export function dedupe(url: string, content: string): string {
  let hash = 0;
  const str = url + content;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}
