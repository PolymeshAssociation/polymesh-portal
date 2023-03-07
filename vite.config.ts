import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import svgr from 'vite-plugin-svgr' 

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), react(), svgr()],
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
