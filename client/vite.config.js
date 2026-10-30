/*
 * Purpose: Vite settings for the React app. The dev server stays on port 5173,
 * which is the origin the Express CORS rule allows.
 * Theme: Event-driven programming
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true
  }
});
