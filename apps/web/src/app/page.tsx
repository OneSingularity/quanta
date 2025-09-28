import React, { Suspense } from 'react';
import LiveTape from '@/components/LiveTape';
import AttentionFeed from '@/components/AttentionFeed';
import ExplainPanel from '@/components/ExplainPanel';
import Navigation from '@/components/Navigation';
import StatusBar from '@/components/StatusBar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <StatusBar />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Tape - Full width on mobile, 2/3 on desktop */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Live Market Tape
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full live-indicator"></div>
                  <span className="text-sm text-gray-600 font-medium">LIVE (crypto)</span>
                </div>
              </div>
              <Suspense fallback={<LiveTapeSkeleton />}>
                <LiveTape />
              </Suspense>
            </div>
          </div>

          {/* Attention Feed - 1/3 on desktop, full width on mobile */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Attention Cards
              </h2>
              <Suspense fallback={<AttentionFeedSkeleton />}>
                <AttentionFeed />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Explain Panel - Full width */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            What Changed? AI Analysis
          </h2>
          <Suspense fallback={<ExplainPanelSkeleton />}>
            <ExplainPanel />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

function LiveTapeSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 border rounded">
          <div className="flex items-center space-x-3">
            <div className="skeleton w-12 h-6"></div>
            <div className="skeleton w-20 h-6"></div>
          </div>
          <div className="skeleton w-16 h-6"></div>
        </div>
      ))}
    </div>
  );
}

function AttentionFeedSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-4 border rounded-lg">
          <div className="skeleton w-3/4 h-5 mb-2"></div>
          <div className="skeleton w-full h-4 mb-2"></div>
          <div className="skeleton w-1/2 h-4"></div>
        </div>
      ))}
    </div>
  );
}

function ExplainPanelSkeleton() {
  return (
    <div className="space-y-3">
      <div className="skeleton w-full h-4"></div>
      <div className="skeleton w-5/6 h-4"></div>
      <div className="skeleton w-4/5 h-4"></div>
    </div>
  );
}
