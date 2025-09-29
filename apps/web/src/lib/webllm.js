export async function generateExplanation(symbol, timeWindow) {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockExplanation = {
      summary: `Analysis for ${symbol} over the last ${timeWindow} shows mixed signals. Price action indicates consolidation with moderate volatility. Market sentiment appears neutral with some positive momentum from recent news coverage.`,
      confidence: 0.72,
      keyFactors: [
        {
          type: 'price',
          description: `${symbol} price movement within normal range`,
          impact: 'neutral',
        },
        {
          type: 'sentiment',
          description: 'Market sentiment showing neutral to slightly positive bias',
          impact: 'positive',
        },
        {
          type: 'volume',
          description: 'Trading volume at average levels',
          impact: 'neutral',
        },
        {
          type: 'news',
          description: `Recent news coverage for ${symbol} shows balanced reporting`,
          impact: 'neutral',
        },
      ],
    };

    return mockExplanation;
  } catch (error) {
    console.error('WebLLM generation error:', error);
    return {
      summary: `Unable to generate analysis for ${symbol} at this time. Please try again later.`,
      confidence: 0.1,
      keyFactors: [
        {
          type: 'price',
          description: 'Analysis temporarily unavailable',
          impact: 'neutral',
        },
      ],
    };
  }
}
