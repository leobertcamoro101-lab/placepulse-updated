import { Suspense, useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import MainNavigation from './MainNavigation';
import { AuthContext } from '../../context/auth-context';
import LoadingSpinner from '../UIElements/LoadingSpinner';

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

export default RootLayout;