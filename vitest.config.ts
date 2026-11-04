import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "frontend",
          include: ["src/**/*.test.{ts,tsx}"],
          environment: "jsdom",
          setupFiles: ["./src/test/setup.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "server",
          include: ["server/src/**/*.test.ts"],
          environment: "node",
        },
      },
    ],
  },
})
