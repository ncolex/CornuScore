
import React from 'react';
import { PersonProfile } from '../types';
import { REPUTATION_LEVELS, countryFlagEmoji } from '../constants';

interface ReputationMeterProps {
  profile: PersonProfile;
}

const ReputationMeter: React.FC<ReputationMeterProps> = ({ profile }) => {
  const reputationDetails = REPUTATION_LEVELS[profile.reputation];
  
  const getProgressBarWidth = () => {
    switch (profile.reputation) {
      case 'POSITIVE': return '100%';
      case 'WARNING': return '50%';
      case 'RISK': return '15%';
      default: return '0%';
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/30 text-center">
      <h2 className="text-xl font-bold text-gray-800 mb-1">Reputación de</h2>
      <p className="text-2xl font-bold text-pink-500 mb-1 capitalize flex items-center gap-2 justify-center">
        <span>{profile.identifiers[0]}</span>
        <span title={profile.country} aria-label={profile.country} className="text-xl">
          {countryFlagEmoji(profile.country)}
        </span>
      </p>
      <p className="text-sm text-gray-500 mb-4 flex items-center justify-center gap-1">
        <i className="fa-solid fa-location-dot"></i>
        {profile.country}
      </p>
      
      <div className="flex justify-center items-center gap-4 mb-4">
        <div className={`p-4 rounded-full ${reputationDetails.progressColor}`}>
          <i className={`${reputationDetails.icon} text-4xl text-white`}></i>
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-700">Resultado:</p>
          <p className={`text-3xl font-bold ${reputationDetails.color} flex items-center gap-2`}>
            {profile.semaforoEmoji && <span>{profile.semaforoEmoji}</span>}
            <span>{reputationDetails.label}</span>
          </p>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div 
          className={`h-4 rounded-full ${reputationDetails.progressColor} transition-all duration-500 ease-out`} 
          style={{ width: getProgressBarWidth() }}
        ></div>
      </div>
      <p className="text-sm text-gray-500 mt-2">{profile.reviewsCount} reseña(s).</p>
    </div>
  );
};

export default ReputationMeter;
