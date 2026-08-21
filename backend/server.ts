import "dotenv/config";
import dns from "node:dns/promises";
import mongoose from "mongoose";
import app from "./app";
import logger from "./util/logger";

dns.setServers(["1.1.1.1", "8.8.8.8"]); // << if error connection do this

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not set — check your .env file.");
}

mongoose
  .connect(process.env.MONGO_URI, { dbName: process.env.DB_NAME })
  .then(() => logger.info(`MongoDB connected (db: ${process.env.DB_NAME})`))
  .catch((err: unknown) => {
    logger.error({ err }, "MongoDB connection failed");
  });
