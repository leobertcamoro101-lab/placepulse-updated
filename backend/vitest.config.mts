import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 20000, // mongodb-memory-server's first download/boot can be slow
    hookTimeout: 20000,
  },
});
