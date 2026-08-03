const express = require("express");

const { check } = require("express-validator");

const usersControllers = require("../controllers/users-controllers");
const { upload, uploadToCloudinary } = require("../middleware/file-upload");

const router = express.Router();

router.get("/", usersControllers.getUsers);
router.post(
  "/signup",
  upload.single("image"),
  uploadToCloudinary,
  [
    check("firstName").not().isEmpty(),
    check("lastName").not().isEmpty(),
    check("birthday").not().isEmpty(),
    check("gender").isIn(['female', 'male', 'custom']),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersControllers.signup,
);
router.post("/login", usersControllers.login);
router.post('/forgot-password', usersControllers.forgotPassword);
router.post('/reset-password', usersControllers.resetPassword);

module.exports = router;
