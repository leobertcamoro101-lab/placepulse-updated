import "dotenv/config";
import dns from "node:dns/promises";
import mongoose from "mongoose";
import app from "./app";

dns.setServers(["1.1.1.1", "8.8.8.8"]); // << if error connection do this

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not set — check your .env file.");
}

mongoose
  .connect(process.env.MONGO_URI, { dbName: process.env.DB_NAME })
  .then(() => console.log(`MongoDB connected (db: ${process.env.DB_NAME})`))
  .catch((err: unknown) => {
    console.log(err);
  });
