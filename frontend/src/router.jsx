import { createBrowserRouter, Navigate } from 'react-router-dom';
// import { lazy } from 'react';

import RootLayout from './shared/components/Navigation/RootLayout';
import RequireAuth from './shared/components/Navigation/RequireAuth';
import RedirectIfAuthenticated from './shared/components/Navigation/RedirectIfAuthenticated';
// import HomeRoute from './user/pages/HomeRoute';
import { Users, NewPlace, UserPlaces, UpdatePlace, Auth, ForgotPassword, ResetPassword, Profile, EditProfile, ChangePassword, Places } from './routes-config';


// const Users = lazy(() => import('./user/pages/Users'));
// const NewPlace = lazy(() => import('./places/pages/NewPlaces'));
// const UserPlaces = lazy(() => import('./places/pages/UserPlaces'));
// const UpdatePlace = lazy(() => import('./places/pages/UpdatePlace'));
// const Auth = lazy(() => import('./user/pages/Auth'));
// const ForgotPassword = lazy(() => import('./user/pages/ForgotPassword'));
// const ResetPassword = lazy(() => import('./user/pages/ResetPassword'));
// const Profile = lazy(() => import('./user/pages/Profile'));
// const EditProfile = lazy(() => import('./user/pages/EditProfile'));
// const ChangePassword = lazy(() => import('./user/pages/ChangePassword'));
// const Places = lazy(() => import('./places/pages/Places'));

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: (
          <RedirectIfAuthenticated>
            <Auth />
          </RedirectIfAuthenticated>
        ),
      },
      { path: "users", element: <Users /> },
      { path: ":userId/places", element: <UserPlaces /> },
      {
        path: "places/new",
        element: (
          <RequireAuth>
            <NewPlace />
          </RequireAuth>
        ),
      },
      {
        path: "places/:placeId",
        element: (
          <RequireAuth>
            <UpdatePlace />
          </RequireAuth>
        ),
      },
      { path: "*", element: <Navigate to="/" replace /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password/:token", element: <ResetPassword /> },
      {
        path: "profile",
        element: (
          <RequireAuth>
            <Profile />
          </RequireAuth>
        ),
      },
      {
        path: "profile/edit",
        element: (
          <RequireAuth>
            <EditProfile />
          </RequireAuth>
        ),
      },
      {
        path: "profile/password",
        element: (
          <RequireAuth>
            <ChangePassword />
          </RequireAuth>
        ),
      },
      { path: "places", element: <Places /> },
    ],
  },
]);

export default router;

// notes change HomeRoute to Auth (or not) if you change the AccountMenu.jsx to go directly to Auth instead of HomeRoute.