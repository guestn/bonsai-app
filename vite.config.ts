import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    // host: 'localhost',
    strictPort: true,
    allowedHosts: true,
    // origin: `http://localhost:3000`,

    // headers: {
    //   'X-Frame-Options': 'DENY',
    //   'X-Content-Type-Options': 'nosniff',
    //   'X-XSS-Protection': '1; mode=block',
    //   'Referrer-Policy': 'strict-origin-when-cross-origin',
    // },
    hmr: {
      protocol: 'ws',
      // host: 'localhost',
      // port: 3000, // Force HMR to use the Vercel port
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/',
});
