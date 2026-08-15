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
      // The Polymesh SDK is consumed from a local build through a Yarn `portal:` symlink (see
      // scripts/link-local-packages.mjs). Vite excludes linked dependencies from pre-bundling, and
      // the SDK ships CommonJS — so without listing it here the browser is served raw CJS and every
      // named import fails at runtime with "does not provide an export named ...". Subpaths must be
      // listed individually.
      //
      // Remove this block when the SDK goes back to being installed from the registry.
      include: [
        '@polymeshassociation/polymesh-sdk',
        '@polymeshassociation/polymesh-sdk/api/entities/Account/types',
        '@polymeshassociation/polymesh-sdk/api/entities/AuthorizationRequest',
        '@polymeshassociation/polymesh-sdk/internal',
        '@polymeshassociation/polymesh-sdk/types',
        '@polymeshassociation/polymesh-sdk/utils',
        '@polymeshassociation/polymesh-sdk/utils/conversion',
        '@polymeshassociation/polymesh-sdk/utils/internal',
      ],
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
    },
    build: {
      // Vite only runs the CommonJS-to-ESM transform over `node_modules` by default. The local SDK
      // build is symlinked in, so Rollup resolves it to its real `local-packages/` path and would
      // otherwise treat its CJS as ESM — failing with '"Polymesh" is not exported by ...'. This is
      // the build-time counterpart of the `optimizeDeps.include` list above.
      //
      // Remove this when the SDK goes back to being installed from the registry.
      commonjsOptions: {
        include: [/node_modules/, /local-packages/],
      },
      rollupOptions: {},
    },
  };
});
