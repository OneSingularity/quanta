import { Tick, SSEMessage } from '@quanta/core';
import { WebSocketAggregator } from './websocket-aggregator';
import { Env } from './index';

export class SSEHandler {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  async handleSSE(symbols: string[]): Promise<Response> {
    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    const env = this.env;

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        
        controller.enqueue(encoder.encode('retry: 3000\n\n'));
        
        const aggregator = new WebSocketAggregator(env.QUANTA_CACHE, (tick: Tick) => {
          if (symbols.includes(tick.symbol)) {
            const message: SSEMessage = {
              type: 'tick',
              data: tick,
            };
            
            const sseData = `data: ${JSON.stringify(message)}\n\n`;
            try {
              controller.enqueue(encoder.encode(sseData));
            } catch (error) {
              console.error('Error enqueueing tick data:', error);
            }
          }
        });

        aggregator.start().catch(console.error);

        const heartbeatInterval = setInterval(() => {
          const pingMessage: SSEMessage = {
            type: 'ping',
            data: { ts: new Date().toISOString() },
          };
          
          const sseData = `data: ${JSON.stringify(pingMessage)}\n\n`;
          try {
            controller.enqueue(encoder.encode(sseData));
          } catch (error) {
            clearInterval(heartbeatInterval);
            aggregator.stop();
            controller.close();
          }
        }, 15000);
      },
    });

    return new Response(stream, { headers });
  }
}
