
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeartIcon from '../components/icons/HeartIcon';
import SearchIcon from '../components/icons/SearchIcon';
import { COUNTRY_LIST } from '../constants';

const HomePage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('Argentina');
  const [isSearching, setIsSearching] = useState(false);
  const COUNTRY_STORAGE_KEY = 'cornuscore-country';

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(COUNTRY_STORAGE_KEY);
      if (stored) setCountry(stored);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (country) window.localStorage.setItem(COUNTRY_STORAGE_KEY, country);
    } catch {}
  }, [country]);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && country) {
      setIsSearching(true);
      const q = encodeURIComponent(query.trim());
      const suffix = country ? `?country=${encodeURIComponent(country)}` : '';
      navigate(`/results/${q}${suffix}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center -mt-8 min-h-[70vh]">
            {/* <HeartIcon className="w-24 h-24 text-pink-500 mb-4 animate-pulse"/> */}
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-2">CornuScore</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md">
        Verifica la reputación de novios, parejas, ex, o amigos antes de que sea tarde.
      </p>

      <form onSubmit={handleSearch} className="w-full max-w-lg space-y-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ingresar nombre, apodo, celular o Instagram..."
            className="w-full pl-6 pr-16 py-5 text-xl rounded-full bg-slate-900 text-white placeholder-gray-400 border-2 border-slate-800 shadow-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <button 
            type="submit" 
            className="absolute inset-y-0 right-0 flex items-center justify-center w-14 h-full text-gray-300 hover:text-white"
            aria-label="Verify"
          >
            <SearchIcon className="w-7 h-7" />
          </button>
        </div>
        <div>
          <label htmlFor="search-country" className="block text-sm font-medium text-gray-700 mb-1">
            País (obligatorio)
          </label>
          <select
            id="search-country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-6 py-4 text-lg rounded-full bg-slate-900 text-white border-2 border-slate-800 shadow-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
            required
          >
            <option value="">Todos</option>
            {COUNTRY_LIST.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </form>
      <button 
        onClick={handleSearch}
        disabled={!query.trim() || !country}
        className="mt-6 w-full py-5 text-2xl font-extrabold uppercase text-white bg-pink-500 rounded-full shadow-lg ring-2 ring-sky-300 hover:bg-pink-600 transform hover:scale-[1.01] transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isSearching ? (
          <span className="inline-flex items-center gap-3">
            <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span>
            VERIFICANDO...
          </span>
        ) : (
          'VERIFY'
        )}
      </button>
    </div>
  );
};

export default HomePage;
