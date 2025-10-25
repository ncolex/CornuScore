import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import HeartIcon from './icons/HeartIcon';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const activeLinkStyle = {
    color: '#ec4899',
    textDecoration: 'underline',
  };

  const handleLogout = () => {
    logout();
    window.location.replace('#/');
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-md sticky top-0 z-50 dark:bg-gray-800/80 dark:border-b dark:border-gray-700">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-pink-500">
          <HeartIcon className="w-8 h-8"/>
          <span>CornuScore</span>
        </Link>
        <ul className="flex items-center gap-2 md:gap-4 font-semibold text-gray-700 dark:text-gray-300">
          <li>
            <NavLink to="/" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>
              Verify
            </NavLink>
          </li>
          <li>
            <NavLink to="/review" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>
              Report
            </NavLink>
          </li>
          <li>
            <NavLink to="/ranking" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>
              Ranking
            </NavLink>
          </li>
          {user ? (
            <>
              <li>
                <NavLink to="/profile" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>
                  Profile
                </NavLink>
              </li>
              <li>
                <button onClick={handleLogout} className="font-semibold text-gray-700 hover:text-pink-500 dark:text-gray-300 dark:hover:text-pink-400">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <NavLink to="/login" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>
                Login
              </NavLink>
            </li>
          )}
          <li>
            <ThemeToggle />
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;