import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 20000,
    hookTimeout: 20000,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"], // "text" prints a summary table; "html" writes a browsable report
      exclude: [
        "tests/**",
        "**/*.config.*",
        "dist/**",
        "scripts/**", // cleanup-orphaned-images.ts — not exercised by tests, skews the number
      ],
    },
  },
});
