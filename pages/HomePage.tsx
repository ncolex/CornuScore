
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeartIcon from '../components/icons/HeartIcon';
import SearchIcon from '../components/icons/SearchIcon';

const HomePage: React.FC = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/results/${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center -mt-8 min-h-[70vh]">
            {/* <HeartIcon className="w-24 h-24 text-pink-500 mb-4 animate-pulse"/> */}
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-2">CornuScore</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md">
        Verifica la reputación de novios, parejas, ex, o amigos antes de que sea tarde.
      </p>

      <form onSubmit={handleSearch} className="w-full max-w-lg">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ingresar nombre, apodo, celular o Instagram..."
            className="w-full pl-5 pr-14 py-4 text-lg border-2 border-pink-200 rounded-full shadow-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition-all"
          />
          <button 
            type="submit" 
            className="absolute inset-y-0 right-0 flex items-center justify-center w-14 h-full text-pink-500 hover:text-pink-700"
            aria-label="Verify"
          >
            <SearchIcon className="w-7 h-7" />
          </button>
        </div>
      </form>
      <button 
        onClick={handleSearch}
        disabled={!query.trim()}
        className="mt-6 px-12 py-4 text-xl font-bold text-white bg-pink-500 rounded-full shadow-lg hover:bg-pink-600 transform hover:scale-105 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        VERIFY
      </button>
    </div>
  );
};

export default HomePage;
