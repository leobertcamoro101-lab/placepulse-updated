import React, { Suspense, useContext } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
  useLocation
} from 'react-router-dom';

import MainNavigation from './shared/components/Navigation/MainNavigation';
import { AuthContext } from './shared/context/auth-context';
import { useAuth } from './shared/hooks/auth-hook';
import LoadingSpinner from './shared/components/UIElements/LoadingSpinner';

const Users = React.lazy(() => import('./user/pages/Users'));
const NewPlace = React.lazy(() => import('./places/pages/NewPlaces'));
const UserPlaces = React.lazy(() => import('./places/pages/UserPlaces'));
const UpdatePlace = React.lazy(() => import('./places/pages/UpdatePlace'));
const Auth = React.lazy(() => import('./user/pages/Auth'));

// Layout shared by every route — handles nav visibility + Suspense fallback
function RootLayout() {
  const location = useLocation();
  const { token } = useContext(AuthContext);
  const hideNav = location.pathname === '/' && !token;

  return (
    <>
      {!hideNav && <MainNavigation />}
      <main className={hideNav ? '' : 'pt-16'}>
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><LoadingSpinner/></div>}>
          <Outlet />
        </Suspense>
      </main>
    </>
  );
}

// "/" shows Auth when logged out, Users when logged in
function HomeRoute() {
  const { token } = useContext(AuthContext);
  return token ? <Users /> : <Auth />;
}

// Wrap any route that should only be reachable while logged in
function RequireAuth({ children }) {
  const { token } = useContext(AuthContext);
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomeRoute /> },
      { path: 'users', element: <Users /> },
      { path: ':userId/places', element: <UserPlaces /> },
      {
        path: 'places/new',
        element: <RequireAuth><NewPlace /></RequireAuth>
      },
      {
        path: 'places/:placeId',
        element: <RequireAuth><UpdatePlace /></RequireAuth>
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

const App = () => {
  const { token, login, logout, userId } = useAuth();

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token: token,
        userId: userId,
        login: login,
        logout: logout,
      }}
    >
      <RouterProvider router={router} />
    </AuthContext.Provider>
  );
};

export default App;