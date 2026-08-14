// React Query
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import PlaceList from "../components/PlaceList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import Card from "../../shared/components/UIElements/Card";
import Button from "../../shared/components/FormElements/Button";

import { useHttpClient } from "../../shared/hooks/http-hook";
import { Place } from "../../shared/types/place";

interface UserPlacesProps {
  userId?: string;
}

function UserPlaces({ userId: propUserId }: UserPlacesProps) {
  const { sendRequest } = useHttpClient();
  const queryClient = useQueryClient();

  const { userId: routeUserId } = useParams();
  const userId = propUserId || routeUserId;

  const {
    data: loadedPlaces,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["places", "user", userId],
    queryFn: async () => {
      // commented need to try catch because infinite loop and "No Created Place. Maybe create one?" no display
      // const responseData = await sendRequest(
      //   `${import.meta.env.VITE_BACKEND_URL}/places/user/${userId}`,
      // );
      // if (!responseData) {
      //   // throw new Error("Request was cancelled, please try again."); //commented to never to see again in ErrorModal
      //   throw new Error("__silent_abort__"); // to silence the abort()
      // }
      // return responseData.places as Place[];

      try {
        const responseData = await sendRequest(
          `${import.meta.env.VITE_BACKEND_URL}/places/user/${userId}`,
        );
        if (!responseData) {
          // throw new Error("Request was cancelled, please try again."); //commented to never to see again in ErrorModal
          throw new Error("__silent_abort__"); // to silence the abort()
        }
        return responseData.places as Place[];
      } catch (err) {

        //same idea below code
        // if (err instanceof Error && err.message === 'Could not find a place for the provided user id')

        if ( err instanceof Error && err.message.includes("Could not find a place for the provided user id")) 
        {
          return [] as Place[];
        }
        throw err;
      }
    },
    enabled: !!userId,
  });

  const placeDeletedHandler = (deletedPlaceId: string) => {
    queryClient.setQueryData(
      ["places", "user", userId],
      (old: Place[] | undefined) =>
        old?.filter((place) => place.id !== deletedPlaceId),
    );
  };

  return (
    <>
      {/* commented to silence the abort() */}
      {/* <ErrorModal error={error instanceof Error ? error.message : undefined} onClear={() => refetch()} /> */}
      <ErrorModal
        error={
          error instanceof Error && error.message !== "__silent_abort__"
            ? error.message
            : undefined
        }
        onClear={() => refetch()}
      />
      {/* commented because of claude but same behavior code below */}
      {/* {!isLoading && !loadedPlaces && (
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
      )} */}

      {!isLoading && loadedPlaces && loadedPlaces.length === 0 &&(
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
      
      {!isLoading && loadedPlaces && loadedPlaces.length > 0 && (
        <PlaceList items={loadedPlaces} onDeletePlace={placeDeletedHandler} />
      )}
    </>
  );
}

export default UserPlaces;

//React Hooks
// import { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';

// import Card from '../../shared/components/UIElements/Card';
// import Button from '../../shared/components/FormElements/Button';
// import PlaceList from '../components/PlaceList';
// import ErrorModal from '../../shared/components/UIElements/ErrorModal';

// import { useHttpClient } from "../../shared/hooks/http-hook";
// import { Place } from '../../shared/types/place';

// // interface Creator {
// //   _id?: string;
// //   name?: string;
// //   image?: string;
// // }

// // interface Place {
// //   id: string;
// //   image: string;
// //   title: string;
// //   description: string;
// //   address: string;
// //   creator?: Creator | string;
// //   location: {
// //     lat: number;
// //     lng: number;
// //   };
// //   creatorName?: string;
// //   creatorImage?: string;
// //   createdAt?: string;
// // }

// interface UserPlacesProps {
//   userId?: string;
// }

// function UserPlaces({ userId: propUserId }: UserPlacesProps) {
//   const [loadedPlaces, setLoadedPlaces] = useState<Place[]>();
//   const { isLoading, error, sendRequest, clearError } = useHttpClient();

//   const { userId: routeUserId } = useParams();
//   const userId = propUserId || routeUserId;

//   useEffect(() => {
//     const fetchPlaces = async () => {
//       try {
//         const responseData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/places/user/${userId}`);
//         if (responseData) {
//           setLoadedPlaces(responseData.places);
//         }
//       } catch (err) {
//         console.log(err);
//       }
//     };
//     fetchPlaces();
//   }, [sendRequest, userId]);

//   const placeDeletedHandler = (deletedPlaceId: string) => {
//     setLoadedPlaces((prevPlaces) =>
//       prevPlaces?.filter((place) => place.id !== deletedPlaceId)
//     );
//   };

//   return (
//     <>
//       <ErrorModal error={error} onClear={clearError} />
//       {!isLoading && !loadedPlaces && (
//         <div className="flex justify-center items-center min-h-[50vh] w-full px-4">
//           <Card className="text-center p-6 max-w-md w-full">
//             <h2 className="text-lg text-gray-800 mb-4">
//               No Created place. Maybe create one?
//             </h2>
//             <Button
//               to="/places/new"
//               className="rounded-full bg-blue-600 hover:bg-blue-700 border-blue-600 text-white font-semibold px-6 py-3"
//             >
//               Create Place
//             </Button>
//           </Card>
//         </div>
//       )}
//       {!isLoading && loadedPlaces && (
//         <PlaceList items={loadedPlaces} onDeletePlace={placeDeletedHandler} />
//       )}
//     </>
//   );
// }

// export default UserPlaces;
