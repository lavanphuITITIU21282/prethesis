import type { NextConfig } from 'next';

const config: NextConfig = {
  // Keep project instructions user-owned instead of rewriting AGENTS.md on each dev launch.
  agentRules: false,
  poweredByHeader: false,
  devIndicators: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
};

export default config;
