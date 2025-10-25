import React from 'react';
import { Link } from 'react-router-dom';
import { PersonProfile } from '../types';
import { REPUTATION_LEVELS } from '../constants';

interface RankingListProps {
  title: string;
  profiles: PersonProfile[];
  icon: string;
  color: string;
}

const RankingCard: React.FC<{ profile: PersonProfile; rank: number }> = ({ profile, rank }) => {
  const reputationDetails = REPUTATION_LEVELS[profile.reputation];
  return (
    <Link to={`/results/${encodeURIComponent(profile.identifiers[0])}`} className="block">
      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md border border-white/30 flex items-center gap-4 hover:shadow-lg hover:border-pink-300 transition-all transform hover:scale-105 dark:bg-gray-800/80 dark:border-gray-700 dark:hover:border-pink-600">
        <span className={`text-2xl font-bold w-10 text-center ${reputationDetails.color}`}>#{rank}</span>
        <div className="flex-grow">
          <p className="font-bold text-lg text-gray-800 dark:text-gray-200 capitalize">{profile.identifiers[0]}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{profile.reviews.length} reseñas</p>
        </div>
        <i className={`${reputationDetails.icon} text-3xl ${reputationDetails.color}`}></i>
      </div>
    </Link>
  );
};

const RankingList: React.FC<RankingListProps> = ({ title, profiles, icon, color }) => {
  return (
    <div>
      <h2 className={`text-2xl font-bold text-center ${color} mb-4 flex items-center justify-center gap-2`}>
        <i className={icon}></i>
        {title}
      </h2>
      <div className="space-y-3">
        {profiles.map((profile, index) => (
          <RankingCard key={profile.id} profile={profile} rank={index + 1} />
        ))}
      </div>
    </div>
  );
};

export default RankingList;