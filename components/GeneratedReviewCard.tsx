import React, { useState } from 'react';
import { ReviewCategory } from '../types';
import { CATEGORIES } from '../constants';

interface GeneratedResult {
    personIdentifier: string;
    text: string;
    country: string;
    category: ReviewCategory;
}

interface GeneratedReviewCardProps {
  result: GeneratedResult;
  onAddReview: (result: GeneratedResult) => Promise<boolean>;
}

const GeneratedReviewCard: React.FC<GeneratedReviewCardProps> = ({ result, onAddReview }) => {
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const categoryDetails = CATEGORIES[result.category];

  if (!categoryDetails) {
    console.warn("Invalid category found in generated result:", result.category);
    return null; // Don't render card if category is invalid
  }

  const handleAddClick = async () => {
    setIsLoading(true);
    const success = await onAddReview(result);
    if (success) {
      setIsAdded(true);
    }
    setIsLoading(false);
  };

  return (
    <div className={`bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-md border border-white/30 transition-opacity ${isAdded ? 'opacity-50' : 'opacity-100'}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
            <p className="text-lg font-bold text-pink-500 capitalize">{result.personIdentifier}</p>
            <p className="text-sm text-gray-500">{result.country}</p>
        </div>
        <div className={`flex items-center gap-2 text-sm font-bold text-white px-3 py-1 rounded-full ${categoryDetails.color}`}>
          <span>{categoryDetails.emoji}</span>
          <span>{categoryDetails.label}</span>
        </div>
      </div>
      <p className="text-gray-700 mb-4">"{result.text}"</p>
      
      <div className="flex justify-end items-center text-sm">
        <button 
          onClick={handleAddClick}
          disabled={isAdded || isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-colors disabled:cursor-not-allowed bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-400"
        >
          {isLoading ? (
            <><i className="fa-solid fa-spinner animate-spin"></i> Agregando...</>
          ) : isAdded ? (
            <><i className="fa-solid fa-check"></i> Agregado</>
          ) : (
            <><i className="fa-solid fa-plus"></i> Agregar Reseña</>
          )}
        </button>
      </div>
    </div>
  );
};

export default GeneratedReviewCard;
