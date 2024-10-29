import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import svgr from 'vite-plugin-svgr' 
import { htmlInjectionPlugin } from "vite-plugin-html-injection";
const matomoSrcEvents = "./src/matomo/matomo_events.html";
const matomoSrcLive = "./src/matomo/matomo_inject_live.html";
const matomoSrcDev = "./src/matomo/matomo_inject_dev.html";
const matomoSrc = process.env.VITE_NODE_URL === 'wss://mainnet-rpc.polymesh.network' ? matomoSrcLive : matomoSrcDev;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
    svgr(),
    htmlInjectionPlugin({
      injections: [
        {
          name: "Matomo Tag Manager",
          path: matomoSrc,
          type: "raw",
          injectTo: "head",
        },
        {
          name: "Matomo Event Tracking",
          path: matomoSrcEvents,
          type: "raw",
          injectTo: "head",
        }
      ],
    }),
  
  ],
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
            buffer: true,
            process: true,
        })
    ]
    }
  },
  build: {
    rollupOptions: {
      plugins: [
          nodePolyfills()
      ]
  }
  }
})
