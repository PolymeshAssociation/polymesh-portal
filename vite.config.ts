import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';
import { htmlInjectionPlugin } from 'vite-plugin-html-injection';
import type { IHtmlInjectionConfigInjection } from 'vite-plugin-html-injection';

const matomoSrcEvents = './src/matomo/matomo_events.html';
const matomoSrcLive = './src/matomo/matomo_inject_live.html';
const matomoSrcDev = './src/matomo/matomo_inject_dev.html';

// Get Matomo injections based on environment
const getMatomoInjections = (
  matomoInstance: string | undefined,
): IHtmlInjectionConfigInjection[] => {
  if (!matomoInstance) return [];

  const matomoSrc =
    matomoInstance === 'live'
      ? matomoSrcLive
      : matomoInstance === 'dev'
        ? matomoSrcDev
        : null;

  if (!matomoSrc) return [];

  return [
    {
      name: 'Matomo Tag Manager',
      path: matomoSrc,
      type: 'raw',
      injectTo: 'head',
    },
    {
      name: 'Matomo Event Tracking',
      path: matomoSrcEvents,
      type: 'raw',
      injectTo: 'head',
    },
  ];
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE');

  return {
    plugins: [
      nodePolyfills({
        // Enable protocol imports like `stream`, `http`, `https`, etc.
        protocolImports: true,
      }),
      tsconfigPaths(),
      react(),
      svgr(),
      htmlInjectionPlugin({
        injections: getMatomoInjections(env.VITE_MATOMO_INSTANCE),
      }),
    ],
    resolve: {
      alias: {
        buffer: 'buffer',
        process: 'process/browser',
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
    },
    build: {
      rollupOptions: {},
    },
  };
});
