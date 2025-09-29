const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
    WORKER_URL: process.env.WORKER_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:8787' : 'https://quanta-stream-proxy.f00ba328036ba6fad81a8b90ce0dd676.workers.dev'),
  },
};

module.exports = withPWA(nextConfig);
