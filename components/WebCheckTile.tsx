// Fix: Create WebCheckTile component to display web search results.
import React from 'react';
import { WebCheckResult } from '../types';

interface WebCheckTileProps {
  result: WebCheckResult;
}

const WebCheckTile: React.FC<WebCheckTileProps> = ({ result }) => {
  // Special case for Badoo "found" status
  if (result.source === 'Badoo' && result.status === 'found') {
    return (
       <a 
        href={result.link} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="block bg-red-50/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border-2 border-red-300 transition-all transform hover:scale-[1.03]"
      >
        <div className="flex items-center gap-4">
          <i className="fa-solid fa-heart-crack text-red-500 text-4xl text-center w-10"></i>
          <div className="flex-grow">
            <p className="font-bold text-red-800 text-lg leading-tight">{result.title}</p>
            <p className="text-sm text-red-700 mt-1">{result.snippet}</p>
          </div>
          <i className="fa-solid fa-chevron-right text-red-400 self-center"></i>
        </div>
      </a>
    );
  }
    
  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'google': return 'fa-brands fa-google';
      case 'facebook': return 'fa-brands fa-facebook';
      case 'instagram': return 'fa-brands fa-instagram';
      case 'tiktok': return 'fa-brands fa-tiktok';
      case 'tinder': return 'fa-solid fa-fire';
      case 'badoo': return 'fa-solid fa-heart-circle-check'; // Custom icon for Badoo
      case 'skokka': return 'fa-solid fa-user-secret';
      case 'duckduckgo': return 'fa-brands fa-duckduckgo';
      case 'yandex': return 'fa-brands fa-yandex';
      default: return 'fa-solid fa-globe';
    }
  };

  const getStatusIcon = () => {
      switch (result.status) {
          case 'found':
              return { icon: 'fa-solid fa-circle-check', color: 'text-green-500' };
          case 'not_found':
              return { icon: 'fa-solid fa-circle-xmark', color: 'text-red-500' };
          case 'info':
          default:
              return { icon: getSourceIcon(result.source), color: 'text-pink-500' };
      }
  };

  const isClickable = result.link !== '#';
  const statusDetails = getStatusIcon();

  const tileContent = (
    <div className="flex items-center gap-4">
      <i className={`${statusDetails.icon} ${statusDetails.color} text-2xl text-center w-6`}></i>
      <div className="flex-grow">
        <p className="font-semibold text-gray-800 leading-tight">{result.title}</p>
        <p className="text-sm text-gray-600 mt-1">{result.snippet}</p>
      </div>
      {isClickable && <i className="fa-solid fa-chevron-right text-gray-400 self-center"></i>}
    </div>
  );

  const commonClasses = "block bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md border border-white/30 transition-all";

  if (isClickable) {
    return (
      <a 
        href={result.link} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={`${commonClasses} hover:shadow-lg hover:border-pink-300 transform hover:scale-[1.02]`}
      >
        {tileContent}
      </a>
    );
  }

  return (
    <div className={commonClasses}>
      {tileContent}
    </div>
  );
};

export default WebCheckTile;