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
  if (message.type !== 'ticker') return null;
  
  return {
    ts: new Date().toISOString(),
    exchange: 'coinbase',
    symbol: normalizeSymbol('coinbase', message.product_id),
    last: parseFloat(message.price),
    bid: parseFloat(message.best_bid),
    ask: parseFloat(message.best_ask),
    bid_size: parseFloat(message.best_bid_size),
    ask_size: parseFloat(message.best_ask_size),
    trade_size: parseFloat(message.last_size),
  };
}

export function adaptBinanceTick(message: any): Tick | null {
  if (!message.s) return null; // No symbol
  
  return {
    ts: new Date(message.E).toISOString(), // Event time
    exchange: 'binance',
    symbol: normalizeSymbol('binance', message.s),
    last: parseFloat(message.c), // Close price
    bid: parseFloat(message.b), // Best bid
    ask: parseFloat(message.a), // Best ask
    bid_size: parseFloat(message.B), // Best bid quantity
    ask_size: parseFloat(message.A), // Best ask quantity
    trade_size: parseFloat(message.q), // Last quantity
  };
}
