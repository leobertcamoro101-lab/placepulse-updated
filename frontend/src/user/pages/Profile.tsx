import { useEffect, useState, useContext } from 'react';
import Card from '../../shared/components/UIElements/Card';
import Avatar from '../../shared/components/UIElements/Avatar';
import Button from '../../shared/components/FormElements/Button';
import UserPlaces from '../../places/pages/UserPlaces';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';

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

function Profile() {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedUser, setLoadedUser] = useState<LoadedUser>();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const responseData = await sendRequest(
          `${import.meta.env.VITE_BACKEND_URL}/users/${auth.userId}`
        );
        if (responseData) {
          setLoadedUser(responseData.user);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchUser();
  }, [sendRequest, auth.userId]);

  if (isLoading && !loadedUser) {
    return (
      <div className="flex justify-center items-center my-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {loadedUser && (
        <div className="flex justify-center px-4">
          <Card className="w-full max-w-[30rem] p-6 mt-8">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-24 h-24 mb-3">
                <Avatar image={loadedUser.image} alt={loadedUser.name} width="96px" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 m-0">{loadedUser.name}</h2>
              <p className="text-gray-500 text-sm m-0">{loadedUser.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <p className="text-gray-500 m-0 mb-1">Birthday</p>
                <p className="text-gray-900 font-medium m-0">
                  {new Date(loadedUser.birthday).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-500 m-0 mb-1">Gender</p>
                <p className="text-gray-900 font-medium m-0 capitalize">{loadedUser.gender}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                to="/profile/edit"
                className="w-full rounded-lg border-blue-600 bg-blue-600 hover:bg-blue-700 hover:border-blue-600 text-white font-semibold py-3"
              >
                Edit Profile
              </Button>
              <Button
                to="/profile/password"
                inverse
                className="w-full rounded-lg border border-gray-300 !text-gray-800 font-semibold py-3 hover:!bg-gray-50"
              >
                Change Password
              </Button>
            </div>
          </Card>
        </div>
      )}
      {!isLoading && loadedUser && auth.userId && (<UserPlaces userId={auth.userId} />)}
    </>
  );
}

export default Profile;