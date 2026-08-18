import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

const run = async (): Promise<void> => {
  await mongoose.connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.accdk79.mongodb.net/${process.env.DB_NAME}?appName=Cluster0`
  );

  console.log("DB_NAME:", process.env.DB_NAME);

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
