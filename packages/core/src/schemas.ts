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
