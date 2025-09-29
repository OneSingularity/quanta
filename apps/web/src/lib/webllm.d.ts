export function generateExplanation(
  symbol: string,
  timeWindow: string
): Promise<{
  summary: string;
  confidence: number;
  keyFactors: Array<{
    type: 'price' | 'sentiment' | 'volume' | 'news';
    description: string;
    impact: 'positive' | 'negative' | 'neutral';
  }>;
}>;
