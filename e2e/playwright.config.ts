import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: "html",
  use: {
    // Must match app.ts's CORS allowedOrigins exactly ("localhost", not
    // "127.0.0.1") — this is what the real browser navigates to and sends
    // as its Origin header, unlike webServer.url below which is just
    // Playwright polling from Node and has no CORS concept.
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  // Starts both servers automatically before the test run, and reuses
  // them if you already have `npm run dev` running locally in each folder.
  // Using 127.0.0.1 instead of localhost avoids a Windows IPv6/IPv4
  // resolution mismatch where the health check hits ::1 but the dev
  // servers only bind to the IPv4 loopback address.
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
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "npm run dev",
      cwd: "../frontend",
      url: "http://127.0.0.1:5173",
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
    },
  ],
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
