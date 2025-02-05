import react from "@vitejs/plugin-react"
import { config } from "dotenv"
import { defineConfig } from "vite"

config()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    "process.env": process.env,
  },
  server: {
    port: 5173,
    proxy: {
      "/bob-api": "http://localhost:3030",
      "/bob-api-ws": "ws://localhost:3030",
    },
  },
  build: {
    sourcemap: true,
  },
})
