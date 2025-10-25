// Fix: Create WebCheckTile component to display web search results.
import React from 'react';
import { WebCheckResult } from '../types';

interface WebCheckTileProps {
  result: WebCheckResult;
}

const WebCheckTile: React.FC<WebCheckTileProps> = ({ result }) => {
  // Special case for results with a screenshot
  if (result.screenshotUrl) {
    return (
       <a 
        href={result.link} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="block bg-gray-800 dark:bg-black p-4 rounded-xl shadow-lg border border-red-400/50 transition-all transform hover:scale-[1.03] group overflow-hidden relative"
      >
        <img src={result.screenshotUrl} alt={`Captura de ${result.source}`} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
        <div className="relative">
            <div className="flex items-center gap-4">
                <i className="fa-solid fa-heart-crack text-red-500 text-4xl text-center w-10"></i>
                <div className="flex-grow">
                    <p className="font-bold text-white text-lg leading-tight">{result.title}</p>
                    <p className="text-sm text-gray-200 mt-1">{result.snippet}</p>
                </div>
                <i className="fa-solid fa-chevron-right text-gray-300 self-center"></i>
            </div>
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
        <p className="font-semibold text-gray-800 dark:text-gray-200 leading-tight">{result.title}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{result.snippet}</p>
      </div>
      {isClickable && <i className="fa-solid fa-chevron-right text-gray-400 dark:text-gray-500 self-center"></i>}
    </div>
  );

  const commonClasses = "block bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md border border-white/30 transition-all dark:bg-gray-800/80 dark:border-gray-700";

  if (isClickable) {
    return (
      <a 
        href={result.link} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={`${commonClasses} hover:shadow-lg hover:border-pink-300 dark:hover:border-pink-600 transform hover:scale-[1.02]`}
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