import { createClient } from '@supabase/supabase-js';
import { TickSchema, ArticleSchema, SentimentSchema, SSEMessage } from '@quanta/core';
import { WebSocketAggregator } from './websocket-aggregator';
import { NewsIngestor } from './news-ingestor';
import { SSEHandler } from './sse-handler';

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SENTRY_DSN_WORKER: string;
  SENTRY_ENV: string;
  ALPHAVANTAGE_API_KEY?: string;
  TWELVEDATA_API_KEY?: string;
  QUANTA_CACHE: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === '/health') {
        return new Response('ok', { status: 200 });
      }

      if (path === '/version') {
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
        const kvTest = await env.QUANTA_CACHE.get('test');
        
        return Response.json({
          env: env.SENTRY_ENV,
          supabase: !!supabase,
          kv: env.QUANTA_CACHE !== undefined,
          build: 'dev', // Will be replaced in CI
        });
      }

      if (path === '/sse/ticks') {
        const symbols = url.searchParams.get('symbol')?.split('|') || ['BTC-USDT', 'ETH-USDT', 'SOL-USDT'];
        const sseHandler = new SSEHandler(env);
        return sseHandler.handleSSE(symbols);
      }

      if (path === '/signals') {
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
        const { data, error } = await supabase
          .from('signals')
          .select('*')
          .order('ts', { ascending: false })
          .limit(10);
        
        if (error) {
          console.error('Error fetching signals:', error);
          return new Response(JSON.stringify({ error: 'Failed to fetch signals' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify(data || []), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (path === '/news/recent') {
        const symbol = url.searchParams.get('symbol') || 'BTC';
        const limit = parseInt(url.searchParams.get('limit') || '30');
        
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
        const { data, error } = await supabase
          .from('articles')
          .select(`
            *,
            sentiments (*)
          `)
          .contains('tickers', [symbol])
          .order('ts_publish', { ascending: false })
          .limit(limit);

        if (error) {
          throw error;
        }

        return Response.json(data || []);
      }

      if (path === '/alerts' && request.method === 'POST') {
        const policy = await request.json();
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
        
        const { data, error } = await supabase
          .from('alerts')
          .insert({ policy })
          .select()
          .single();

        if (error) {
          throw error;
        }

        return Response.json(data);
      }

      return new Response('quanta-stream-proxy online', { status: 200 });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    try {
      console.log('Running scheduled news ingestion');
      const newsIngestor = new NewsIngestor(env);
      await newsIngestor.ingestNews();
    } catch (error) {
      console.error('Scheduled task error:', error);
    }
  },
};
