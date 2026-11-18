import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// The backend answers on localhost:8080 in development. The browser calls the dashboard's own
// origin and Vite forwards `/api` to the backend, so the dev page needs no CORS setting (the
// backend has none yet; the hosted dashboard will need one at point 17).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:8080' },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
});
