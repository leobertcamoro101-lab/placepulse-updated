import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/auth-context';

function RedirectIfAuthenticated({ children }) {
  const auth = useContext(AuthContext);

  if (auth.isLoggedIn) {
    return <Navigate to="/places" replace />;
  }

  return children;
}

export default RedirectIfAuthenticated;