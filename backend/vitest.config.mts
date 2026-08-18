import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 20000,
    hookTimeout: 20000,
    // Safety net: never pick up compiled test output from dist/, in case
    // a build ever runs before tests and leaves stale .js copies there.
    exclude: ["**/node_modules/**", "**/dist/**"],
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
