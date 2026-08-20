import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: "html",
  // Refuses to run any test if the backend isn't confirmed connected to
  // the dedicated E2E database — see global-setup.ts.
  globalSetup: "./global-setup.ts",
  use: {
    // Must match app.ts's CORS allowedOrigins exactly ("localhost", not
    // "127.0.0.1") — this is what the real browser navigates to and sends
    // as its Origin header, unlike webServer.url below which is just
    // Playwright polling from Node and has no CORS concept.
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  // Always spawn fresh servers, both locally and in CI — never reuse an
  // already-running one. This is deliberate: reusing an existing backend
  // skips the DB_NAME env override below entirely (whatever database that
  // existing process happened to be connected to just stays in use), which
  // is exactly the kind of silent mismatch the global-setup guardrail
  // exists to catch. Always spawning fresh means there's never ambiguity
  // about which backend — or which database — a test run is actually using.
  // If port 5000/5173 is already occupied, Playwright now fails loudly
  // with a clear "port in use" error instead of silently reusing whatever
  // was there.
  webServer: [
    {
      command: "npm run dev",
      cwd: "../backend",
      // Using `port` instead of `url` here — the backend has no route at
      // "/" (it correctly 404s), and Playwright's `url` check requires a
      // sub-400 status to consider the server ready. `port` just confirms
      // something is listening, which is all we actually need.
      port: 5000,
      timeout: 120000,
      reuseExistingServer: false,
      // Overrides DB_NAME for this spawned process only — dotenv never
      // overwrites a variable that's already set in the environment, so
      // this wins over whatever DB_NAME your backend/.env has, without
      // editing that file or affecting normal `npm run dev` elsewhere.
      env: {
        DB_NAME: "playwright_e2e",
      },
    },
    {
      command: "npm run dev",
      cwd: "../frontend",
      url: "http://127.0.0.1:5173",
      timeout: 120000,
      reuseExistingServer: false,
    },
  ],
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
