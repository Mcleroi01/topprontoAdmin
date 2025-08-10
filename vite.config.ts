import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@supabase/supabase-js'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      target: 'es2020',
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  server: {
    fs: {
      // Allow serving files from one level up from the package root
      allow: ['..'],
    },
  },
});
