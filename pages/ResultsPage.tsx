import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { performWebChecks } from '../services/webCheckService';
import { PersonProfile, WebCheckResult } from '../types';
import ReputationMeter from '../components/ReputationMeter';
import ReviewCard from '../components/ReviewCard';
import WebCheckTile from '../components/WebCheckTile';
import { useAuth } from '../contexts/AuthContext';
import LoginPrompt from '../components/LoginPrompt';

const ResultsPage: React.FC = () => {
  const { query } = useParams<{ query: string }>();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedCountry = params.get('country') || '';
  const { user } = useAuth();

  const [profiles, setProfiles] = useState<PersonProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [webResults, setWebResults] = useState<WebCheckResult[]>([]);
  const [isWebLoading, setIsWebLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isBlurred = !user;

  useEffect(() => {
    const fetchProfileAndWebPresence = async () => {
      if (!query) {
        return;
      }

      setIsLoading(true);
      setIsWebLoading(true);
      setError(null);

      const webPromise = performWebChecks(query);

      try {
        const response = await fetch(`/.netlify/functions/searchProfiles?query=${encodeURIComponent(query)}&limit=5&country=${encodeURIComponent(selectedCountry)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch profiles');
        }
        const payload = await response.json();
        setProfiles(Array.isArray(payload) ? payload : []);
      } catch (fetchError) {
        console.error('Failed to fetch profiles', fetchError);
        setProfiles([]);
        setError('No se pudieron obtener los perfiles internos.');
      } finally {
        setIsLoading(false);
      }

      try {
        const webData = await webPromise;
        setWebResults(webData);
      } catch (webError) {
        console.error('Failed to resolve web presence', webError);
        setWebResults([]);
      } finally {
        setIsWebLoading(false);
      }
    };

    fetchProfileAndWebPresence();
  }, [query, selectedCountry]);

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mx-auto"></div>
        <p className="mt-4 text-lg font-semibold text-gray-700">Verificando reputación de "{query}"...</p>
      </div>
    );
  }

  const WebPresenceContent = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Presencia en la Web</h2>
      {isWebLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-400 mx-auto"></div>
          <p className="mt-3 text-sm font-semibold text-gray-600">Buscando perfiles públicos...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {webResults.length > 0 ? (
            webResults.map((result) => <WebCheckTile key={result.id} result={result} />)
          ) : (
            <p className="text-center text-gray-500 bg-white/80 p-6 rounded-xl shadow-md">
              No se encontraron perfiles públicos relevantes en la búsqueda automática.
            </p>
          )}
          <p className="text-xs text-center text-gray-500 pt-2">Resultados de búsqueda simulados para fines de demostración.</p>
        </div>
      )}
    </div>
  );

  if (!profiles || profiles.length === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        {error && (
          <p className="text-center text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl py-3 px-4">{error}</p>
        )}
        <div className="text-center bg-white/80 p-8 rounded-2xl shadow-lg">
          <i className="fa-solid fa-user-slash text-6xl text-pink-300 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sin Resultados Internos</h2>
          <p className="text-gray-600 mb-6">No se encontraron reseñas para "{query}" en nuestra base de datos. ¿Quieres ser el primero en dejar una?</p>
          <Link
            to="/review"
            className="px-8 py-3 text-lg font-bold text-white bg-pink-500 rounded-full shadow-lg hover:bg-pink-600 transform hover:scale-105 transition-all"
          >
            Crear Reseña
          </Link>
        </div>
        <WebPresenceContent />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {profiles.map((profile) => (
        <div key={profile.id} className="space-y-6">
          <ReputationMeter profile={profile} blurred={isBlurred} />
          <div className="flex justify-end">
            <Link
              to="/review"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-pink-500 rounded-full shadow hover:bg-pink-600"
            >
              <i className="fa-solid fa-flag"></i> Reportar
            </Link>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Reseñas de la Comunidad ({profile.reviewsCount ?? profile.reviews.length})
            </h2>
            <div className="space-y-4 relative">
              {isBlurred && <LoginPrompt message="Inicia sesión para leer las reseñas y ver la evidencia." />}
              {profile.reviews.map((review) => (
                <ReviewCard key={review.id} review={review} blurred={isBlurred} />
              ))}
            </div>
          </div>
        </div>
      ))}

      <WebPresenceContent />
    </div>
  );
};

export default ResultsPage;
