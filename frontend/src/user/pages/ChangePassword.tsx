import { useContext, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import Card from '../../shared/components/UIElements/Card';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { VALIDATOR_REQUIRE, VALIDATOR_MINLENGTH } from '../../shared/utils/validators';
import { useForm } from '../../shared/hooks/form-hooks';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';

function ChangePassword() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const { sendRequest } = useHttpClient();
  const [successMsg, setSuccessMsg] = useState('');

  const [formState, inputHandler] = useForm(
    {
      currentPassword: { value: '', isValid: false },
      newPassword: { value: '', isValid: false },
    },
    false
  );

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      return sendRequest(
        `${import.meta.env.VITE_BACKEND_URL}/users/${auth.userId}/password`,
        'PATCH',
        JSON.stringify({
          currentPassword: formState.inputs.currentPassword.value,
          newPassword: formState.inputs.newPassword.value,
        }),
        {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + auth.token,
        }
      );
    },
    onSuccess: () => {
      setSuccessMsg('Password updated. Redirecting...');
      setTimeout(() => navigate('/profile'), 1500);
    },
  });

  const submitHandler = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMsg('');
    changePasswordMutation.mutate();
  };

  return (
    <>
      <ErrorModal
        error={changePasswordMutation.error instanceof Error ? changePasswordMutation.error.message : undefined}
        onClear={() => changePasswordMutation.reset()}
      />
      <div className="flex justify-center px-4">
        <Card className="w-full max-w-[28rem] p-6 mt-8">
          {changePasswordMutation.isPending && <LoadingSpinner asOverlay />}
          <h2 className="text-xl font-bold text-gray-900 mb-4">Change Password</h2>

          <form onSubmit={submitHandler}>
            <Input
              element="input"
              id="currentPassword"
              type="password"
              label="Current password"
              validators={[VALIDATOR_REQUIRE()]}
              onInput={inputHandler}
              className="w-full rounded-lg bg-white border border-gray-300 px-4 py-3 mb-3 text-base focus:outline-none focus:border-blue-500"
            />
            <Input
              element="input"
              id="newPassword"
              type="password"
              label="New password"
              validators={[VALIDATOR_MINLENGTH(6)]}
              onInput={inputHandler}
              className="w-full rounded-lg bg-white border border-gray-300 px-4 py-3 mb-3 text-base focus:outline-none focus:border-blue-500"
            />

            {successMsg && <p className="text-green-600 text-sm mb-3">{successMsg}</p>}

            <div className="flex gap-3">
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
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}

export default ChangePassword;