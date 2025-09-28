import React from 'react';

export default function MetricsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">System Metrics</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card text-center">
              <div className="text-2xl font-bold text-blue-600">--</div>
              <div className="text-sm text-gray-600">Events/sec</div>
            </div>
            
            <div className="card text-center">
              <div className="text-2xl font-bold text-green-600">--ms</div>
              <div className="text-sm text-gray-600">P95 Ingest Latency</div>
            </div>
            
            <div className="card text-center">
              <div className="text-2xl font-bold text-purple-600">--</div>
              <div className="text-sm text-gray-600">Sentiment Throughput</div>
            </div>
            
            <div className="card text-center">
              <div className="text-2xl font-bold text-orange-600">--</div>
              <div className="text-sm text-gray-600">SSE Clients</div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-start space-x-2">
              <span className="text-yellow-600 text-lg">📊</span>
              <div>
                <h3 className="font-semibold text-yellow-800">Metrics Dashboard</h3>
                <p className="text-yellow-700 text-sm mt-1">
                  Real-time metrics collection and visualization is under development. 
                  This will show system performance, data flow rates, and operational health.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Data Flow</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium">WebSocket Connections</span>
                  <span className="text-sm text-gray-600">Coinbase + Binance</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium">News Ingestion</span>
                  <span className="text-sm text-gray-600">GDELT every 5min</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Sentiment Analysis</span>
                  <span className="text-sm text-gray-600">FinBERT ONNX</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold mb-4">System Health</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Worker Status</span>
                  <span className="text-sm text-green-600">●</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Database</span>
                  <span className="text-sm text-green-600">●</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Cache (KV)</span>
                  <span className="text-sm text-green-600">●</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
