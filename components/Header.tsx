import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import HeartIcon from './icons/HeartIcon';
import { useAuth } from '../hooks/useAuth';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const activeLinkStyle = {
    color: '#ec4899',
    textDecoration: 'underline',
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-pink-500">
          <HeartIcon className="w-8 h-8"/>
          <span>CornuScore</span>
        </Link>
        <ul className="flex items-center gap-4 md:gap-6 font-semibold text-gray-700">
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
                <button onClick={handleLogout} className="font-semibold text-gray-700 hover:text-pink-500">
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
        </ul>
      </nav>
    </header>
  );
};

export default Header;