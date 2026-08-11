import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import Card from '../../shared/components/UIElements/Card';
import Button from '../../shared/components/FormElements/Button';
import PlaceList from '../components/PlaceList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';

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

interface UserPlacesProps {
  userId?: string;
}

function UserPlaces({ userId: propUserId }: UserPlacesProps) {
  const [loadedPlaces, setLoadedPlaces] = useState<Place[]>();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const { userId: routeUserId } = useParams();
  const userId = propUserId || routeUserId;

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const responseData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/places/user/${userId}`);
        if (responseData) {
          setLoadedPlaces(responseData.places);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchPlaces();
  }, [sendRequest, userId]);

  const placeDeletedHandler = (deletedPlaceId: string) => {
    setLoadedPlaces((prevPlaces) =>
      prevPlaces?.filter((place) => place.id !== deletedPlaceId)
    );
  };

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {!isLoading && !loadedPlaces && (
        <div className="flex justify-center items-center min-h-[50vh] w-full px-4">
          <Card className="text-center p-6 max-w-md w-full">
            <h2 className="text-lg text-gray-800 mb-4">
              No Created place. Maybe create one?
            </h2>
            <Button
              to="/places/new"
              className="rounded-full bg-blue-600 hover:bg-blue-700 border-blue-600 text-white font-semibold px-6 py-3"
            >
              Create Place
            </Button>
          </Card>
        </div>
      )}
      {!isLoading && loadedPlaces && (
        <PlaceList items={loadedPlaces} onDeletePlace={placeDeletedHandler} />
      )}
    </>
  );
}

export default UserPlaces;