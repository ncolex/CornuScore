// Fix: Create the ResultsPage component to display search results.
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProfileByQuery, performWebChecks } from '../services/airtableService';
import { PersonProfile, WebCheckResult } from '../types';
import ReputationMeter from '../components/ReputationMeter';
import ReviewCard from '../components/ReviewCard';
import WebCheckTile from '../components/WebCheckTile';


const ResultsPage: React.FC = () => {
  const { query } = useParams<{ query: string }>();
  const [profile, setProfile] = useState<PersonProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [webResults, setWebResults] = useState<WebCheckResult[]>([]);
  const [isWebLoading, setIsWebLoading] = useState(true);

  useEffect(() => {
    const fetchProfileAndWebPresence = async () => {
      if (!query) return;
      
      setIsLoading(true);
      setIsWebLoading(true);
      
      // Fire both requests in parallel for better performance
      const profilePromise = getProfileByQuery(query);
      const webPromise = performWebChecks(query);
      
      const profileData = await profilePromise;
      setProfile(profileData);
      setIsLoading(false);
      
      const webData = await webPromise;
      setWebResults(webData);
      setIsWebLoading(false);
    };

    fetchProfileAndWebPresence();
  }, [query]);

  // Main loading state (only for the profile part)
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

  // Profile not found view
  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
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

  // Profile found view
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <ReputationMeter profile={profile} />

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Reseñas de la Comunidad ({profile.reviews.length})
        </h2>
        <div className="space-y-4">
          {profile.reviews.map(review => <ReviewCard key={review.id} review={review} />)}
        </div>
      </div>
      
      <WebPresenceContent />
    </div>
  );
};

export default ResultsPage;
