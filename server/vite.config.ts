import { defineConfig } from "vite-plus"

export default defineConfig({
  pack: {
    entry: ["src/server.ts"],
    root: "src",
    platform: "node",
    format: "esm",
    target: "es2022",
    outDir: "dist",
    fixedExtension: false,
    sourcemap: true,
    dts: false,
  },
})
