//const { Router } = require('express'); // you can do this

const express = require("express");

// const validator = require('express-validator'); we only need one

const { check } = require("express-validator");

const placesControllers = require("../controllers/places-controllers");
const { upload, uploadToCloudinary } = require("../middleware/file-upload");
const checkAuth = require('../middleware/check-auth');

// const router = Router(); // you can do this

const router = express.Router();

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
  placesControllers.createPlace,
);

router.patch(
  "/:pid",
  [
    check("title").not().isEmpty(), 
    check("description").isLength({ min: 5 })
  ],
  placesControllers.updatePlace,
);

router.delete("/:pid", placesControllers.deletePlace);

module.exports = router;

// //const { Router } = require('express'); // you can do this

// const express = require("express");

// // const validator = require('express-validator'); we only need one

// const { check } = require("express-validator");

// const placesControllers = require("../controllers/places-controllers");

// // const router = Router(); // you can do this

// const router = express.Router();

// router.get("/:pid", placesControllers.getPlaceById);

// router.get("/user/:uid", placesControllers.getPlacesByUserId);

// router.post(
//   "/",
//   [
//     check("title").not().isEmpty(),
//     check("description").isLength({ min: 5 }),
//     check("address").not().isEmpty(),
//   ],
//   placesControllers.createPlace,
// );

// router.patch(
//   "/:pid",
//   [
//     check("title").not().isEmpty(), 
//     check("description").isLength({ min: 5 })
//   ],
//   placesControllers.updatePlace,
// );

// router.delete("/:pid", placesControllers.deletePlace);

// module.exports = router;
