import { useState, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import Card from '../../shared/components/UIElements/Card';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { VALIDATOR_MINLENGTH } from '../../shared/utils/validators';
import { useForm } from '../../shared/hooks/form-hooks';
import { useHttpClient } from '../../shared/hooks/http-hook';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { sendRequest } = useHttpClient();
  const [success, setSuccess] = useState(false);
  const [formState, inputHandler] = useForm(
    { password: { value: '', isValid: false } },
    false
  );

  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      return sendRequest(
        import.meta.env.VITE_BACKEND_URL + '/users/reset-password',
        'POST',
        JSON.stringify({ token, password: formState.inputs.password.value }),
        { 'Content-Type': 'application/json' }
      );
    },
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => navigate('/profile'), 2000);
    },
  });

  const submitHandler = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetPasswordMutation.mutate();
  };

  return (
    <>
      <ErrorModal
        error={resetPasswordMutation.error instanceof Error ? resetPasswordMutation.error.message : undefined}
        onClear={() => resetPasswordMutation.reset()}
      />
      <div className="min-h-screen flex items-start justify-center pt-20 bg-white">
        <Card className="w-full max-w-[28rem] px-6 py-8">
          {resetPasswordMutation.isPending && <LoadingSpinner asOverlay />}

          {success ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Password reset!</h2>
              <p className="text-gray-600">Redirecting you to login...</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Set a new password</h2>
              <form onSubmit={submitHandler}>
                <Input
                  element="input"
                  id="password"
                  type="password"
                  placeholder="New password"
                  validators={[VALIDATOR_MINLENGTH(6)]}
                  onInput={inputHandler}
                  className="w-full rounded-full bg-white border border-gray-300 px-4 py-3 mb-4 text-base focus:outline-none focus:border-blue-500"
                />
                <Button
                  type="submit"
                  disabled={!formState.isValid}
                  className="w-full rounded-full border-blue-600 bg-blue-600 hover:bg-blue-700 hover:border-blue-600 text-white font-semibold py-3 text-lg"
                >
                  Reset Password
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

export default ResetPassword;