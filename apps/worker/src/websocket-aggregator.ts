import { Tick, adaptCoinbaseTick, adaptBinanceTick } from '@quanta/core';

export class RestApiAggregator {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private onTickCallback: ((tick: Tick) => void) | undefined;
  private kvCache: KVNamespace;
  private lastFetchTimes = new Map<string, number>();
  private readonly POLL_INTERVAL = 2000;
  private readonly CACHE_TTL = 60;

  constructor(kvCache: KVNamespace, onTick?: (tick: Tick) => void) {
    this.kvCache = kvCache;
    this.onTickCallback = onTick;
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    
    this.fetchAllTickers().catch(console.error);
    
    this.intervalId = setInterval(async () => {
      if (this.isRunning) {
        this.fetchAllTickers().catch(console.error);
      }
    }, this.POLL_INTERVAL);
  }

  stop(): void {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async fetchAllTickers(): Promise<void> {
    const symbols = [
      { exchange: 'coinbase', symbol: 'BTC-USD' },
      { exchange: 'coinbase', symbol: 'ETH-USD' },
      { exchange: 'coinbase', symbol: 'SOL-USD' },
    ];

    await Promise.allSettled(
      symbols.map(({ exchange, symbol }) => this.fetchTicker(exchange, symbol))
    );
  }

  private async fetchTicker(exchange: string, symbol: string): Promise<void> {
    const cacheKey = `ticker:${exchange}:${symbol}`;
    const now = Date.now();
    const lastFetch = this.lastFetchTimes.get(cacheKey) || 0;

    if (now - lastFetch < 2000) {
      try {
        const cached = await this.kvCache.get(cacheKey);
        if (cached) {
          const tick = JSON.parse(cached);
          if (this.onTickCallback) {
            this.onTickCallback(tick);
          }
          return;
        }
      } catch (error) {
        console.error(`KV cache read error for ${cacheKey}:`, error);
      }
    }

    try {
      let url: string;
      let adapter: (data: any) => Tick | null;

      if (exchange === 'coinbase') {
        url = `https://api.exchange.coinbase.com/products/${symbol}/ticker`;
        adapter = (data) => adaptCoinbaseTick({ ...data, type: 'ticker', product_id: symbol });
      } else if (exchange === 'binance') {
        url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`;
        adapter = (data) => adaptBinanceTick({ ...data, s: symbol, E: Date.now() });
      } else {
        return;
      }

      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Failed to fetch ${exchange} ${symbol}: ${response.status}`);
        return;
      }

      const data = await response.json();
      const tick = adapter(data);

      if (tick && this.onTickCallback) {
        this.onTickCallback(tick);
        
        this.kvCache.put(cacheKey, JSON.stringify(tick), { expirationTtl: this.CACHE_TTL })
          .catch(error => console.error(`KV cache write error for ${cacheKey}:`, error));
        this.lastFetchTimes.set(cacheKey, now);
      }
    } catch (error) {
      console.error(`Error fetching ${exchange} ${symbol}:`, error);
    }
  }
}

export const WebSocketAggregator = RestApiAggregator;
