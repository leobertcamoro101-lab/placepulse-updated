const express = require("express");

const { check } = require("express-validator");

const usersControllers = require("../controllers/users-controllers");
const { upload, uploadToCloudinary } = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/", usersControllers.getUsers);
router.get("/:uid", usersControllers.getUserById);

router.post(
  "/signup",
  upload.single("image"),
  uploadToCloudinary,
  [
    check("firstName").not().isEmpty(),
    check("lastName").not().isEmpty(),
    check("birthday").not().isEmpty(),
    check("gender").isIn(['female', 'male', 'custom']),
    // check("email").normalizeEmail({ gmail_remove_dots: false }).isEmail(),
    check("email").isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersControllers.signup,
);
router.post("/login", usersControllers.login);
router.post('/forgot-password', usersControllers.forgotPassword);
router.post('/reset-password', usersControllers.resetPassword);

// Everything below this line requires a valid token
router.use(checkAuth);

router.patch(
  "/:uid",
  upload.single("image"),
  uploadToCloudinary,
  [
    check("firstName").not().isEmpty(),
    check("lastName").not().isEmpty(),
    check("birthday").not().isEmpty(),
    check("gender").isIn(['female', 'male', 'custom']),
    // check("email").normalizeEmail({ gmail_remove_dots: false }).isEmail(),
    check("email").isEmail(),
  ],
  usersControllers.updateProfile,
);

router.patch("/:uid/password", usersControllers.changePassword);

module.exports = router;