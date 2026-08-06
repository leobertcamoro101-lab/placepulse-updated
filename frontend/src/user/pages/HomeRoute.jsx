import { useContext, lazy } from 'react';
import { AuthContext } from '../../shared/context/auth-context';

const Places = lazy(() => import('./Places'));
const Auth = lazy(() => import('./Auth'));

function HomeRoute() {
  const { token } = useContext(AuthContext);
  return token ? <Places /> : <Auth />;
}

export default HomeRoute;

// import { useContext , lazy } from 'react';
// import { AuthContext } from '../../shared/context/auth-context';
// // import Users from './Users';
// // import Auth from './Auth';
// const Users = lazy(() => import('./Users'));
// const Auth = lazy(() => import('./Auth'));

// function HomeRoute() {
//   const { token } = useContext(AuthContext);
//   return token ? <Users /> : <Auth />;
// }

// export default HomeRoute;