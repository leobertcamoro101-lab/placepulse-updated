import { useContext, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Image as ImageIcon } from 'lucide-react';
import Input from '../../shared/components/FormElements/Input';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import Avatar from '../../shared/components/UIElements/Avatar';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from '../../shared/utils/validators';
import { useForm } from '../../shared/hooks/form-hooks';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';

function NewPlace() {
  const auth = useContext(AuthContext);
  const { sendRequest } = useHttpClient();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [formState, inputHandler] = useForm(
    {
      title: { value: '', isValid: false },
      description: { value: '', isValid: false },
      address: { value: '', isValid: false },
      image: { value: undefined, isValid: false },
    },
    false
  );

  const createMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('title', formState.inputs.title.value as string);
      formData.append('description', formState.inputs.description.value as string);
      formData.append('address', formState.inputs.address.value as string);

      if (formState.inputs.image.value instanceof File) {
        formData.append('image', formState.inputs.image.value);
      }

      return sendRequest(
        import.meta.env.VITE_BACKEND_URL + '/places/',
        'POST',
        formData,
        { Authorization: 'Bearer ' + auth.token }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      queryClient.invalidateQueries({ queryKey: ['places', 'user', auth.userId] });
      navigate(`/${auth.userId}/places`);
    },
  });

  const placeSubmitHandler = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createMutation.mutate();
  };

  return (
    <>
      <ErrorModal
        error={createMutation.error instanceof Error ? createMutation.error.message : undefined}
        onClear={() => createMutation.reset()}
      />
      <Card className="w-[90%] max-w-[35rem] mx-auto my-4 p-0 overflow-visible">
        {createMutation.isPending && <LoadingSpinner asOverlay />}

        <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 m-0">Create Post</h2>
        </div>

        <div className="flex items-center gap-3 px-4 pt-4">
          <div className="w-10 h-10">
            <Avatar image={auth.image ?? undefined} alt={auth.name || 'You'} width="40px" />
          </div>
          <p className="font-semibold text-gray-900 m-0">{auth.name}</p>
        </div>

        <form onSubmit={placeSubmitHandler} className="px-4 pb-4">
          <Input
            id="title"
            element="input"
            type="text"
            placeholder={`What's the name of the place, ${auth.name?.split(' ')[0] || ''}?`}
            validators={[VALIDATOR_REQUIRE()]}
            onInput={inputHandler}
            className="w-full rounded bg-[#FFFFFF] border border-gray-300 px-4 py-3 mb-3 text-base focus:outline-none focus:border-blue-500"
          />
          <Input
            id="description"
            element="textarea"
            placeholder="Share more about this place..."
            validators={[VALIDATOR_MINLENGTH(5)]}
            onInput={inputHandler}
            className="w-full rounded bg-[#FFFFFF] border border-gray-300 px-4 py-3 mb-3 text-base focus:outline-none focus:border-blue-500"
          />
          <Input
            id="address"
            element="input"
            placeholder="Address"
            validators={[VALIDATOR_REQUIRE()]}
            onInput={inputHandler}
            className="w-full rounded bg-[#FFFFFF] border border-gray-300 px-4 py-3 mb-3 text-base focus:outline-none focus:border-blue-500"
          />

          <div className="border border-gray-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-gray-700 mb-2">
              <ImageIcon size={18} />
              <span className="text-sm font-medium">Add a photo</span>
            </div>
            <ImageUpload
              id="image"
              onInput={inputHandler}
              errorText="Please provide an image."
            />
          </div>

          <Button
            type="submit"
            disabled={!formState.isValid}
            className="w-full rounded-lg border-blue-600 bg-blue-600 hover:bg-blue-700 hover:border-blue-600 text-white font-semibold py-2 text-base"
          >
            Post
          </Button>
        </form>
      </Card>
    </>
  );
}

export default NewPlace;