import { createBrowserRouter, Navigate } from 'react-router-dom';
// import { lazy } from 'react';

import RootLayout from './shared/components/Navigation/RootLayout';
import RequireAuth from './shared/components/Navigation/RequireAuth';
import HomeRoute from './user/pages/HomeRoute';
import { Users, NewPlace, UserPlaces, UpdatePlace, ForgotPassword, ResetPassword } from './routes-config';


// const Users = lazy(() => import('./user/pages/Users'));
// const NewPlace = lazy(() => import('./places/pages/NewPlaces'));
// const UserPlaces = lazy(() => import('./places/pages/UserPlaces'));
// const UpdatePlace = lazy(() => import('./places/pages/UpdatePlace'));
// const ForgotPassword = lazy(() => import('./user/pages/ForgotPassword'));
// const ResetPassword = lazy(() => import('./user/pages/ResetPassword'));

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
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'reset-password/:token', element: <ResetPassword /> },
    ],
  },
]);

export default router;

// notes change HomeRoute to Auth (or not) if you change the Navlinks.jsx to go directly to Auth instead of HomeRoute.