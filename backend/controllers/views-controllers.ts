import { Request, Response, NextFunction } from "express";
import Place from "../models/place";
import logger from "../util/logger";

const renderPlacesPage = async (req: Request, res: Response, next: NextFunction) => {
  let places;
  try {
    places = await Place.find({}).sort({ createdAt: -1 }).limit(20);
  } catch (err) {
    logger.error({ err }, "Render places page failed");
    return res.status(500).send("Something went wrong loading places.");
  }

  res.render("places", { places });
};

export { renderPlacesPage };