import { z } from 'zod';

export const TickSchema = z.object({
  ts: z.string().datetime(),
  exchange: z.string(),
  symbol: z.string(),
  last: z.number().optional(),
  bid: z.number().optional(),
  ask: z.number().optional(),
  bid_size: z.number().optional(),
  ask_size: z.number().optional(),
  trade_size: z.number().optional(),
});

export type Tick = z.infer<typeof TickSchema>;

export const ArticleSchema = z.object({
  id: z.number().optional(),
  url: z.string().url(),
  title: z.string(),
  ts_publish: z.string().datetime(),
  source: z.string().optional(),
  tickers: z.array(z.string()).default([]),
  lang: z.string().optional(),
  raw: z.record(z.any()).default({}),
});

export type Article = z.infer<typeof ArticleSchema>;

export const SentimentSchema = z.object({
  id: z.number().optional(),
  article_id: z.number(),
  model: z.string(),
  score: z.number(),
  confidence: z.number().optional(),
  tokens: z.record(z.any()).default({}),
  ts_ingested: z.string().datetime().optional(),
});

export type Sentiment = z.infer<typeof SentimentSchema>;

export const SignalSchema = z.object({
  id: z.number().optional(),
  ts: z.string().datetime(),
  symbol: z.string(),
  direction: z.enum(['buy', 'sell', 'watch']),
  score: z.number(),
  reasons: z.record(z.any()).default({}),
});

export type Signal = z.infer<typeof SignalSchema>;

export const AlertPolicySchema = z.object({
  symbol: z.string(),
  sentiment_threshold: z.number(),
  momentum_threshold: z.number(),
  volatility_min: z.number(),
  volatility_max: z.number(),
  cooldown_minutes: z.number().default(5),
  description: z.string(),
});

export type AlertPolicy = z.infer<typeof AlertPolicySchema>;

export const AlertSchema = z.object({
  id: z.number().optional(),
  policy: AlertPolicySchema,
  active: z.boolean().default(true),
  created_at: z.string().datetime().optional(),
});

export type Alert = z.infer<typeof AlertSchema>;

export const MicroFeaturesSchema = z.object({
  r_1s: z.number(), // 1-second return
  r_5s: z.number(), // 5-second return
  rv_30s: z.number(), // 30-second realized volatility proxy
  ofi_proxy: z.number(), // Order flow imbalance proxy
  sentiment_z: z.number(), // Z-score of sentiment
});

export type MicroFeatures = z.infer<typeof MicroFeaturesSchema>;

export const SSEMessageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('tick'),
    data: TickSchema,
  }),
  z.object({
    type: z.literal('ping'),
    data: z.object({ ts: z.string() }),
  }),
  z.object({
    type: z.literal('signal'),
    data: SignalSchema,
  }),
]);

export type SSEMessage = z.infer<typeof SSEMessageSchema>;

export const SubscriptionTierSchema = z.enum(['free', 'pro', 'enterprise']);

export const UserSubscriptionSchema = z.object({
  id: z.string(),
  tier: SubscriptionTierSchema,
  features: z.array(z.string()),
  expires_at: z.string().datetime().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type SubscriptionTier = z.infer<typeof SubscriptionTierSchema>;
export type UserSubscription = z.infer<typeof UserSubscriptionSchema>;

export const PortfolioPositionSchema = z.object({
  symbol: z.string(),
  quantity: z.number(),
  avg_price: z.number(),
  current_price: z.number(),
  unrealized_pnl: z.number(),
  realized_pnl: z.number(),
  last_updated: z.string().datetime(),
});

export type PortfolioPosition = z.infer<typeof PortfolioPositionSchema>;

export const PortfolioSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  positions: z.array(PortfolioPositionSchema),
  total_value: z.number(),
  total_pnl: z.number(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Portfolio = z.infer<typeof PortfolioSchema>;

export const BacktestConfigSchema = z.object({
  strategy_name: z.string(),
  symbols: z.array(z.string()),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  initial_capital: z.number(),
  commission: z.number().default(0.001),
  slippage: z.number().default(0.0005),
  walk_forward_periods: z.number().default(12),
});

export type BacktestConfig = z.infer<typeof BacktestConfigSchema>;

export const BacktestResultSchema = z.object({
  id: z.string(),
  config: BacktestConfigSchema,
  total_return: z.number(),
  sharpe_ratio: z.number(),
  max_drawdown: z.number(),
  win_rate: z.number(),
  profit_factor: z.number(),
  overfitting_score: z.number(),
  trades_count: z.number(),
  created_at: z.string().datetime(),
});

export type BacktestResult = z.infer<typeof BacktestResultSchema>;
