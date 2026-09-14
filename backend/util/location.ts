import axios from "axios";
import HttpError from "../models/http-error";

interface Coordinates {
  lat: number;
  lng: number;
}

async function getCoordsForAddress(address: string): Promise<Coordinates> {
  
  let response;
  try {
    response = await axios.get(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
    {
      headers: {
        "User-Agent": "mern-course-app", // ✅ required by Nominatim
      },
    }
  );
  } catch (err) {
    // Network failure, timeout, or Nominatim itself being down — not the
    // user's fault, unlike "address not found" below, so this is a genuine
    // upstream/service failure and gets a proper numeric HttpError code.
    throw new HttpError("Could not verify address, please try again later.", 503);
  }

  const data = response.data;

  // ✅ Check if results are empty
  if (!data || data.length === 0) {
    throw new HttpError("Could not find location for the specified address.", 422);
  }

  // ✅ Nominatim returns lat/lon (not lat/lng like Google)
  const coordinates: Coordinates = {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
  };

  return coordinates;
}

export default getCoordsForAddress;