import { useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, ChevronDown, Users } from 'lucide-react';
import { AuthContext } from '../../context/auth-context';
import Avatar from '../UIElements/Avatar';

interface AccountMenuProps {
  variant?: 'dropdown' | 'inline';
}

function AccountMenu({ variant = 'dropdown' }: AccountMenuProps) {
  const auth = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!auth.isLoggedIn) return null;

  const linkClasses =
    'w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 no-underline';

  if (variant === 'inline') {
    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="w-8 h-8">
            <Avatar image={auth.image ?? undefined} alt="Profile" width="32px" />
          </div>
          <span className="text-sm font-semibold text-gray-900">{auth.name}</span>
        </div>
        <Link to="/profile" className={linkClasses}>
          <User size={16} /> Profile
        </Link>
        <Link to="/users" aria-label="All Users" className={linkClasses}>
          <Users size={16} /> Users
        </Link>
        <Link
          to="/"
          onClick={() => auth.logout()}
          aria-label="Logout"
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut size={16} /> Logout
        </Link>
      </div>
    );
  }

  return (
    <div className="relative ml-auto" ref={menuRef}>
      <button
        onClick={() => setMenuOpen((open) => !open)}
        className="flex items-center gap-1 px-2 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Account menu"
      >
        <div className="w-8 h-8">
          <Avatar image={auth.image ?? undefined} alt="Profile" width="32px" />
        </div>
        <ChevronDown size={16} className="text-gray-500" />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
          <Link to="/profile" onClick={() => setMenuOpen(false)} className={linkClasses}>
            <User size={16} /> Profile
          </Link>
          <Link to="/users" aria-label="All Users" className={linkClasses}>
            <Users size={16} /> Users
          </Link>
          <Link
            to="/"
            onClick={() => {
              setMenuOpen(false);
              auth.logout();
            }}
            aria-label="Logout"
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} /> Logout
          </Link>
        </div>
      )}
    </div>
  );
}

export default AccountMenu;