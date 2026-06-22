import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Oculta indicador "Open Next.js Dev Tools" quando o servidor sobe via pnpm dev:e2e
  ...(process.env.E2E_DEV === '1' ? { devIndicators: false } : {}),
};

export default nextConfig;
