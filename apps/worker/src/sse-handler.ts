import { Tick, SSEMessage } from '@quanta/core';
import { WebSocketAggregator } from './websocket-aggregator';
import { Env } from './index';

export class SSEHandler {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  async handleSSE(symbols: string[]): Promise<Response> {
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    await writer.write(encoder.encode('retry: 3000\n\n'));

    const aggregator = new WebSocketAggregator((tick: Tick) => {
      if (symbols.includes(tick.symbol)) {
        const message: SSEMessage = {
          type: 'tick',
          data: tick,
        };
        
        const sseData = `data: ${JSON.stringify(message)}\n\n`;
        writer.write(encoder.encode(sseData)).catch(console.error);
      }
    });

    await aggregator.start();

    const heartbeatInterval = setInterval(() => {
      const pingMessage: SSEMessage = {
        type: 'ping',
        data: { ts: new Date().toISOString() },
      };
      
      const sseData = `data: ${JSON.stringify(pingMessage)}\n\n`;
      writer.write(encoder.encode(sseData)).catch(() => {
        clearInterval(heartbeatInterval);
        aggregator.stop();
        writer.close();
      });
    }, 15000);

    const response = new Response(readable, { headers });
    
    response.body?.pipeTo(new WritableStream({
      close() {
        clearInterval(heartbeatInterval);
        aggregator.stop();
      },
      abort() {
        clearInterval(heartbeatInterval);
        aggregator.stop();
      },
    }));

    return response;
  }
}
