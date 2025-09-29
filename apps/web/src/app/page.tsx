import React, { Suspense } from 'react';
import LiveTape from '@/components/LiveTape';
import AttentionFeed from '@/components/AttentionFeed';
import ExplainPanel from '@/components/ExplainPanel';
import Navigation from '@/components/Navigation';
import StatusBar from '@/components/StatusBar';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <StatusBar />
      
      <main className="container mx-auto px-6 py-8 space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold glow-text mb-2">QUANTUM RADAR</h1>
          <p className="text-gray-400 text-lg">Real-time sentiment-aware crypto market intelligence</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card-premium">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-cosmic-300">
                  Live Market Tape
                </h2>
                <div className="flex items-center space-x-3">
                  <div className="status-operational status-indicator"></div>
                  <span className="text-sm text-cosmic-400 font-medium tracking-wide">LIVE FEED</span>
                </div>
              </div>
              <Suspense fallback={<LiveTapeSkeleton />}>
                <LiveTape />
              </Suspense>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card-premium">
              <h2 className="text-xl font-semibold text-cosmic-300 mb-6">
                Attention Signals
              </h2>
              <Suspense fallback={<AttentionFeedSkeleton />}>
                <AttentionFeed />
              </Suspense>
            </div>
          </div>
        </div>

        <div className="card-premium">
          <h2 className="text-xl font-semibold text-cosmic-300 mb-6">
            AI Market Analysis
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
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-void-200 border border-cosmic-800/30">
          <div className="flex items-center space-x-4">
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
        <div key={i} className="p-4 bg-void-200 border border-cosmic-800/30">
          <div className="skeleton w-3/4 h-5 mb-3"></div>
          <div className="skeleton w-full h-4 mb-2"></div>
          <div className="skeleton w-1/2 h-4"></div>
        </div>
      ))}
    </div>
  );
}

function ExplainPanelSkeleton() {
  return (
    <div className="space-y-4">
      <div className="skeleton w-full h-4"></div>
      <div className="skeleton w-5/6 h-4"></div>
      <div className="skeleton w-4/5 h-4"></div>
    </div>
  );
}
