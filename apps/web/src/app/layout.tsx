import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SubscriptionProvider } from '../contexts/SubscriptionContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Singularity Trading Engine - Advanced Crypto Analytics',
  description: 'Luxury space-themed crypto trading platform with AI-powered signals, portfolio analytics, and anti-overfitting algorithms',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Singularity Engine',
  },
  icons: {
    icon: '/icon-192x192.png',
    apple: '/icon-192x192.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#6366f1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Singularity Engine" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#6366f1" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={`${inter.className} cosmic-bg`}>
        <SubscriptionProvider>
          <div className="min-h-screen bg-space-particles">
            {children}
          </div>
        </SubscriptionProvider>
      </body>
    </html>
  );
}
