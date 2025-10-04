
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRankings } from '../services/airtableService';
import { PersonProfile } from '../types';
import { REPUTATION_LEVELS } from '../constants';

const RankingCard: React.FC<{ profile: PersonProfile; rank: number }> = ({ profile, rank }) => {
  const reputationDetails = REPUTATION_LEVELS[profile.reputation];
  return (
    <Link to={`/results/${encodeURIComponent(profile.identifiers[0])}`} className="block">
      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md border border-white/30 flex items-center gap-4 hover:shadow-lg hover:border-pink-300 transition-all transform hover:scale-105">
        <span className={`text-2xl font-bold w-10 text-center ${reputationDetails.color}`}>#{rank}</span>
        <div className="flex-grow">
          <p className="font-bold text-lg text-gray-800 capitalize">{profile.identifiers[0]}</p>
          <p className="text-sm text-gray-500">{profile.reviews.length} reseñas</p>
        </div>
        <i className={`${reputationDetails.icon} text-3xl ${reputationDetails.color}`}></i>
      </div>
    </Link>
  );
};


const RankingPage: React.FC = () => {
  const [rankings, setRankings] = useState<{ topNegative: PersonProfile[], topPositive: PersonProfile[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      setIsLoading(true);
      const data = await getRankings();
      setRankings(data);
      setIsLoading(false);
    };
    fetchRankings();
  }, []);
  
  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mx-auto"></div>
        <p className="mt-4 text-lg font-semibold text-gray-700">Cargando Rankings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-pink-500 mb-8">Rankings de la Comunidad</h1>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Top Negativo */}
        <div>
          <h2 className="text-2xl font-bold text-center text-red-600 mb-4 flex items-center justify-center gap-2">
            <i className="fa-solid fa-arrow-trend-down"></i>
            Top 5 Negativos
          </h2>
          <div className="space-y-3">
            {rankings?.topNegative.map((profile, index) => (
              <RankingCard key={profile.id} profile={profile} rank={index + 1} />
            ))}
          </div>
        </div>

        {/* Top Positivo */}
        <div>
           <h2 className="text-2xl font-bold text-center text-green-600 mb-4 flex items-center justify-center gap-2">
            <i className="fa-solid fa-arrow-trend-up"></i>
            Top 5 Positivos
          </h2>
          <div className="space-y-3">
             {rankings?.topPositive.map((profile, index) => (
              <RankingCard key={profile.id} profile={profile} rank={index + 1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingPage;
