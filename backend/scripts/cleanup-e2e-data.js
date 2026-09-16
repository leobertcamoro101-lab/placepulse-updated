"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("node:dns/promises");
const promises_1 = __importDefault(require("node:dns/promises"));
promises_1.default.setServers(["1.1.1.1", "8.8.8.8"]); // << if error connection do this
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const cloudinary_cleanup_1 = require("../src/util/cloudinary-cleanup");
// This script has exactly one job — cleaning the dedicated E2E database —
// so the name is hardcoded here rather than read from .env. This means
// it's always safe to run directly with no setup, the same way
// playwright.config.ts always overrides DB_NAME for the actual test run.
const E2E_DB_NAME = "playwright_e2e";
const run = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not set — check your .env file.");
    }
    await mongoose_1.default.connect(process.env.MONGO_URI, { dbName: E2E_DB_NAME });
    console.log("DB_NAME:", E2E_DB_NAME);
    // Look up the matching e2e records BEFORE deleting them, so their
    // Cloudinary image URLs can still be read. Deliberately NOT using an
    // "orphaned images" sweep here (comparing all of Cloudinary against
    // what's referenced in this one database) — Cloudinary storage is
    // shared across the whole account, not partitioned per database, so a
    // broad sweep run against this DB could delete real production images
    // that simply aren't referenced *here*. Instead, only the specific
    // images belonging to records already confirmed to be E2E test data
    // (by the same naming pattern used below) ever get deleted.
    const usersToDelete = await mongoose_1.default.connection
        .collection("users")
        .find({ email: { $regex: /^e2e-test-/ } })
        .toArray();
    const placesToDelete = await mongoose_1.default.connection
        .collection("places")
        .find({ title: { $regex: /^E2E Test Place / } })
        .toArray();
    let deletedImageCount = 0;
    for (const doc of [...usersToDelete, ...placesToDelete]) {
        const publicId = (0, cloudinary_cleanup_1.extractPublicId)(doc.image);
        if (publicId) {
            await (0, cloudinary_cleanup_1.deleteCloudinaryImage)(publicId);
            deletedImageCount++;
        }
    }
    // Only ever targets data matching the E2E test's own naming pattern
    // (see e2e/tests/full-user-flow.spec.ts) — safe to run repeatedly,
    // never touches real user data even if pointed at the wrong database
    // by mistake, since real accounts won't match these patterns.
    const userResult = await mongoose_1.default.connection
        .collection("users")
        .deleteMany({ email: { $regex: /^e2e-test-/ } });
    const placeResult = await mongoose_1.default.connection
        .collection("places")
        .deleteMany({ title: { $regex: /^E2E Test Place / } });
    console.log(`Deleted ${userResult.deletedCount} E2E test user(s).`);
    console.log(`Deleted ${placeResult.deletedCount} E2E test place(s).`);
    console.log(`Deleted ${deletedImageCount} associated Cloudinary image(s).`);
    await mongoose_1.default.disconnect();
};
run().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=cleanup-e2e-data.js.map