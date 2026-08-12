import { useContext, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Card from '../../shared/components/UIElements/Card';
import Avatar from '../../shared/components/UIElements/Avatar';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_EMAIL,
} from '../../shared/utils/validators';
import { useForm } from '../../shared/hooks/form-hooks';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';

const GENDER_OPTIONS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'custom', label: 'Custom' },
];

interface LoadedUser {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  image: string;
  birthday: string;
  gender: string;
}

function EditProfile() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const { sendRequest } = useHttpClient();
  const queryClient = useQueryClient();

  const [formState, inputHandler, setFormData] = useForm(
    {
      firstName: { value: '', isValid: false },
      lastName: { value: '', isValid: false },
      birthday: { value: '', isValid: false },
      gender: { value: '', isValid: false },
      email: { value: '', isValid: false },
      image: { value: undefined, isValid: true },
    },
    false
  );

  const { data: loadedUser, isLoading, error, refetch } = useQuery({
    queryKey: ['user', auth.userId],
    queryFn: async () => {
      const responseData = await sendRequest(
        `${import.meta.env.VITE_BACKEND_URL}/users/${auth.userId}`
      );
      if (!responseData) {
        throw new Error('__silent_abort__');
      }
      const user = responseData.user as LoadedUser;
      setFormData(
        {
          firstName: { value: user.firstName, isValid: true },
          lastName: { value: user.lastName, isValid: true },
          birthday: { value: user.birthday?.slice(0, 10) || '', isValid: true },
          gender: { value: user.gender, isValid: true },
          email: { value: user.email, isValid: true },
          image: { value: undefined, isValid: true },
        },
        true
      );
      return user;
    },
    enabled: !!auth.userId,
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('firstName', formState.inputs.firstName.value as string);
      formData.append('lastName', formState.inputs.lastName.value as string);
      formData.append('birthday', formState.inputs.birthday.value as string);
      formData.append('gender', formState.inputs.gender.value as string);
      formData.append('email', formState.inputs.email.value as string);

      if (formState.inputs.image.value instanceof File) {
        formData.append('image', formState.inputs.image.value);
      }

      return sendRequest(
        `${import.meta.env.VITE_BACKEND_URL}/users/${auth.userId}`,
        'PATCH',
        formData,
        { Authorization: 'Bearer ' + auth.token }
      );
    },
    onSuccess: (responseData) => {
      auth.updateUserInfo(responseData.user.name, responseData.user.image);
      queryClient.invalidateQueries({ queryKey: ['user', auth.userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/profile');
    },
  });

  const submitHandler = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateMutation.mutate();
  };

  if (isLoading && !loadedUser) {
    return (
      <div className="flex justify-center items-center my-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <ErrorModal
        error={
          error instanceof Error && error.message !== '__silent_abort__'
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
      {loadedUser && (
        <div className="flex justify-center px-4">
          <Card className="w-full max-w-[30rem] p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Profile</h2>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16">
                <Avatar image={loadedUser.image} alt={loadedUser.name} width="64px" />
              </div>
              <ImageUpload id="image" onInput={inputHandler} />
            </div>

            <form onSubmit={submitHandler}>
              <div className="flex gap-3">
                <Input
                  key={loadedUser.firstName}
                  element="input"
                  id="firstName"
                  type="text"
                  label="First name"
                  validators={[VALIDATOR_REQUIRE()]}
                  onInput={inputHandler}
                  initialValue={loadedUser.firstName}
                  initialValid={true}
                  className="w-full rounded-lg bg-white border border-gray-300 px-4 py-3 text-base focus:outline-none focus:border-blue-500"
                />
                <Input
                  key={loadedUser.lastName}
                  element="input"
                  id="lastName"
                  type="text"
                  label="Last name"
                  validators={[VALIDATOR_REQUIRE()]}
                  onInput={inputHandler}
                  initialValue={loadedUser.lastName}
                  initialValid={true}
                  className="w-full rounded-lg bg-white border border-gray-300 px-4 py-3 text-base focus:outline-none focus:border-blue-500"
                />
              </div>

              <Input
                key={loadedUser.birthday}
                element="input"
                id="birthday"
                type="date"
                label="Birthday"
                validators={[VALIDATOR_REQUIRE()]}
                onInput={inputHandler}
                initialValue={loadedUser.birthday?.slice(0, 10)}
                initialValid={true}
                className="w-full rounded-lg bg-white border border-gray-300 px-4 py-3 text-base focus:outline-none focus:border-blue-500"
              />

              <Input
                key={loadedUser.gender}
                element="select"
                id="gender"
                label="Gender"
                options={GENDER_OPTIONS}
                validators={[VALIDATOR_REQUIRE()]}
                onInput={inputHandler}
                initialValue={loadedUser.gender}
                initialValid={true}
                className="w-full rounded-lg bg-white border border-gray-300 px-4 py-3 text-base focus:outline-none focus:border-blue-500"
              />

              <Input
                key={loadedUser.email}
                element="input"
                id="email"
                type="email"
                label="Email"
                validators={[VALIDATOR_EMAIL()]}
                onInput={inputHandler}
                initialValue={loadedUser.email}
                initialValid={true}
                className="w-full rounded-lg bg-white border border-gray-300 px-4 py-3 text-base focus:outline-none focus:border-blue-500"
              />

              <div className="flex gap-3 mt-2">
                <Button
                  inverse
                  to="/profile"
                  className="w-full rounded-lg border border-gray-300 !text-gray-800 font-semibold py-3 hover:!bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!formState.isValid}
                  className="w-full rounded-lg border-blue-600 bg-blue-600 hover:bg-blue-700 hover:border-blue-600 text-white font-semibold py-3"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}

export default EditProfile;