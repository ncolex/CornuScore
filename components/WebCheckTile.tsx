// Fix: Create WebCheckTile component to display web search results.
import React from 'react';
import { WebCheckResult } from '../types';

interface WebCheckTileProps {
  result: WebCheckResult;
}

const WebCheckTile: React.FC<WebCheckTileProps> = ({ result }) => {
  const getIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'google': return 'fa-brands fa-google';
      case 'facebook': return 'fa-brands fa-facebook';
      case 'instagram': return 'fa-brands fa-instagram';
      case 'linkedin': return 'fa-brands fa-linkedin';
      case 'twitter': return 'fa-brands fa-twitter';
      case 'tinder': return 'fa-solid fa-fire';
      default: return 'fa-solid fa-globe';
    }
  };

  const isClickable = result.link !== '#';

  const tileContent = (
    <div className="flex items-center gap-4">
      <i className={`${getIcon(result.source)} text-2xl text-pink-500 text-center w-6`}></i>
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
