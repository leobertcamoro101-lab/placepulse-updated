import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Users, MapPin, PlusCircle, LogOut, LogIn } from 'lucide-react';
import { AuthContext } from '../../context/auth-context';

function NavLinks () {
  const auth = useContext(AuthContext);

  const linkClasses = ({ isActive }) =>
    `flex flex-col items-center justify-center px-4 py-2 border-b-2 transition-colors ${
      isActive
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-gray-500 hover:bg-gray-100'
    }`;

  return (
    <ul className="list-none m-0 p-0 w-full h-full flex flex-col justify-center items-center md:flex-row">
      <li className="md:mx-1">
        <NavLink to="/users" className={linkClasses} aria-label="All Users">
          <Users size={24} />
        </NavLink>
      </li>
      {auth.isLoggedIn && (
        <li className="md:mx-1">
          <NavLink to={`/${auth.userId}/places`} className={linkClasses} aria-label="My Places">
            <MapPin size={24} />
          </NavLink>
        </li>
      )}
      {auth.isLoggedIn && (
        <li className="md:mx-1">
          <NavLink to="/places/new" className={linkClasses} aria-label="Add Place">
            <PlusCircle size={24} />
          </NavLink>
        </li>
      )}
      {!auth.isLoggedIn && (
        <li className="md:mx-1">
          <NavLink to="/" className={linkClasses} aria-label="Authenticate">
            <LogIn size={24} />
          </NavLink>
        </li>
      )}
      {auth.isLoggedIn && (
        <li className="md:mx-1">
          <button
            onClick={auth.logout}
            aria-label="Logout"
            className="flex flex-col items-center justify-center px-4 py-2 border-b-2 border-transparent text-gray-500 hover:bg-gray-100 cursor-pointer bg-transparent focus:outline-none transition-colors"
          >
            <LogOut size={24} />
          </button>
        </li>
      )}
    </ul>
  );
};

export default NavLinks;