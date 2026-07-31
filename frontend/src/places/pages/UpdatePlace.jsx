import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import Card from "../../shared/components/UIElements/Card";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from "../../shared/utils/validators";
import { useForm } from "../../shared/hooks/form-hooks";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";

function UpdatePlace() {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedPlace, setLoadedPlace] = useState();
  const placeId = useParams().placeId;
  const navigate = useNavigate();

  const [formState, inputHandler, setFormData] = useForm(
    {
      title: {
        value: "",
        isValid: false,
      },
      description: {
        value: "",
        isValid: false,
      },
    },
    false,
  );

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const responseData = await sendRequest(
          `${import.meta.env.VITE_BACKEND_URL}/places/${placeId}`,
        );
        if (responseData) {
          // i put this inside the if because of component http-hook.js abort-handling
          // Fix — guard against responseData being undefined before using it:
          setLoadedPlace(responseData.place); // why place because of the backend "res.json({ place: place.toObject({ getters: true }) });"
          setFormData(
            {
              title: {
                value: responseData.title,
                isValid: true,
              },
              description: {
                value: responseData.description,
                isValid: true,
              },
            },
            true,
          );
        }
      } catch (err) {
        // the catch is empty because it's set when using useHttpClient inside http-hook.js file
        console.log(err) // to get rid or curly marked (to know the error message in console)
      }
    };
    fetchPlace();
  }, [sendRequest, placeId, setFormData]);

  const placeUpdateSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      await sendRequest(
        `${import.meta.env.VITE_BACKEND_URL}/places/${placeId}`,
        "PATCH",
        JSON.stringify({
          title: formState.inputs.title.value,
          description: formState.inputs.description.value,
        }),
        {
          "Content-Type": "application/json",
          Authorization: 'Bearer ' + auth.token
        },
      );
      navigate("/" + auth.userId + "/places");
    } catch (err) {
      // the catch is empty because it's set when using useHttpClient inside http-hook.js file
      console.log(err); // to get rid or curly marked (to know the error message in console)
    }
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
      <ErrorModal error={error} onClear={clearError} />
      {!isLoading && loadedPlace && (
        <form
          className="list-none mx-auto p-4 w-[90%] max-w-[40rem] shadow-[0_2px_8px_rgba(0,0,0,0.26)] rounded-six bg-white m-4"
          onSubmit={placeUpdateSubmitHandler}
        >
          <Input
            id="title"
            element="input"
            type="text"
            label="Title"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a valid title."
            onInput={inputHandler}
            initialValue={loadedPlace.title}
            initialValid={true}
            className="w-full rounded bg-[#FFFFFF] border border-gray-300 px-4 py-3 mb-3 text-base focus:outline-none focus:border-blue-500"
          />
          <Input
            id="description"
            element="textarea"
            label="Description"
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText="Please enter a valid description (min. 5 characters)."
            onInput={inputHandler}
            initialValue={loadedPlace.description}
            initialValid={true}
            className="w-full rounded bg-[#FFFFFF] border border-gray-300 px-4 py-3 mb-3 text-base focus:outline-none focus:border-blue-500"
          />
          <div className="shrink-0 px-3 py-3 sm:px-4 sm:py-4 flex justify-end">
            <Button
              inverse
              to={`/${auth.userId}/places/`}
              className=" border border-blue-600 text-blue-600 font-semibold px-6 py-3 hover:bg-blue-600 hover:text-white"
            >
              CANCEL
            </Button>
            <Button 
              type="submit" 
              disabled={!formState.isValid}
              className=" border-blue-600 bg-blue-600 hover:bg-blue-700 hover:border-blue-600 text-white font-semibold py-3 text-lg"
            >
              UPDATE PLACE
            </Button>
          </div>
          
        </form>
      )}
    </>
  );
}

export default UpdatePlace;
