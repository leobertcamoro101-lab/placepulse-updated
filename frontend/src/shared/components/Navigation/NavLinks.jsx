import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/auth-context';

function NavLinks () {
  const auth = useContext(AuthContext);

  // Common styling classes for links to prevent repeating long Tailwind strings
  const linkClasses = ({ isActive }) => 
    `border text-sm block p-2 transition-colors ${
      isActive 
        ? 'bg-[#f8df00] border-[#292929] text-[#292929]' 
        : 'border-transparent text-[#292929] md:text-[#606366] hover:bg-[#f8df00] hover:border-[#292929] hover:text-[#292929] active:bg-[#f8df00] active:border-[#292929] active:text-[#292929]'
    }`;

  return (
    <ul className="list-none m-0 p-0 w-full h-full flex flex-col justify-center items-center md:flex-row">
      <li className="m-4 md:my-0 md:mx-2">
        <NavLink to="/" className={linkClasses}>
          ALL USERS
        </NavLink>
      </li>
      {auth.isLoggedIn && (
        <li className="m-4 md:my-0 md:mx-2">
          <NavLink to={`/${auth.userId}/places`} className={linkClasses}>
            MY PLACES
          </NavLink>
        </li>
      )}
      {auth.isLoggedIn && (
        <li className="m-4 md:my-0 md:mx-2">
          <NavLink to="/places/new" className={linkClasses}>
            ADD PLACE
          </NavLink>
        </li>
      )}
      {!auth.isLoggedIn && (
        <li className="m-4 md:my-0 md:mx-2">
          <NavLink to="/auth" className={linkClasses}>
            AUTHENTICATE
          </NavLink>
        </li>
      )}
      {auth.isLoggedIn && (
        <li className="m-4 md:my-0 md:mx-2">
          <button 
            onClick={auth.logout}
            className="cursor-pointer border border-[#292929] text-[#292929] bg-transparent p-2 font-inherit focus:outline-none hover:bg-[#292929] hover:text-white active:bg-[#292929] active:text-white md:border-white md:text-[#606366] md:hover:bg-[#f8df00] md:hover:text-[#292929] md:hover:border-[#292929] md:active:bg-[#f8df00] md:active:text-[#292929] md:active:border-[#292929]"
          >
            LOGOUT
          </button>
        </li>
      )}
    </ul>
  );
};

export default NavLinks;
