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
  
  const RankingListSkeleton: React.FC = () => (
    <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white/70 backdrop-blur-sm p-4 rounded-xl shadow-md flex items-center gap-4 animate-pulse dark:bg-gray-800/70">
                <div className="w-10 h-7 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                <div className="flex-grow space-y-2">
                    <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            </div>
        ))}
    </div>
  );

  if (isLoading) {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-center text-pink-500 mb-8">Rankings de la Comunidad</h1>
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-4/5 sm:w-1/2 mx-auto mb-4 animate-pulse"></div>
                    <RankingListSkeleton />
                </div>
                <div>
                    <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-4/5 sm:w-1/2 mx-auto mb-4 animate-pulse"></div>
                    <RankingListSkeleton />
                </div>
            </div>
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