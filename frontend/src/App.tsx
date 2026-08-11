import { RouterProvider } from 'react-router-dom';

import { AuthContext } from './shared/context/auth-context';
import { LoadingProvider } from './shared/context/LoadingProvider';
import { useAuth } from './shared/hooks/auth-hook';
import router from './router';

const App = () => {
  const { token, login, logout, userId, name, image, updateUserInfo } = useAuth();

  return (
    <LoadingProvider>
      <AuthContext.Provider
        value={{
          isLoggedIn: !!token,
          token: token,
          userId: userId,
          name: name,
          image: image,
          login: login,
          logout: logout,
          updateUserInfo: updateUserInfo,
        }}
      >
        <RouterProvider router={router} />
      </AuthContext.Provider>
    </LoadingProvider>
  );
};

export default App;