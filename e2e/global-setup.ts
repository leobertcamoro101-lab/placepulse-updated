const EXPECTED_DB_NAME = "playwright_e2e";
const HEALTH_URL = "http://127.0.0.1:5000/health";
const MAX_ATTEMPTS = 20; // ~10s total — Mongo connects independently of
// the port opening, so this polls rather than checking once.
const RETRY_DELAY_MS = 500;

async function globalSetup() {
  let lastDbName: string | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(HEALTH_URL);
      const data = await res.json();
      lastDbName = data.dbName;

      if (lastDbName === EXPECTED_DB_NAME) {
        console.log(`✓ Backend confirmed connected to "${EXPECTED_DB_NAME}" — safe to run.`);
        return;
      }
    } catch {
      // Backend not up yet — keep polling.
    }

    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  }

  throw new Error(
    `Refusing to run E2E tests: backend is connected to database "${lastDbName}", ` +
      `expected "${EXPECTED_DB_NAME}".\n\n` +
      `This usually means a backend is already running (started manually, not by ` +
      `Playwright), so the DB_NAME override in playwright.config.ts never applied. ` +
      `Stop any manually-running backend and let Playwright spawn its own, or fix ` +
      `whatever backend is currently running to point at "${EXPECTED_DB_NAME}".`
  );
}

export default globalSetup;
