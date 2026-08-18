import "node:dns/promises";
import dns from "node:dns/promises";
dns.setServers(["1.1.1.1", "8.8.8.8"]); // << if error connection do this

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

// This script has exactly one job — cleaning the dedicated E2E database —
// so the name is hardcoded here rather than read from .env. This means
// it's always safe to run directly with no setup, the same way
// playwright.config.ts always overrides DB_NAME for the actual test run.
const E2E_DB_NAME = "playwright_e2e";

const run = async (): Promise<void> => {
  await mongoose.connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.accdk79.mongodb.net/${E2E_DB_NAME}?appName=Cluster0`
  );

  console.log("DB_NAME:", E2E_DB_NAME);

  // Only ever targets data matching the E2E test's own naming pattern
  // (see e2e/tests/full-user-flow.spec.ts) — safe to run repeatedly,
  // never touches real user data even if pointed at the wrong database
  // by mistake, since real accounts won't match these patterns.
  const userResult = await mongoose.connection
    .collection("users")
    .deleteMany({ email: { $regex: /^e2e-test-/ } });

  const placeResult = await mongoose.connection
    .collection("places")
    .deleteMany({ title: { $regex: /^E2E Test Place / } });

  console.log(`Deleted ${userResult.deletedCount} E2E test user(s).`);
  console.log(`Deleted ${placeResult.deletedCount} E2E test place(s).`);

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
