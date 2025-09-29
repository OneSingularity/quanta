import { Tick } from './schemas';

export const SYMBOL_MAPS = {
  coinbase: {
    'BTC-USD': 'BTC-USDT',
    'ETH-USD': 'ETH-USDT',
    'SOL-USD': 'SOL-USDT',
  },
  binance: {
    'BTCUSDT': 'BTC-USDT',
    'ETHUSDT': 'ETH-USDT',
    'SOLUSDT': 'SOL-USDT',
  },
} as const;

export function normalizeSymbol(exchange: string, symbol: string): string {
  if (exchange === 'coinbase' && symbol in SYMBOL_MAPS.coinbase) {
    return SYMBOL_MAPS.coinbase[symbol as keyof typeof SYMBOL_MAPS.coinbase];
  }
  if (exchange === 'binance' && symbol in SYMBOL_MAPS.binance) {
    return SYMBOL_MAPS.binance[symbol as keyof typeof SYMBOL_MAPS.binance];
  }
  return symbol;
}

export function adaptCoinbaseTick(message: any): Tick | null {
  if (message.type === 'ticker' || message.price) {
    return {
      ts: new Date().toISOString(),
      exchange: 'coinbase',
      symbol: normalizeSymbol('coinbase', message.product_id || message.symbol),
      last: parseFloat(message.price),
      bid: parseFloat(message.best_bid || message.bid),
      ask: parseFloat(message.best_ask || message.ask),
      bid_size: parseFloat(message.best_bid_size || message.bid_size || '0'),
      ask_size: parseFloat(message.best_ask_size || message.ask_size || '0'),
      trade_size: parseFloat(message.last_size || message.size || '0'),
    };
  }
  return null;
}

export function adaptBinanceTick(message: any): Tick | null {
  if (message.s || message.symbol) {
    return {
      ts: new Date(message.E || Date.now()).toISOString(),
      exchange: 'binance',
      symbol: normalizeSymbol('binance', message.s || message.symbol),
      last: parseFloat(message.c || message.lastPrice),
      bid: parseFloat(message.b || message.bidPrice),
      ask: parseFloat(message.a || message.askPrice),
      bid_size: parseFloat(message.B || message.bidQty || '0'),
      ask_size: parseFloat(message.A || message.askQty || '0'),
      trade_size: parseFloat(message.q || message.volume || '0'),
    };
  }
  return null;
}
