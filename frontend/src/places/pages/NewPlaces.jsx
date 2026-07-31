import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../shared/components/FormElements/Input';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH
} from '../../shared/utils/validators';
import { useForm } from '../../shared/hooks/form-hooks';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';

function NewPlace () {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [formState, inputHandler] = useForm(
    {
      title: {
        value: '',
        isValid: false
      },
      description: {
        value: '',
        isValid: false
      },
      address: {
        value: '',
        isValid: false
      },
      image: {
        value: null,
        isValid: false
      }
    },
    false
  );
  const navigate = useNavigate();

  const placeSubmitHandler = async event => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', formState.inputs.title.value);
      formData.append('description', formState.inputs.description.value);
      formData.append('address', formState.inputs.address.value);
      // formData.append('creator', auth.userId); //remove because backend remove
      formData.append('image', formState.inputs.image.value);

      await sendRequest(
        import.meta.env.VITE_BACKEND_URL + '/places/',
        'POST',
        formData,
        { Authorization: 'Bearer ' + auth.token}
        // no headers — the browser sets the correct
        // multipart/form-data Content-Type + boundary automatically
      );

      navigate('/');
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
    <ErrorModal error={error} onClear={clearError}/>
    <form 
      className="list-none mx-auto p-4 w-[90%] max-w-[40rem] shadow-[0_2px_8px_rgba(0,0,0,0.26)] rounded-six bg-white m-4" 
      onSubmit={placeSubmitHandler}
    >
      {isLoading && <LoadingSpinner asOverlay/>}
      <Input
        id="title"
        element="input"
        type="text"
        // label="Title"
        placeholder='Title'
        validators={[VALIDATOR_REQUIRE()]}
        errorText="Please enter a valid title."
        onInput={inputHandler}
        className="w-full rounded bg-[#FFFFFF] border border-gray-300 px-4 py-3 mb-3 text-base focus:outline-none focus:border-blue-500"
      />
      <Input
        id="description"
        element="textarea"
        // label="Description"
        validators={[VALIDATOR_MINLENGTH(5)]}
        errorText="Please enter a valid description (at least 5 characters)."
        onInput={inputHandler}
        className="w-full rounded bg-[#FFFFFF] border border-gray-300 px-4 py-3 mb-3 text-base focus:outline-none focus:border-blue-500"
      />
      <Input
        id="address"
        element="input"
        // label="Address"
        placeholder='Address'
        validators={[VALIDATOR_REQUIRE()]}
        errorText="Please enter a valid address."
        onInput={inputHandler}
        className="w-full rounded bg-[#FFFFFF] border border-gray-300 px-4 py-3 mb-3 text-base focus:outline-none focus:border-blue-500"
      />
      <ImageUpload
        id="image"
        onInput={inputHandler}
        errorText="Please provide an image."
      />
      <Button 
        type="submit" 
        disabled={!formState.isValid}
        className="w-full rounded-full border-blue-600 bg-blue-600 hover:bg-blue-700 hover:border-blue-600 text-white font-semibold py-3 text-lg"
      >
        ADD PLACE
      </Button>
    </form>
    </>
  );
};

export default NewPlace