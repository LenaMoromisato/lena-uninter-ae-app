import type { NextConfig } from 'next';

const isE2eDev = process.env.E2E_DEV === '1';
const disableHmr = process.env.E2E_DISABLE_HMR === '1';

const nextConfig: NextConfig = {
  ...(isE2eDev ? { devIndicators: false } : {}),
  ...(disableHmr
    ? {
        // Apenas dev:e2e — sem HMR para evitar storm de GET com Playwright.
        webpack: (config, { dev, isServer }) => {
          if (dev && !isServer) {
            config.plugins = config.plugins.filter((plugin) => {
              const name = plugin?.constructor?.name ?? '';
              return name !== 'HotModuleReplacementPlugin' && name !== 'ReactRefreshPlugin';
            });
          }

          return config;
        },
      }
    : {}),
};

export default nextConfig;
