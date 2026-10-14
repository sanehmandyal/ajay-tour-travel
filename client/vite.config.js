import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } } },
  build: { sourcemap: false, chunkSizeWarningLimit: 600 },
  ssr: { noExternal: ['react-helmet-async', 'lucide-react', 'framer-motion'] },
  test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test-setup.js'] },
});
