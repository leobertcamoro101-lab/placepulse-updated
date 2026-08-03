const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendResetPasswordEmail = require('../util/send-email');

const { deleteCloudinaryImage } = require('../util/cloudinary-cleanup');
const HttpError = require("../models/http-error");
const User = require("../models/user");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password"); // exclude the password
  } catch (err) {
    const error = new HttpError(
      "Fetching users failed, please try again later",
      5000,
    );
    return next(error);
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    await deleteCloudinaryImage(req.file?.cloudinaryPublicId);
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422),
    );
  }

  if (!req.file || !req.file.cloudinaryUrl) {
    return next(new HttpError("No image provided, please upload one.", 422));
  }

  const { firstName, lastName, birthday, gender, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    await deleteCloudinaryImage(req.file.cloudinaryPublicId);
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500,
    );
    return next(error);
  }

  if (existingUser) {
    await deleteCloudinaryImage(req.file.cloudinaryPublicId);
    const error = new HttpError(
      "User exists already, please login instead",
      422,
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    await deleteCloudinaryImage(req.file.cloudinaryPublicId);
    const error = new HttpError(
      'Could not create user, please try again',
      500
    );
    return next(error);
  }

  const createdUser = new User({
    firstName,
    lastName,
    birthday,
    gender,
    email,
    image: req.file.cloudinaryUrl,
    password: hashedPassword,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    await deleteCloudinaryImage(req.file.cloudinaryPublicId);
    console.log(err);
    const error = new HttpError("Signing up failed, please try again.", 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );
  } catch (err) {
    console.log(err);
    const error = new HttpError("Signing up failed, please try again.", 500);
    return next(error);
  };

  res.status(201).json({
    userId: createdUser.id,
    email: createdUser.email,
    name: createdUser.name,
    image: createdUser.image,
    token: token,
    // name: createdUser.firstName + ' ' + createdUser.lastName,
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500,
    );
    return next(error);
  }

  if (!existingUser) {                              
    const error = new HttpError(
      "Invalid credentials, could not log you in",
      403,
    );
    return next(error);
  }

  let isValidPassword = false;
  try{
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  }catch(err){
    const error = new HttpError(
      'Could not log you in please check credentials and try again',
      500
    );
    return next(error);
  }
  
  if(!isValidPassword){
    const error = new HttpError(
      "Invalid credentials, could not log you in",
      403,
    );
    return next(error);
  }

  let token;
  try{
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );
  }catch(err){
    console.log(err);
    const error = new HttpError("Logging in failed, please try again.", 500);
    return next(error);
  };

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    name: existingUser.name,
    image: existingUser.image,
    token: token
  });
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError('Something went wrong, please try again later.', 500));
  }

  // Always respond the same way, whether or not the email exists —
  // this prevents leaking which emails are registered in your system
  if (!existingUser) {
    return res.json({ message: 'If that email exists, a reset link has been sent.' });
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  existingUser.resetPasswordToken = hashedToken;
  existingUser.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  try {
    await existingUser.save();
    await sendResetPasswordEmail(existingUser.email, rawToken);
  } catch (err) {
    console.log(err);
    return next(new HttpError('Could not send reset email, please try again.', 500));
  }

  res.json({ message: 'If that email exists, a reset link has been sent.' });
};

const resetPassword = async (req, res, next) => {
  const { token, password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  let existingUser;
  try {
    existingUser = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
  } catch (err) {
    return next(new HttpError('Something went wrong, please try again later.', 500));
  }

  if (!existingUser) {
    return next(new HttpError('Reset link is invalid or has expired.', 400));
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError('Could not reset password, please try again.', 500));
  }

  existingUser.password = hashedPassword;
  existingUser.resetPasswordToken = undefined;
  existingUser.resetPasswordExpires = undefined;

  try {
    await existingUser.save();
  } catch (err) {
    return next(new HttpError('Could not reset password, please try again.', 500));
  }

  res.json({ message: 'Password has been reset successfully.' });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
