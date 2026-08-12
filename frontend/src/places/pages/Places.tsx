import { useQuery, useQueryClient } from '@tanstack/react-query';
import PlaceList from "../components/PlaceList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { Place } from '../../shared/types/place';

function Places() {
  const { sendRequest } = useHttpClient();
  const queryClient = useQueryClient();

  const { data: loadedPlaces, isLoading, error, refetch } = useQuery({
    queryKey: ['places'],
    queryFn: async () => {
      const responseData = await sendRequest(import.meta.env.VITE_BACKEND_URL + "/places");
      if (!responseData) {
        // throw new Error("Request was cancelled, please try again."); //commented to never to see again in ErrorModal
        throw new Error('__silent_abort__'); // to silence the abort()
      }
      return responseData.places as Place[];
    },
  });

  const placeDeletedHandler = (deletedPlaceId: string) => {
    queryClient.setQueryData(['places'], (old: Place[] | undefined) =>
      old?.filter((place) => place.id !== deletedPlaceId)
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
      {!isLoading && loadedPlaces && (
        <PlaceList items={loadedPlaces} onDeletePlace={placeDeletedHandler} />
      )}
    </>
  );
}

export default Places;