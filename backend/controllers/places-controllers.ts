import { Response, NextFunction } from "express";
import mongoose from "mongoose";

import HttpError from "../models/http-error";
import getCoordsForAddress from "../util/location";
import { deleteCloudinaryImage, extractPublicId } from "../util/cloudinary-cleanup";
import Place from "../models/place";
import User from "../models/user";
import { AuthRequest } from "../middleware/check-auth";

const getPlaceById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(new HttpError("Something went wrong. could not find a place", 500));
  }

  if (!place) {
    return next(new HttpError("Could not find a place for the provided id", 404));
  }
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.params.uid;

  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate({
      path: "places",
      options: { sort: { createdAt: -1 } },
    });
  } catch (err) {
    return next(new HttpError("Fetching places failed, please try again later", 500));
  }

  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(new HttpError("Could not find a place for the provided user id", 404));
  }

  res.json({
    places: (userWithPlaces.places as any[]).map((place) => ({
      ...place.toObject({ getters: true }),
      creatorName: userWithPlaces.name,
      creatorImage: userWithPlaces.image,
    })),
  });
};

const createPlace = async (req: AuthRequest, res: Response, next: NextFunction) => {

  if (req.validationError) {
    await deleteCloudinaryImage(req.file?.cloudinaryPublicId);
    return next(new HttpError("Invalid inputs passed, please check your data.", 422));
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
    creator: req.userData!.userId, // better approach // than part req.body "creator" because we don't want the user to be able to set the creator of the place, we want to get it from the token that we decoded in the check-auth middleware
  });

  let user;

  try {
    user = await User.findById(req.userData!.userId); // "creator" changed
  } catch (err) {
    await deleteCloudinaryImage(req.file.cloudinaryPublicId);
    return next(new HttpError("Creating place failed, please try again", 500));
  }

  if (!user) {
    await deleteCloudinaryImage(req.file.cloudinaryPublicId);
    return next(new HttpError("Could not find user for provided id", 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace._id);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    await deleteCloudinaryImage(req.file.cloudinaryPublicId);
    console.log(err);
    return next(new HttpError("Creating place failed, please try again.", 500));
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req: AuthRequest, res: Response, next: NextFunction) => {

  if (req.validationError) {
    return next(new HttpError("Invalid inputs passed, please check your data.", 422)); // change throw to next, when working async code throw will not work correctly, we add return because we no longer throwing an error
  }
  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    console.log(err);
    return next(new HttpError("Something went wrong, could not update place", 500));
  }

  if (!place) {
    return next(new HttpError("Could not find place for this id.", 404));
  }

  // security check to make sure that the authorized user who is trying to update the place is the creator of the place
  if (place.creator.toString() !== req.userData!.userId) {
    return next(new HttpError("Your are not allowed to edit this place", 401));
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    console.log(err);
    return next(new HttpError("Something went wrong, could not update place.", 500));
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate("creator"); //set a connection or relation to use the method populate() if not it wont work;
  } catch (err) {
    console.log(err);
    return next(new HttpError("Something went wrong, could not delete place", 500));
  }
  
  // ✅ Check if place actually exists
  if (!place) {
    return next(new HttpError("Could not find place for this id.", 404));
  }

  const creator = place.creator as any;
  // security check to make sure that the Authorized user who is trying to delete the place is the creator of the place
  if (creator.id !== req.userData!.userId) {
    return next(new HttpError("You are not allowed to delete this place.", 401));
  }

  const imageUrl = place.image;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.deleteOne({ session: sess });
    creator.places.pull(place);
    await creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(new HttpError("Something went wrong, could not delete place", 500));
  }

  await deleteCloudinaryImage(extractPublicId(imageUrl));
  res.status(200).json({ message: "Deleted place" });
};

const getAllPlaces = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let places;
  try {
    places = await Place.find({}).populate("creator", "firstName lastName image").sort({ createdAt: -1 });
  } catch (err) {
    return res.status(500).json({ message: "Fetching places failed, please try again later." });
  }

  if (!places || places.length === 0) {
    return res.status(404).json({ message: "No places found." });
  }

  res.json({ places: places.map((place) => place.toObject({ getters: true })) });
};

export {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace,
  getAllPlaces,
};