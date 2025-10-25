import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProfileByQuery, performWebChecks } from '../services/airtableService';
import { PersonProfile, WebCheckResult } from '../types';
import ReputationMeter from '../components/ReputationMeter';
import ReviewCard from '../components/ReviewCard';
import WebCheckTile from '../components/WebCheckTile';
import InstagramProfileCard from '../components/InstagramProfileCard';

const ResultsPage: React.FC = () => {
  const { query } = useParams<{ query: string }>();
  const [profile, setProfile] = useState<PersonProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [webResults, setWebResults] = useState<WebCheckResult[]>([]);
  const [isWebLoading, setIsWebLoading] = useState(true);
  const [webError, setWebError] = useState<string | null>(null);

  const summaryStats = useMemo(() => {
    if (!profile) {
      return null;
    }

    const positiveReviews = profile.reviews.filter(r => r.score > 0).length;
    const negativeReviews = profile.reviews.filter(r => r.score < 0).length;

    return {
      totalScore: profile.totalScore,
      reviewCount: profile.reviews.length,
      positiveReviews,
      negativeReviews,
    };
  }, [profile]);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!query) return;

      setIsLoading(true);
      setIsWebLoading(true);
      setWebError(null);

      // Using Promise.allSettled to handle promises in parallel, even if one fails
      const [profileResult, webResult] = await Promise.allSettled([
        getProfileByQuery(query),
        performWebChecks(query),
      ]);

      // Handle Profile Result
      if (profileResult.status === 'fulfilled') {
        setProfile(profileResult.value);
      } else {
        console.error("Failed to fetch profile:", profileResult.reason);
        setProfile(null);
      }
      setIsLoading(false);

      // Handle Web Presence Result
      if (webResult.status === 'fulfilled') {
        const sortedWebData = [...webResult.value].sort((a, b) => {
            const isABadooFound = a.source === 'Badoo' && a.status === 'found';
            const isBBadooFound = b.source === 'Badoo' && b.status === 'found';
            if (isABadooFound && !isBBadooFound) return -1;
            if (!isABadooFound && isBBadooFound) return 1;
            return 0;
        });
        setWebResults(sortedWebData);
      } else {
        console.error("Web presence check failed:", webResult.reason);
        setWebError('La verificación de presencia en la web falló. Por favor, inténtalo de nuevo más tarde.');
        setWebResults([]);
      }
      setIsWebLoading(false);
    };

    fetchAllData();
  }, [query]);

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
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Presencia en la Web
        </h2>
        {isWebLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-400 mx-auto"></div>
            <p className="mt-3 text-sm font-semibold text-gray-600">Buscando perfiles públicos...</p>
          </div>
        ) : webError ? (
            <div className="text-center text-red-600 bg-red-100 p-4 rounded-xl shadow-md border border-red-200">
                <i className="fa-solid fa-circle-exclamation mr-2"></i>
                {webError}
            </div>
        ) : (
          <div className="space-y-4">
            {webResults.length > 0 ? (
              webResults.map(result => <WebCheckTile key={result.id} result={result} />)
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

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center bg-white/80 p-8 rounded-2xl shadow-lg">
          <i className="fa-solid fa-user-slash text-6xl text-pink-300 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Aún no hay reseñas para "{query}"</h2>
          <p className="text-gray-600 mb-6">No hemos encontrado un perfil en nuestra base de datos, ¡pero tú puedes ser el primero en crear una reseña! Mientras tanto, hemos buscado su presencia en la web y perfiles de Instagram.</p>
          <Link 
            to="/review" 
            className="px-8 py-3 text-lg font-bold text-white bg-pink-500 rounded-full shadow-lg hover:bg-pink-600 transform hover:scale-105 transition-all"
          >
            Crear Reseña
          </Link>
        </div>
        
        <InstagramProfileCard profile={null} query={query || ''} />
        
        <WebPresenceContent />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <ReputationMeter profile={profile} />

      <InstagramProfileCard profile={profile} query={query || ''} />

      <WebPresenceContent />
      
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Reseñas de la Comunidad ({profile.reviews.length})
        </h2>

        {summaryStats && profile.reviews.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/30 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Resumen de Reputación</h3>
              <div className="grid grid-cols-3 divide-x divide-gray-200 text-center">
                <div className="px-2">
                  <p className="text-3xl font-bold text-pink-500">{summaryStats.totalScore}</p>
                  <p className="text-sm text-gray-600 font-semibold">Puntaje Total</p>
                </div>
                <div className="px-2">
                  <p className="text-3xl font-bold text-gray-700">{summaryStats.reviewCount}</p>
                  <p className="text-sm text-gray-600 font-semibold">Reseñas</p>
                </div>
                <div className="px-2">
                  <p className="text-3xl font-bold">
                    <span className="text-red-500">{summaryStats.negativeReviews}</span> / <span className="text-green-500">{summaryStats.positiveReviews}</span>
                  </p>
                  <p className="text-sm text-gray-600 font-semibold">Neg. / Pos.</p>
                </div>
              </div>
            </div>
          )}

        {profile.reviews.length > 0 ? (
          <div className="space-y-4 relative">
            {profile.reviews.map(review => <ReviewCard key={review.id} review={review} />)}
          </div>
        ) : (
            <div className="text-center bg-white/80 p-8 rounded-2xl shadow-lg">
                <i className="fa-solid fa-file-circle-question text-6xl text-pink-300 mb-4"></i>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Sin Reseñas Aún</h2>
                <p className="text-gray-600 mb-6">Sé el primero en dejar una reseña sobre "{profile.identifiers[0]}". Tu aporte ayuda a la comunidad.</p>
                <Link 
                    to="/review" 
                    className="px-8 py-3 text-lg font-bold text-white bg-pink-500 rounded-full shadow-lg hover:bg-pink-600 transform hover:scale-105 transition-all"
                >
                    Crear Reseña
                </Link>
            </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;