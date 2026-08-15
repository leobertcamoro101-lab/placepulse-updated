import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: [
        "tests/**",
        "**/*.config.*",
        "**/*.test.tsx",
        "**/*.test.ts",
        "src/main.tsx", // app entry point, not meaningfully "testable" logic
        "src/vite-env.d.ts",
      ],
    },
  },
});
