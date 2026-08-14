import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

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

  if (error.name === "MulterError") {
    let message = "File upload error.";
    if (error.code === "LIMIT_FILE_SIZE") {
      message = "Image is too large. Please upload a smaller file.";
    }
    return res.status(422).json({ message });
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred" });
});

export default app;
