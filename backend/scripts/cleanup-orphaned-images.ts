import "node:dns/promises";
import dns from "node:dns/promises";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import cloudinary from "../config/cloudinary";
import Place from "../models/place";
import User from "../models/user";

const extractPublicId = (url?: string | null): string | null => {
  if (!url) return null;
  // e.g. https://res.cloudinary.com/xxx/image/upload/v123/placepulse-updated/abc123.jpg
  const match = url.match(/placepulse-updated\/([^/.]+)/);
  return match ? `placepulse-updated/${match[1]}` : null;
};

const run = async (): Promise<void> => {
  await mongoose.connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.accdk79.mongodb.net/${process.env.DB_NAME}?appName=Cluster0`
  );

  console.log("DB_USER:", process.env.DB_USER);
  console.log("DB_NAME:", process.env.DB_NAME);

  const places = await Place.find({}, "image");
  const users = await User.find({}, "image");

  console.log("Places found:", places.length);
  console.log("Users found:", users.length);
  console.log("Place images:", places.map((p) => p.image));
  console.log("User images:", users.map((u) => u.image));

  const usedPublicIds = new Set<string>(
    [...places, ...users]
      .map((doc) => extractPublicId(doc.image))
      .filter((id): id is string => Boolean(id))
  );

  console.log("Used public IDs:", [...usedPublicIds]);
  console.log(`Found ${usedPublicIds.size} images referenced in the database.`);

  let nextCursor: string | undefined = undefined;
  let orphanCount = 0;

  do {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "placepulse-updated/",
      max_results: 100,
      next_cursor: nextCursor,
    });

    for (const resource of result.resources) {
      if (!usedPublicIds.has(resource.public_id)) {
        console.log("Orphan found, deleting:", resource.public_id);
        await cloudinary.uploader.destroy(resource.public_id); // to delete
        // console.log('WOULD DELETE:', resource.public_id); // dry-run mode
        orphanCount++;
      }
    }

    nextCursor = result.next_cursor;
  } while (nextCursor);

  console.log(`Done. Deleted ${orphanCount} orphaned image(s).`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
