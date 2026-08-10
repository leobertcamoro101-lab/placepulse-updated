import express from "express";
import { check } from "express-validator";

import * as placesControllers from "../controllers/places-controllers";
import { upload, uploadToCloudinary } from "../middleware/file-upload";
import checkAuth from "../middleware/check-auth";

const router = express.Router();

router.get("/", placesControllers.getAllPlaces);

router.get("/:pid", placesControllers.getPlaceById);

router.get("/user/:uid", placesControllers.getPlacesByUserId);

router.use(checkAuth); // protection with auth middleware for valid token to reach the next routes, block the request for continuing it's journey to the other routes

router.post(
  "/",
  upload.single("image"),
  uploadToCloudinary,
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  placesControllers.createPlace
);

router.patch(
  "/:pid",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
  ],
  placesControllers.updatePlace
);

router.delete("/:pid", placesControllers.deletePlace);

export default router;