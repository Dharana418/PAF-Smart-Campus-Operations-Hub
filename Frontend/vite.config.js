import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api/roles': {
        target: 'http://localhost:8082',
        rewrite: (path) => path.replace(/^\/api\/roles/, '/api')
      },
      '/api/facilities': {
        target: 'http://localhost:8081',
        rewrite: (path) => path.replace(/^\/api\/facilities/, '/api')
      },
      '/api/core': {
        target: 'http://localhost:8080',
        rewrite: (path) => path.replace(/^\/api\/core/, '/api')
      },
      // Keep support for the original /api path (defaulting to core or role management)
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        bypass: (req) => {
          if (req.url.startsWith('/api/roles') || req.url.startsWith('/api/facilities') || req.url.startsWith('/api/core')) {
            return req.url;
          }
          return null;
        }
      }
    }
  }
});
