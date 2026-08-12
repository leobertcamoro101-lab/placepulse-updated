import { useState, useContext, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from '@tanstack/react-query';
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

const GENDER_OPTIONS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "custom", label: "Custom" },
];

interface AuthResponse {
  userId: string;
  token: string;
  name: string;
  image: string;
}

function Auth() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { sendRequest } = useHttpClient();
  const [formState, inputHandler, setFormData] = useForm(
    {
      email: { value: "", isValid: false },
      password: { value: "", isValid: false },
    },
    false
  );

  const authMutation = useMutation({
    mutationFn: async (): Promise<AuthResponse> => {
      if (isLoginMode) {
        return sendRequest(
          import.meta.env.VITE_BACKEND_URL + "/users/login",
          "POST",
          JSON.stringify({
            email: formState.inputs.email.value,
            password: formState.inputs.password.value,
          }),
          { "Content-Type": "application/json" }
        );
      } else {
        const formData = new FormData();
        formData.append("firstName", formState.inputs.firstName.value as string);
        formData.append("lastName", formState.inputs.lastName.value as string);
        formData.append("birthday", formState.inputs.birthday.value as string);
        formData.append("gender", formState.inputs.gender.value as string);
        formData.append("email", formState.inputs.email.value as string);
        formData.append("password", formState.inputs.password.value as string);

        if (formState.inputs.image.value instanceof File) {
          formData.append("image", formState.inputs.image.value);
        }

        return sendRequest(
          import.meta.env.VITE_BACKEND_URL + "/users/signup",
          "POST",
          formData
        );
      }
    },
    onSuccess: (responseData) => {
      auth.login(
        responseData.userId,
        responseData.token,
        undefined,
        responseData.name,
        responseData.image
      );
      navigate("/places");
    },
  });

  const switchModeHandler = () => {
    if (!isLoginMode) {
      setFormData(
        {
          ...formState.inputs,
          firstName: { value: "", isValid: true },
          lastName: { value: "", isValid: true },
          birthday: { value: "", isValid: true },
          gender: { value: "", isValid: true },
          image: { value: undefined, isValid: true },
        },
        formState.inputs.email.isValid && formState.inputs.password.isValid
      );
    } else {
      setFormData(
        {
          ...formState.inputs,
          firstName: { value: "", isValid: false },
          lastName: { value: "", isValid: false },
          birthday: { value: "", isValid: false },
          gender: { value: "", isValid: false },
          image: { value: undefined, isValid: false },
        },
        false
      );
    }
    setIsLoginMode((prevMode) => !prevMode);
  };

  const authSubmitHandler = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    authMutation.mutate();
  };

  return (
    <>
      <ErrorModal
        error={authMutation.error instanceof Error ? authMutation.error.message : undefined}
        onClear={() => authMutation.reset()}
      />
      <div className="min-h-screen flex items-start justify-center pt-20 bg-white">
        <Card className="w-full max-w-[28rem] px-6 py-8 mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isLoginMode ? "Log into PlacePulse" : "Get started on PlacePulse"}
          </h2>
          {!isLoginMode && (
            <p className="text-sm text-gray-500 mb-6">
              Create an account to share places with friends and the community.
            </p>
          )}

          {authMutation.isPending && <LoadingSpinner asOverlay />}

          <form onSubmit={authSubmitHandler}>
            {!isLoginMode && (
              <div className="flex gap-3 mb-1">
                <Input
                  element="input"
                  id="firstName"
                  type="text"
                  placeholder="First name"
                  validators={[VALIDATOR_REQUIRE()]}
                  onInput={inputHandler}
                  className="w-full rounded-lg bg-white border border-gray-300 px-4 py-3 text-base focus:outline-none focus:border-blue-500"
                />
                <Input
                  element="input"
                  id="lastName"
                  type="text"
                  placeholder="Last name"
                  validators={[VALIDATOR_REQUIRE()]}
                  onInput={inputHandler}
                  className="w-full rounded-lg bg-white border border-gray-300 px-4 py-3 text-base focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {!isLoginMode && (
              <>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Birthday
                </label>
                <Input
                  element="input"
                  id="birthday"
                  type="date"
                  validators={[VALIDATOR_REQUIRE()]}
                  onInput={inputHandler}
                  className="w-full rounded-lg bg-white border border-gray-300 px-4 py-3 mb-3 text-base focus:outline-none focus:border-blue-500"
                />
              </>
            )}

            {!isLoginMode && (
              <>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Gender
                </label>
                <Input
                  element="select"
                  id="gender"
                  placeholder="Select your gender"
                  options={GENDER_OPTIONS}
                  validators={[VALIDATOR_REQUIRE()]}
                  onInput={inputHandler}
                  className="w-full rounded-lg bg-white border border-gray-300 px-4 py-3 mb-3 text-base focus:outline-none focus:border-blue-500"
                />
              </>
            )}

            {!isLoginMode && (
              <ImageUpload
                center
                id="image"
                onInput={inputHandler}
                errorText="Please provide an image"
              />
            )}

            <Input
              element="input"
              id="email"
              type="email"
              placeholder="Mobile number or email"
              validators={[VALIDATOR_EMAIL()]}
              onInput={inputHandler}
              className="w-full rounded-full bg-white border border-gray-300 px-4 py-3 mb-3 text-base focus:outline-none focus:border-blue-500"
            />
            <Input
              element="input"
              id="password"
              type="password"
              placeholder="Password"
              validators={[VALIDATOR_MINLENGTH(6)]}
              onInput={inputHandler}
              className="w-full rounded-full bg-white border border-gray-300 px-4 py-3 mb-4 text-base focus:outline-none focus:border-blue-500"
            />

            {!isLoginMode && (
              <p className="text-xs text-gray-500 mb-4">
                People who use our service may have uploaded your contact
                information. By tapping Sign Up, you agree to create an account
                and to our Terms and Privacy Policy.
              </p>
            )}

            <Button
              type="submit"
              disabled={!formState.isValid}
              className="w-full rounded-full border-blue-600 bg-blue-600 hover:bg-blue-700 hover:border-blue-600 text-white font-semibold py-3 text-lg"
            >
              {isLoginMode ? "Log In" : "Sign Up"}
            </Button>
          </form>

          {isLoginMode && (
            <div className="text-center my-4">
              <Link
                to="/forgot-password"
                className="text-blue-600 text-sm hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          )}

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