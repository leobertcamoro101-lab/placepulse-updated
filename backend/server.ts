import "dotenv/config";
import dns from "node:dns/promises";
import mongoose from "mongoose";
import app from "./app";

dns.setServers(["1.1.1.1", "8.8.8.8"]); // << if error connection do this

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.accdk79.mongodb.net/${process.env.DB_NAME}?appName=Cluster0`
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err: unknown) => {
    console.log(err);
  });
