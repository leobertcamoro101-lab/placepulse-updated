import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import PlaceList from '../components/PlaceList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from "../../shared/hooks/http-hook";

function UserPlaces () {
  const [loadedPlaces, setLoadedPlaces]= useState();
  const {isLoading, error, sendRequest, clearError} = useHttpClient();
  
  const userId = useParams().userId;
  useEffect(()=>{
    const fetchPlaces = async () =>{
      try {
        const responseData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/places/user/${userId}`);
        if(responseData){
          // i put this inside the if because of component http-hook.js abort-handling
          // Fix — guard against responseData being undefined before using it:
          setLoadedPlaces(responseData.places); //why places because of the backend "res.json({places: userWithPlaces.places.map((place) =>place.toObject({ getters: true }),),});"
        }
      } catch (err) {
        // the catch is empty because it's set when using useHttpClient inside http-hook.js file
        console.log(err) // to get rid or curly marked (to know the error message in console)
      }
    }
    fetchPlaces();
  }, [sendRequest, userId]);
  const placeDeletedHandler = (deletedPlaceId) => {
    setLoadedPlaces((prevPlaces) =>
      prevPlaces.filter((place) => place.id !== deletedPlaceId),
    );
  };

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedPlaces && <PlaceList items={loadedPlaces} onDeletePlace={placeDeletedHandler}/>}
    </>
  );
};

export default UserPlaces;
