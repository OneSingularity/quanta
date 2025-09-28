'use client';

import React from 'react';
import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Q</span>
              </div>
              <span className="text-xl font-bold text-gradient">QUANTA</span>
            </Link>
            <span className="text-sm text-gray-500 hidden sm:block">
              Real-Time Market Radar
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Link 
              href="/alerts" 
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Alerts
            </Link>
            <Link 
              href="/metrics" 
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Metrics
            </Link>
            <button className="btn-primary text-sm">
              Install App
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
