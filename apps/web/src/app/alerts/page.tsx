import React from 'react';

export default function AlertsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Alert Management</h1>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-start space-x-2">
              <span className="text-yellow-600 text-lg">🚧</span>
              <div>
                <h3 className="font-semibold text-yellow-800">Coming Soon</h3>
                <p className="text-yellow-700 text-sm mt-1">
                  Natural language alert builder is under development. You'll be able to create alerts like:
                  "Notify me when BTC +2σ and sentiment flips positive within 10m"
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Active Alerts</h2>
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🔔</div>
                <div className="text-sm">No active alerts</div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Alert History</h2>
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📋</div>
                <div className="text-sm">No alert history</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
