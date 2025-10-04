import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import HeartIcon from './icons/HeartIcon';
import { useAuth } from '../contexts/AuthContext';

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
           <li>
            <NavLink to="/profile" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>
              Perfil
            </NavLink>
          </li>
          {user && (
            <li>
              <NavLink to="/ai-generator" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)} className="flex items-center gap-1">
                <i className="fa-solid fa-wand-magic-sparkles text-pink-500"></i>
                AI Gen
              </NavLink>
            </li>
          )}
          <li>
            {user ? (
              <button onClick={handleLogout} className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold hover:bg-pink-600">
                Logout
              </button>
            ) : (
              <NavLink to="/login" className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold hover:bg-pink-600">
                Login
              </NavLink>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;