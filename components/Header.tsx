import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import HeartIcon from './icons/HeartIcon';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-pink-500 no-underline">
          <HeartIcon className="w-8 h-8"/>
          <span>CornuScore</span>
        </Link>
        <ul className="flex items-center gap-4 md:gap-6 font-semibold">
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? 'text-pink-500 underline' : 'text-gray-700'}>
              Verify
            </NavLink>
          </li>
          <li>
            <NavLink to="/review" className={({ isActive }) => isActive ? 'text-pink-500 underline' : 'text-gray-700'}>
              Report
            </NavLink>
          </li>
          <li>
            <NavLink to="/ranking" className={({ isActive }) => isActive ? 'text-pink-500 underline' : 'text-gray-700'}>
              Ranking
            </NavLink>
          </li>
           <li>
            <NavLink to="/profile" className={({ isActive }) => isActive ? 'text-pink-500 underline' : 'text-gray-700'}>
              Perfil
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;