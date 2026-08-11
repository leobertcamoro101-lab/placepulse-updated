import { useEffect, useState } from "react";

import PlaceList from "../components/PlaceList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import { useHttpClient } from "../../shared/hooks/http-hook";

interface Creator {
  _id?: string;
  name?: string;
  image?: string;
}

interface Place {
  id: string;
  image: string;
  title: string;
  description: string;
  address: string;
  creator?: Creator | string;
  location: {
    lat: number;
    lng: number;
  };
  creatorName?: string;
  creatorImage?: string;
  createdAt?: string;
}

function Places() {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedPlaces, setLoadedPlaces] = useState<Place[]>();

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const responseData = await sendRequest(
          import.meta.env.VITE_BACKEND_URL + "/places"
        );
        if (responseData) {
          setLoadedPlaces(responseData.places);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchPlaces();
  }, [sendRequest]);

  const placeDeletedHandler = (deletedPlaceId: string) => {
    setLoadedPlaces((prevPlaces) =>
      prevPlaces?.filter((place) => place.id !== deletedPlaceId)
    );
  };

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {!isLoading && loadedPlaces && (
        <PlaceList items={loadedPlaces} onDeletePlace={placeDeletedHandler} />
      )}
    </>
  );
}

export default Places;