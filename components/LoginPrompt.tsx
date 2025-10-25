import React from 'react';
import { Link } from 'react-router-dom';

interface LoginPromptProps {
  message: string;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ message }) => {
  return (
    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-2xl p-4 text-center dark:bg-gray-900/50">
      <i className="fa-solid fa-lock text-4xl text-pink-500 mb-3"></i>
      <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">{message}</p>
      <Link 
        to="/login"
        className="px-6 py-2 font-bold text-white bg-pink-500 rounded-full shadow-lg hover:bg-pink-600 transform hover:scale-105 transition-all"
      >
        Iniciar Sesión
      </Link>
    </div>
  );
};

export default LoginPrompt;