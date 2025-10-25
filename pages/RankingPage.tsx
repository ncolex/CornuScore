import React, { useState, useEffect } from 'react';
import { getRankings } from '../services/airtableService';
import { PersonProfile } from '../types';
import RankingList from '../components/RankingList';

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
        <RankingList 
          title="Top 5 Negativos" 
          profiles={rankings?.topNegative || []} 
          icon="fa-solid fa-arrow-trend-down"
          color="text-red-600"
        />
        <RankingList 
          title="Top 5 Positivos" 
          profiles={rankings?.topPositive || []} 
          icon="fa-solid fa-arrow-trend-up"
          color="text-green-600"
        />
      </div>
    </div>
  );
};

export default RankingPage;