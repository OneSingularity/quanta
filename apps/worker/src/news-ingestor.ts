import { createClient } from '@supabase/supabase-js';
import { Article, Sentiment, dedupe } from '@quanta/core';
import { Env } from './index';

export class NewsIngestor {
  private env: Env;
  private supabase: ReturnType<typeof createClient>;

  constructor(env: Env) {
    this.env = env;
    this.supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  }

  async ingestNews(): Promise<void> {
    const symbols = ['BTC', 'ETH', 'SOL', 'Bitcoin', 'Ethereum', 'Solana'];
    
    for (const symbol of symbols) {
      try {
        await this.ingestSymbolNews(symbol);
      } catch (error) {
        console.error(`Error ingesting news for ${symbol}:`, error);
      }
    }
  }

  private async ingestSymbolNews(symbol: string): Promise<void> {
    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    
    const startTime = this.formatGDELTTime(fifteenMinutesAgo);
    const endTime = this.formatGDELTTime(now);
    
    const gdeltUrl = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(symbol)}&mode=artlist&format=json&startdatetime=${startTime}&enddatetime=${endTime}&maxrecords=50`;
    
    try {
      const response = await fetch(gdeltUrl);
      if (!response.ok) {
        throw new Error(`GDELT API error: ${response.status}`);
      }
      
      const data = await response.json() as any;
      const articles = data.articles || [];
      
      for (const gdeltArticle of articles) {
        await this.processArticle(gdeltArticle, symbol);
      }
      
    } catch (error) {
      console.error(`Failed to fetch GDELT data for ${symbol}:`, error);
    }
  }

  private async processArticle(gdeltArticle: any, symbol: string): Promise<void> {
    try {
      const article: Omit<Article, 'id'> = {
        url: gdeltArticle.url,
        title: gdeltArticle.title || 'Untitled',
        ts_publish: new Date(gdeltArticle.seendate).toISOString(),
        source: gdeltArticle.domain,
        tickers: [symbol],
        lang: gdeltArticle.language || 'en',
        raw: gdeltArticle,
      };

      const hash = dedupe(article.url, article.title);
      
      const existing = await this.env.QUANTA_CACHE.get(`article:${hash}`);
      if (existing) {
        return; // Already processed
      }

      const { data: insertedArticle, error: insertError } = await this.supabase
        .from('articles')
        .insert(article as any)
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') { // Unique constraint violation
          return; // Article already exists
        }
        throw insertError;
      }

      const sentimentScore = await this.analyzeSentiment(article.title);
      
      const sentiment: Omit<Sentiment, 'id'> = {
        article_id: (insertedArticle as any).id,
        model: 'finbert-onnx',
        score: sentimentScore,
        confidence: 0.8, // Placeholder - would come from actual model
        tokens: {},
        ts_ingested: new Date().toISOString(),
      };

      const { error: sentimentError } = await this.supabase
        .from('sentiments')
        .insert(sentiment as any);

      if (sentimentError) {
        throw sentimentError;
      }

      await this.env.QUANTA_CACHE.put(`article:${hash}`, '1', { expirationTtl: 86400 });
      
      console.log(`Processed article: ${article.title}`);

    } catch (error) {
      console.error('Error processing article:', error);
    }
  }

  private async analyzeSentiment(text: string): Promise<number> {
    
    const positiveWords = ['bullish', 'surge', 'rally', 'gains', 'up', 'rise', 'positive', 'growth'];
    const negativeWords = ['bearish', 'crash', 'dump', 'losses', 'down', 'fall', 'negative', 'decline'];
    
    const lowerText = text.toLowerCase();
    let score = 0;
    
    for (const word of positiveWords) {
      if (lowerText.includes(word)) score += 0.1;
    }
    
    for (const word of negativeWords) {
      if (lowerText.includes(word)) score -= 0.1;
    }
    
    return Math.max(-1, Math.min(1, score));
  }

  private formatGDELTTime(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hour = String(date.getUTCHours()).padStart(2, '0');
    const minute = String(date.getUTCMinutes()).padStart(2, '0');
    const second = String(date.getUTCSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hour}${minute}${second}`;
  }
}
