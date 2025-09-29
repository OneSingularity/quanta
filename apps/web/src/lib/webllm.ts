import * as webllm from "@mlc-ai/web-llm";

let engine: webllm.MLCEngine | null = null;

export async function initializeWebLLM(): Promise<webllm.MLCEngine> {
  if (engine) return engine;

  try {
    engine = new webllm.MLCEngine();
    await engine.reload("Phi-3.5-mini-instruct-q4f16_1-MLC");
    console.log("WebLLM initialized successfully");
    return engine;
  } catch (error) {
    console.error("Failed to initialize WebLLM:", error);
    throw error;
  }
}

export async function generateExplanation(
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
}> {
  try {
    const llm = await initializeWebLLM();
    
    const prompt = `Analyze the market data for ${symbol} over the last ${timeWindow}:

Provide a concise analysis in JSON format with:
1. summary: Brief explanation of what happened
2. confidence: Number between 0-1
3. keyFactors: Array of factors with type, description, and impact

Focus on price movement, sentiment, volume, and news impact.`;

    const response = await llm.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from WebLLM");

    try {
      return JSON.parse(content);
    } catch {
      return {
        summary: content,
        confidence: 0.7,
        keyFactors: [
          {
            type: 'price' as const,
            description: 'AI analysis generated',
            impact: 'neutral' as const,
          }
        ],
      };
    }
  } catch (error) {
    console.error("WebLLM generation failed:", error);
    return {
      summary: `Analysis for ${symbol} over ${timeWindow} - WebLLM temporarily unavailable`,
      confidence: 0.5,
      keyFactors: [
        {
          type: 'price' as const,
          description: 'Fallback analysis mode',
          impact: 'neutral' as const,
        }
      ],
    };
  }
}
