import { beforeAll, afterEach, afterAll } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

let mongoServer: MongoMemoryReplSet;

beforeAll(async () => {
  // A single-node replica set (not a plain standalone server) — the app's
  // createPlace/deletePlace controllers use mongoose sessions/transactions,
  // which only work against a replica set, just like on the real Atlas cluster.
  mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  // Wipe all collections between tests so each test starts with a clean DB
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
