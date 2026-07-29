// const uuid = require('uuid/v4');
// const { v4: uuidv4 } = require("uuid");
// const fs =require('fs'); // use for cleanup if saving image in local
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const { deleteCloudinaryImage, extractPublicId } = require('../util/cloudinary-cleanup');
const Place = require("../models/place");
const User = require("../models/user");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid; 

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong. could not find a place",
      500,
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      "Could not find a place for the provided id",
      404,
    ); // trigger error handling middleware
    return next(error);
  }
  res.json({ place: place.toObject({ getters: true }) }); //=>{ place } => { place: place }
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid; 

  // let places;
  // try {
  //   places = await Place.find({creator: userId});
  // } catch (err) {
  //   const error = new HttpError(
  //     'Fetching places failed, please try again later',
  //     500
  //   );
  //   return next(error);
  // }

  // if (!places || places.length === 0) {
  //   const error = new HttpError(
  //     "Could not find a place for the provided user id",
  //     404
  //   ); // trigger error handling middleware
  //   return next(error)

  // }

  // res.json({ places: places.map( place => place.toObject({ getters: true})) }); //=>{ place } => { place: place }

  // get alternatives
  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate("places");
  } catch (err) {
    const error = new HttpError(
      "Fetching places failed, please try again later",
      500,
    );
    return next(error);
  }

  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(
      new HttpError("Could not find a place for the provided user id", 404),
    ); // trigger Model error handling middleware
  }

  res.json({
    places: userWithPlaces.places.map((place) =>
      place.toObject({ getters: true }),
    ),
  });
};

const createPlace = async (req, res, next) => {
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

  const { title, description, address } = req.body; // "creator" removed

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    await deleteCloudinaryImage(req.file.cloudinaryPublicId);
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.cloudinaryUrl,
    creator: req.userData.userId // better approach // than part req.body "creator" because we don't want the user to be able to set the creator of the place, we want to get it from the token that we decoded in the check-auth middleware
  });

  let user;

  try {
    user = await User.findById(req.userData.userId ); // "creator" changed to that <<<<<<
  } catch (err) {
    await deleteCloudinaryImage(req.file.cloudinaryPublicId);
    const error = new HttpError("Creating place failed, please try again", 500);
    return next(error);
  }

  if (!user) {
    await deleteCloudinaryImage(req.file.cloudinaryPublicId);
    const error = new HttpError("Could not find user for provided id", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    await deleteCloudinaryImage(req.file.cloudinaryPublicId);
    console.log(err);
    const error = new HttpError(
      "Creating place failed, please try again.",
      500,
    );
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422),
    ); // change throw to next, when working async code throw will not work correctly, we add return because we no longer throwing an error
  }
  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    console.log(err); // temp debug
    const error = new HttpError(
      "Something went wrong, could not update place",
      500,
    );
    return next(error);
  }

  // security check to make sure that the authorized user who is trying to update the place is the creator of the place
  if (place.creator.toString() !== req.userData.userId){
    const error = new HttpError(
      "Your are not allowed to edit this place",
      401
    );
    return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    console.log(err); // temp debug
    const error = new HttpError(
      "Something went wrong, could not update place.",
      500,
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate("creator"); //set a connection or relation to use the method populate() if not it wont work;
  } catch (err) {
    console.log(err); // temp debug
    const error = new HttpError(
      "Something went wrong, could not delete place",
      500,
    );
    return next(error);
  }

  // ✅ Check if place actually exists
  if (!place) {
    const error = new HttpError("Could not find place for this id.", 404);
    return next(error);
  }

  // security check to make sure that the Authorized user who is trying to delete the place is the creator of the place//
  if (place.creator.id !== req.userData.userId) {
    const error = new HttpError('You are not allowed to delete this place.', 401);
    return next(error);
  }

  // const imagePath = place.image; // use for cleanup if saving in local
  const imageUrl = place.image; //use for cleanup if saving image cloudinary
  try {
    // await place.remove(); //deprecated
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.deleteOne({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err); // temp debug
    const error = new HttpError(
      "Something went wrong, could not delete place",
      500,
    );
    return next(error);
  }
  
  // use for cleanup if saving image in local
  // fs.unlink(imagePath, err => {
  //   console.log(err)
  // });

  // MongoDB deletion succeeded — now clean up the Cloudinary image too
  await deleteCloudinaryImage(extractPublicId(imageUrl));
  res.status(200).json({ message: "Deleted place" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
