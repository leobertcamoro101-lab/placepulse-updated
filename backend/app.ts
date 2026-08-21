import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import mongoose from "mongoose";
import logger from "./util/logger";

import placesRoutes from "./routes/places-routes";
import usersRoutes from "./routes/users-routes";
import HttpError from "./models/http-error";

const app = express();

app.use(helmet());
app.use(bodyParser.json());

// app.use(mongoSanitize()); // commented and change compatibility issue express 5.x.x version

app.use((req, res, next) => {
  if (req.body) {
    req.body = mongoSanitize.sanitize(req.body);
  }
  next();
});

// CORS Policy
const allowedOrigins = [
  "http://localhost:5173",
  "https://placepulse-updated.vercel.app",
];

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

// Reports which database Mongo is actually connected to — used by the E2E
// test suite's global setup to refuse to run against the wrong database
// (e.g. if a manually-started backend is reused instead of one spawned
// with the test DB_NAME override). connection.name is undefined until the
// connection finishes, which the caller should account for by polling.
app.get("/health", (req: Request, res: Response) => {
  res.json({ dbName: mongoose.connection.name || null });
});

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

// unknown routes middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

// error handling middleware
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(error);
  }

  const status = error.code || 500;

  // Log every server-side error with useful request context. Client
  // errors (4xx — bad input, auth failures, not found) are expected,
  // routine traffic and not logged as errors to avoid noise; anything
  // 5xx means something actually went wrong and is worth seeing.
  if (status >= 500) {
    logger.error(
      { err: error, method: req.method, path: req.path, status },
      "Request failed"
    );
  }

  if (error.name === "MulterError") {
    let message = "File upload error.";
    if (error.code === "LIMIT_FILE_SIZE") {
      message = "Image is too large. Please upload a smaller file.";
    }
    return res.status(422).json({ message });
  }

  res.status(status);
  res.json({ message: error.message || "An unknown error occurred" });
});

export default app;
