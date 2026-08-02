import { createBrowserRouter, Navigate } from 'react-router-dom';
// import { lazy } from 'react';

import RootLayout from './shared/components/Navigation/RootLayout';
import RequireAuth from './shared/components/Navigation/RequireAuth';
import HomeRoute from './user/pages/HomeRoute';
import { Users, NewPlace, UserPlaces, UpdatePlace } from './routes-config';


// const Users = lazy(() => import('./user/pages/Users'));
// const NewPlace = lazy(() => import('./places/pages/NewPlaces'));
// const UserPlaces = lazy(() => import('./places/pages/UserPlaces'));
// const UpdatePlace = lazy(() => import('./places/pages/UpdatePlace'));

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

export default router;

// notes change HomeRoute to Auth if you change the Navlinks.jsx to go directly to Auth instead of HomeRoute.