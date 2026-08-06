import { useEffect, useState } from "react";


import PlaceList from "../components/PlaceList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import { useHttpClient } from "../../shared/hooks/http-hook";
function Places() {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedPlaces, setLoadedPlaces] = useState();
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const responseData = await sendRequest(
          import.meta.env.VITE_BACKEND_URL + "/places",
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

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {!isLoading && loadedPlaces && <PlaceList items={loadedPlaces} />}
    </>
  );
}

export default Places;
