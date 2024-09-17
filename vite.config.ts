import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { config } from 'dotenv';

config();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env
  },
  server: {
    port: 5173,
    proxy: {
      '/bob-api': {
        target: 'http://localhost:8080',
        // changeOrigin: true,
        // secure: true,
        rewrite: (path) => path.replace(/bob-api/, '')
      }
    }
  },
  build: {
    sourcemap: true
  }
});
