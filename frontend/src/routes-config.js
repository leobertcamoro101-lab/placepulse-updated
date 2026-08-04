import { lazy } from 'react';

export const Users = lazy(() => import('./user/pages/Users'));
export const NewPlace = lazy(() => import('./places/pages/NewPlaces'));
export const UserPlaces = lazy(() => import('./places/pages/UserPlaces'));
export const UpdatePlace = lazy(() => import('./places/pages/UpdatePlace'));
export const ForgotPassword = lazy(() => import('./user/pages/ForgotPassword'));
export const ResetPassword = lazy(() => import('./user/pages/ResetPassword'));
export const Profile = lazy(() => import('./user/pages/Profile'));
export const EditProfile = lazy(() => import('./user/pages/EditProfile'));
export const ChangePassword = lazy(() => import('./user/pages/ChangePassword'));