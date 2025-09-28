import { Tick, adaptCoinbaseTick, adaptBinanceTick } from '@quanta/core';

export class WebSocketAggregator {
  private coinbaseWS: WebSocket | null = null;
  private binanceWS: WebSocket | null = null;
  private reconnectAttempts = new Map<string, number>();
  private maxReconnectAttempts = 5;
  private baseReconnectDelay = 1000;
  private onTickCallback: ((tick: Tick) => void) | undefined;

  constructor(onTick?: (tick: Tick) => void) {
    this.onTickCallback = onTick;
  }

  async start(): Promise<void> {
    await Promise.all([
      this.connectCoinbase(),
      this.connectBinance(),
    ]);
  }

  stop(): void {
    if (this.coinbaseWS) {
      this.coinbaseWS.close();
      this.coinbaseWS = null;
    }
    if (this.binanceWS) {
      this.binanceWS.close();
      this.binanceWS = null;
    }
  }

  private async connectCoinbase(): Promise<void> {
    const exchange = 'coinbase';
    const attempts = this.reconnectAttempts.get(exchange) || 0;

    if (attempts >= this.maxReconnectAttempts) {
      console.error(`Max reconnect attempts reached for ${exchange}`);
      return;
    }

    try {
      this.coinbaseWS = new WebSocket('wss://ws-feed.exchange.coinbase.com');

      this.coinbaseWS.addEventListener('open', () => {
        console.log('Coinbase WebSocket connected');
        this.reconnectAttempts.set(exchange, 0);
        
        this.coinbaseWS?.send(JSON.stringify({
          type: 'subscribe',
          product_ids: ['BTC-USD', 'ETH-USD', 'SOL-USD'],
          channels: ['ticker'],
        }));
      });

      this.coinbaseWS.addEventListener('message', (event) => {
        try {
          const message = JSON.parse(event.data);
          const tick = adaptCoinbaseTick(message);
          if (tick && this.onTickCallback) {
            this.onTickCallback(tick);
          }
        } catch (error) {
          console.error('Error processing Coinbase message:', error);
        }
      });

      this.coinbaseWS.addEventListener('close', () => {
        console.log('Coinbase WebSocket disconnected');
        this.scheduleReconnect(exchange, () => this.connectCoinbase());
      });

      this.coinbaseWS.addEventListener('error', (error) => {
        console.error('Coinbase WebSocket error:', error);
      });

    } catch (error) {
      console.error('Failed to connect to Coinbase:', error);
      this.scheduleReconnect(exchange, () => this.connectCoinbase());
    }
  }

  private async connectBinance(): Promise<void> {
    const exchange = 'binance';
    const attempts = this.reconnectAttempts.get(exchange) || 0;

    if (attempts >= this.maxReconnectAttempts) {
      console.error(`Max reconnect attempts reached for ${exchange}`);
      return;
    }

    try {
      const streams = ['btcusdt@ticker', 'ethusdt@ticker', 'solusdt@ticker'];
      const streamUrl = `wss://stream.binance.com:9443/ws/${streams.join('/')}`;
      
      this.binanceWS = new WebSocket(streamUrl);

      this.binanceWS.addEventListener('open', () => {
        console.log('Binance WebSocket connected');
        this.reconnectAttempts.set(exchange, 0);
      });

      this.binanceWS.addEventListener('message', (event) => {
        try {
          const message = JSON.parse(event.data);
          const tick = adaptBinanceTick(message.data || message);
          if (tick && this.onTickCallback) {
            this.onTickCallback(tick);
          }
        } catch (error) {
          console.error('Error processing Binance message:', error);
        }
      });

      this.binanceWS.addEventListener('close', () => {
        console.log('Binance WebSocket disconnected');
        this.scheduleReconnect(exchange, () => this.connectBinance());
      });

      this.binanceWS.addEventListener('error', (error) => {
        console.error('Binance WebSocket error:', error);
      });

    } catch (error) {
      console.error('Failed to connect to Binance:', error);
      this.scheduleReconnect(exchange, () => this.connectBinance());
    }
  }

  private scheduleReconnect(exchange: string, reconnectFn: () => Promise<void>): void {
    const attempts = this.reconnectAttempts.get(exchange) || 0;
    this.reconnectAttempts.set(exchange, attempts + 1);

    const delay = this.baseReconnectDelay * Math.pow(2, attempts) + Math.random() * 1000;
    
    setTimeout(() => {
      console.log(`Attempting to reconnect ${exchange} (attempt ${attempts + 1})`);
      reconnectFn();
    }, delay);
  }
}
