import { createBrowserRouter, Navigate } from 'react-router-dom';

import RootLayout from './shared/components/Navigation/RootLayout';
import RequireAuth from './shared/components/Navigation/RequireAuth';
import RedirectIfAuthenticated from './shared/components/Navigation/RedirectIfAuthenticated';
import { Users, NewPlace, UserPlaces, UpdatePlace, Auth, ForgotPassword, ResetPassword, Profile, EditProfile, ChangePassword, Places } from './routes-config';

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