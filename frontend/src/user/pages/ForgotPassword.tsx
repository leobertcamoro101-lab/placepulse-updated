import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../shared/components/UIElements/Card';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { VALIDATOR_EMAIL } from '../../shared/utils/validators';
import { useForm } from '../../shared/hooks/form-hooks';
import { useHttpClient } from '../../shared/hooks/http-hook';

function ForgotPassword() {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [submitted, setSubmitted] = useState(false);
  const [formState, inputHandler] = useForm(
    { email: { value: '', isValid: false } },
    false
  );

  const submitHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await sendRequest(
        import.meta.env.VITE_BACKEND_URL + '/users/forgot-password',
        'POST',
        JSON.stringify({ email: formState.inputs.email.value }),
        { 'Content-Type': 'application/json' }
      );
      setSubmitted(true);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      <div className="min-h-screen flex items-start justify-center pt-20 bg-white">
        <Card className="w-full max-w-[28rem] px-6 py-8">
          {isLoading && <LoadingSpinner asOverlay />}

          {submitted ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Check your email</h2>
              <p className="text-gray-600 mb-6">
                If an account exists for that email, we've sent a link to reset your password.
              </p>
              <Link to="/" className="text-blue-600 text-sm hover:underline">
                Back to login
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot password?</h2>
              <p className="text-gray-500 text-sm mb-6">
                Enter your email and we'll send you a link to reset your password.
              </p>
              <form onSubmit={submitHandler}>
                <Input
                  element="input"
                  id="email"
                  type="email"
                  placeholder="Email"
                  validators={[VALIDATOR_EMAIL()]}
                  onInput={inputHandler}
                  className="w-full rounded-full bg-white border border-gray-300 px-4 py-3 mb-4 text-base focus:outline-none focus:border-blue-500"
                />
                <Button
                  type="submit"
                  disabled={!formState.isValid}
                  className="w-full rounded-full border-blue-600 bg-blue-600 hover:bg-blue-700 hover:border-blue-600 text-white font-semibold py-3 text-lg"
                >
                  Send Reset Link
                </Button>
              </form>
              <div className="text-center mt-4">
                <Link to="/" className="text-blue-600 text-sm hover:underline">
                  Back to login
                </Link>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
}

export default ForgotPassword;