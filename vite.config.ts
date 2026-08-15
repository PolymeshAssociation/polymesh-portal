import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';

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
