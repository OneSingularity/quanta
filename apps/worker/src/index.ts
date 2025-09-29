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

const ALLOW_ORIGIN = '*'; // or put your Pages prod url for tighter CORS

function addCORS(h: Headers) {
  h.set('Access-Control-Allow-Origin', ALLOW_ORIGIN);
  h.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  h.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  h.set('Access-Control-Allow-Credentials', 'true');
}

function corsResponse(body: BodyInit, init: ResponseInit = {}) {
  const h = new Headers(init.headers);
  addCORS(h);
  return new Response(body, { ...init, headers: h });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle preflight OPTIONS requests
    if (request.method === 'OPTIONS') {
      const h = new Headers();
      addCORS(h);
      return new Response(null, { status: 204, headers: h });
    }

    try {
      if (path === '/health') {
        return corsResponse('ok', { status: 200 });
      }

      if (path === '/version') {
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
        const kvTest = await env.QUANTA_CACHE.get('test');
        
        return corsResponse(JSON.stringify({
          env: env.SENTRY_ENV,
          supabase: !!supabase,
          kv: env.QUANTA_CACHE !== undefined,
          build: 'dev', // Will be replaced in CI
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (path === '/sse/ticks') {
        const symbols = url.searchParams.get('symbol')?.split('|') || ['BTC-USDT', 'ETH-USDT', 'SOL-USDT'];
        const sseHandler = new SSEHandler(env);
        const response = await sseHandler.handleSSE(symbols);
        
        // Add CORS headers to SSE response
        const h = new Headers(response.headers);
        addCORS(h);
        
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: h
        });
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

        return corsResponse(JSON.stringify(data || []), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
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

        return corsResponse(JSON.stringify(data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return corsResponse('quanta-stream-proxy online', { status: 200 });

    } catch (error) {
      console.error('Worker error:', error);
      return corsResponse('Internal Server Error', { status: 500 });
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
