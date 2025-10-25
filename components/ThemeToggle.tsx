import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 w-10 h-10 flex items-center justify-center rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors"
      aria-label="Toggle dark mode"
    >
      {theme === 'light' ? (
        <i className="fa-solid fa-moon text-xl"></i>
      ) : (
        <i className="fa-solid fa-sun text-xl"></i>
      )}
    </button>
  );
};

export default ThemeToggle;
