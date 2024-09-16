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
    // proxy: {
    //   '/bob-api': {
    //     target: 'https://nks-bob-api.ansatt.dev.nav.no:8080/api/v1',
    //     changeOrigin: true,
    //     secure: true,
    //     rewrite: (path) => path.replace(/bob-api/, '')
    //   }
    // }
  },
  build: {
    sourcemap: true
  }
});
