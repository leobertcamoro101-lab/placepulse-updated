import express from "express";
import { check } from "express-validator";
import rateLimit from "express-rate-limit";

import * as usersControllers from "../controllers/users-controllers";
import { upload, uploadToCloudinary } from "../middleware/file-upload";
import checkAuth from "../middleware/check-auth";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // max: 10,
  max: process.env.NODE_ENV === "test" ? 1000 : 10,   // ← changed
  message: { message: "Too many attempts, please try again later." },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  // max: 5,
  max: process.env.NODE_ENV === "test" ? 1000 : 5,   // ← changed
  message: { message: "Too many password reset requests, please try again later." },
});

router.get("/", usersControllers.getUsers);
router.get("/:uid", usersControllers.getUserById);

router.post(
  "/signup",
  authLimiter,
  upload.single("image"),
  uploadToCloudinary,
  [
    check("firstName").not().isEmpty(),
    check("lastName").not().isEmpty(),
    check("birthday").not().isEmpty(),
    check("gender").isIn(["female", "male", "custom"]),
    check("email").isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersControllers.signup
);
router.post("/login", authLimiter, usersControllers.login);
router.post("/forgot-password", forgotPasswordLimiter, usersControllers.forgotPassword);
router.post("/reset-password", authLimiter, usersControllers.resetPassword);

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
    check("gender").isIn(["female", "male", "custom"]),
    check("email").isEmail(),
  ],
  usersControllers.updateProfile
);

router.patch("/:uid/password", usersControllers.changePassword);

export default router;