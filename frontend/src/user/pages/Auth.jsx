import { useState, useContext } from "react";

import Card from "../../shared/components/UIElements/Card";
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/utils/validators";
import { useForm } from "../../shared/hooks/form-hooks";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";

function Auth() {
  const auth = useContext(AuthContext);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const {isLoading, error, sendRequest, clearError} = useHttpClient();
  const [formState, inputHandler, setFormData] = useForm(
    {
      email: {
        value: "",
        isValid: false,
      },
      password: {
        value: "",
        isValid: false,
      },
    },
    false,
  );

  const switchModeHandler = () => {
    if (!isLoginMode) {
      setFormData(
        {
          ...formState.inputs,
          name: undefined,
          image: undefined
        },
        formState.inputs.email.isValid && formState.inputs.password.isValid,
      );
    } else {
      setFormData(
        {
          ...formState.inputs,
          name: {
            value: "",
            isValid: false,
          },
          image: {
            value: null,
            isValid: false
          }
        },
        false,
      );
    }
    setIsLoginMode((prevMode) => !prevMode);
  };

  const authSubmitHandler = async (event) => {
    event.preventDefault();

    console.log(formState.inputs); // so that we can see picked file or not

    if (isLoginMode) {
      try {
      const responseData = await sendRequest(
        import.meta.env.VITE_BACKEND_URL + "/users/login", 
        "POST", 
        JSON.stringify({
          email: formState.inputs.email.value,
          password: formState.inputs.password.value,
        }),
        {
            "Content-Type": "application/json",
        },
      );
        auth.login(responseData.userId, responseData.token);
      } catch (err) {
        // the catch is empty because it's set when using useHttpClient inside http-hook.js file
        console.log(err) // to get rid or curly marked (to know the error message in console)
      }
    } else {
      try {
        const formData = new FormData();
        formData.append('name', formState.inputs.name.value);
        formData.append('email', formState.inputs.email.value);
        formData.append('password', formState.inputs.password.value);
        formData.append('image', formState.inputs.image.value);

        const responseData = await sendRequest(
          import.meta.env.VITE_BACKEND_URL + "/users/signup", 
          "POST",
          formData 
          // no headers — browser sets multipart/form-data + boundary automatically

          // JSON.stringify({
          //   name: formState.inputs.name.value,
          //   email: formState.inputs.email.value,
          //   password: formState.inputs.password.value,
          // }),
          // {
          //   "Content-Type": "application/json",
          // },
        );
        auth.login(responseData.userId, responseData.token);
      } catch (err) {
        // the catch is empty because it's set when using useHttpClient inside http-hook.js file
        console.log(err); // to get rid or curly marked (to know the error message in console) 
      }
    }
  };

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      <div className="min-h-screen flex items-start justify-center pt-20 bg-white">
        <Card className="w-full max-w-[28rem] px-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isLoginMode ? "Log into PlacePulse" : "Create your account"}
          </h2>

          {isLoading && <LoadingSpinner asOverlay />}

          <form onSubmit={authSubmitHandler}>
            {!isLoginMode && (
              <Input
                element="input"
                id="name"
                type="text"
                // label="Your Name "
                validators={[VALIDATOR_REQUIRE()]}
                // errorText="Please enter a name."
                placeholder='Name'
                onInput={inputHandler}
                className="w-full rounded-full border bg-[#FFFFFF] border-gray-300 px-4 py-3 mb-3 text-base focus:outline-none focus:border-blue-500"
              />
            )}
            {!isLoginMode && (
              <ImageUpload center id="image" onInput={inputHandler} errorText="Please provide an image" />
            )}
            <Input
              element="input"
              id="email"
              type="email"
              // label="Email or mobile number"
              placeholder='Email'
              validators={[VALIDATOR_EMAIL()]}
              // errorText="Please enter a valid email address."
              onInput={inputHandler}
              className="w-full rounded-full bg-[#FFFFFF] border border-gray-300 px-4 py-3 mb-3 text-base focus:outline-none focus:border-blue-500"
            />
            <Input
              element="input"
              id="password"
              type="password"
              // label="Password"
              placeholder='Password'
              validators={[VALIDATOR_MINLENGTH(6)]}
              // errorText="Please enter a valid password, at least 6 characters."
              onInput={inputHandler}
              className="w-full rounded-full bg-[#FFFFFF] border border-gray-300 px-4 py-3 mb-4 text-base focus:outline-none focus:border-blue-500"
            />
            <Button
              type="submit"
              disabled={!formState.isValid}
              className="w-full rounded-full border-blue-600 bg-blue-600 hover:bg-blue-700 hover:border-blue-600 text-white font-semibold py-3 text-lg"
            >
              {isLoginMode ? "Log In" : "Sign Up"}
            </Button>
          </form>

          <div className="text-center my-4">
            <a href="#" className="text-blue-600 text-sm hover:underline">
              Forgot password?
            </a>
          </div>

          <hr className="my-6 border-gray-200" />

          <div className="flex justify-center">
            <Button
              inverse
              onClick={switchModeHandler}
              className="rounded-full border border-blue-600 text-blue-600 font-semibold px-6 py-3 hover:bg-blue-600 hover:text-white"
            >
              {isLoginMode ? "Create New Account" : "Switch to Login"}
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}

export default Auth;
