import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPlace extends Document {
  title: string;
  description: string;
  image: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  creator: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const placeSchema = new Schema<IPlace>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    address: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" }, // with relation to user
  },
  { timestamps: true }
);

const Place: Model<IPlace> = mongoose.model<IPlace>("Place", placeSchema);

export default Place;
