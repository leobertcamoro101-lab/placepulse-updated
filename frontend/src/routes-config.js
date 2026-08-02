import { lazy } from 'react';

export const Users = lazy(() => import('./user/pages/Users'));
export const NewPlace = lazy(() => import('./places/pages/NewPlaces'));
export const UserPlaces = lazy(() => import('./places/pages/UserPlaces'));
export const UpdatePlace = lazy(() => import('./places/pages/UpdatePlace'));