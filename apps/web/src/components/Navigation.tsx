'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSubscription, SubscriptionBadge } from '../contexts/SubscriptionContext';

export default function Navigation() {
  const pathname = usePathname();
  const { tier } = useSubscription();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-void-100/95 border-b border-cosmic-800/30 sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-cosmic-gradient flex items-center justify-center shadow-cosmic animate-glow">
                <span className="text-white font-bold text-lg font-mono">∞</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold glow-text tracking-wide">SINGULARITY</span>
                <span className="text-xs text-cosmic-400 font-mono tracking-widest">TRADING ENGINE</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-1">
            <Link 
              href="/" 
              className={`nav-link px-4 py-2 ${isActive('/') ? 'active' : ''}`}
            >
              RADAR
            </Link>
            <Link 
              href="/portfolio" 
              className={`nav-link px-4 py-2 premium-indicator ${isActive('/portfolio') ? 'active' : ''}`}
            >
              PORTFOLIO
            </Link>
            <Link 
              href="/backtest" 
              className={`nav-link px-4 py-2 premium-indicator ${isActive('/backtest') ? 'active' : ''}`}
            >
              BACKTEST
            </Link>
            <Link 
              href="/alerts" 
              className={`nav-link px-4 py-2 ${isActive('/alerts') ? 'active' : ''}`}
            >
              ALERTS
            </Link>
            <Link 
              href="/metrics" 
              className={`nav-link px-4 py-2 ${isActive('/metrics') ? 'active' : ''}`}
            >
              METRICS
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <SubscriptionBadge tier={tier} />
            <Link href="/subscription" className="btn-quantum text-sm">
              {tier === 'free' ? 'UPGRADE' : 'MANAGE'}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
