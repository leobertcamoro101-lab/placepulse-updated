
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]); // << if error connection do this
require("dotenv").config();
// const fs = require('fs');
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

// CORS Policy
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers', 
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  next();
});

app.use("/api/places", placesRoutes); // => /api/places/....
app.use("/api/users", usersRoutes); // => /api/users/....

// unknown routes middleware
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

// error handling middleware
app.use((error, req, res, next) => {
  //not useful in cloudinary
  // if (req.file){
  //   fs.unlink(req.file.path, err => {
  //     console.log(err);
  //   });
  // }
  if (res.headerSent) {
    return next(error);
  }

  // Handle Multer-specific errors (file size, file type, etc.)
  if (error.name === 'MulterError') {
    let message = 'File upload error.';
    if (error.code === 'LIMIT_FILE_SIZE') {
      message = 'Image is too large. Please upload a smaller file.';
    }
    return res.status(422).json({ message });
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred" });
});

const PORT = process.env.PORT || 5000;
        
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.accdk79.mongodb.net/${process.env.DB_NAME}?appName=Cluster0`,
  )
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.log(err);
  });
