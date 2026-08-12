import { useContext, FormEvent } from "react";
import { useParams, useNavigate, 
  // useLocation 
} from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import Card from "../../shared/components/UIElements/Card";
import Avatar from "../../shared/components/UIElements/Avatar";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from "../../shared/utils/validators";
import { useForm } from "../../shared/hooks/form-hooks";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";

interface Place {
  id: string;
  title: string;
  description: string;
  address: string;
  image: string;
}

function UpdatePlace() {
  const auth = useContext(AuthContext);
  const { sendRequest } = useHttpClient();
  const { placeId } = useParams();
  const navigate = useNavigate();
  // const location = useLocation();
  // const fromPath = (location.state as { from?: string })?.from;
  const queryClient = useQueryClient();

  const [formState, inputHandler, setFormData] = useForm(
    {
      title: { value: "", isValid: false },
      description: { value: "", isValid: false },
    },
    false
  );

  const { data: loadedPlace, isLoading, error, refetch } = useQuery({
    queryKey: ['place', placeId],
    queryFn: async () => {
      const responseData = await sendRequest(
        `${import.meta.env.VITE_BACKEND_URL}/places/${placeId}`
      );
      if (!responseData) {
        // throw new Error('Request was cancelled, please try again.'); //commented to never to see again in ErrorModal
        throw new Error("__silent_abort__"); // to silence the abort()
      }
      const place = responseData.place as Place;
      setFormData(
        {
          title: { value: place.title, isValid: true },
          description: { value: place.description, isValid: true },
        },
        true
      );
      return place;
    },
    enabled: !!placeId,
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      return sendRequest(
        `${import.meta.env.VITE_BACKEND_URL}/places/${placeId}`,
        "PATCH",
        JSON.stringify({
          title: formState.inputs.title.value,
          description: formState.inputs.description.value,
        }),
        {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      queryClient.invalidateQueries({ queryKey: ['places', 'user', auth.userId] });
      queryClient.invalidateQueries({ queryKey: ['place', placeId] });
      navigate(-1); // simplicity of my app
      // navigate(fromPath || "/" + auth.userId + "/places"); // precise control
    },
  });

  const placeUpdateSubmitHandler = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center my-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!loadedPlace && !error) {
    return (
      <div className="flex justify-center items-center my-8">
        <Card>
          <h2>Could not find place!</h2>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* commented to silence the abort() */}  
      {/* <ErrorModal
        error={
          error instanceof Error
            ? error.message
            : updateMutation.error instanceof Error
            ? updateMutation.error.message
            : undefined
        }
        onClear={() => {
          refetch();
          updateMutation.reset();
        }}
      /> */}
      <ErrorModal
        error={
          error instanceof Error && error.message !== "__silent_abort__"
            ? error.message
            : updateMutation.error instanceof Error
            ? updateMutation.error.message
            : undefined
        }
        onClear={() => {
          refetch();
          updateMutation.reset();
        }}
      />
      {!isLoading && loadedPlace && (
        <Card className="w-[90%] max-w-[35rem] mx-auto my-4 p-0 overflow-visible">
          <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 m-0">Edit Post</h2>
          </div>

          <div className="flex items-center gap-3 px-4 pt-4">
            <div className="w-10 h-10">
              <Avatar image={auth.image ?? undefined} alt={auth.name || "You"} width="40px" />
            </div>
            <p className="font-semibold text-gray-900 m-0">{auth.name}</p>
          </div>

          <form onSubmit={placeUpdateSubmitHandler} className="px-4 pb-4">
            <Input
              key={loadedPlace.title}
              id="title"
              element="input"
              type="text"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="Please enter a valid title."
              onInput={inputHandler}
              initialValue={loadedPlace.title}
              initialValid={true}
              className="w-full !border-0 !px-0 !py-2 text-xl font-medium placeholder:text-gray-500 focus:!outline-none"
            />
            <Input
              key={loadedPlace.description}
              id="description"
              element="textarea"
              validators={[VALIDATOR_MINLENGTH(5)]}
              errorText="Please enter a valid description (min. 5 characters)."
              onInput={inputHandler}
              initialValue={loadedPlace.description}
              initialValid={true}
              className="w-full !border-0 !px-0 !py-1 text-base placeholder:text-gray-500 focus:!outline-none mb-3"
            />

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <Button
                inverse
                to={`/${auth.userId}/places/`}
                className="rounded-lg border border-gray-300 !text-gray-800 font-semibold px-6 py-3 hover:!bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!formState.isValid}
                className="rounded-lg border-blue-600 bg-blue-600 hover:bg-blue-700 hover:border-blue-600 text-white font-semibold py-3 px-6"
              >
                Save
              </Button>
            </div>
          </form>
        </Card>
      )}
    </>
  );
}

export default UpdatePlace;