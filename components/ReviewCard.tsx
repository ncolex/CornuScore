import React, { useState } from 'react';
import { Review } from '../types';
import { CATEGORIES } from '../constants';

interface ReviewCardProps {
  review: Review;
  blurred?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, blurred = false }) => {
  const [confirmations, setConfirmations] = useState(review.confirmations);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const categoryDetails = CATEGORIES[review.category];

  const handleConfirm = () => {
    if (blurred) return; // Prevent interaction on blurred cards
    if (!isConfirmed) {
      setConfirmations(confirmations + 1);
      setIsConfirmed(true);
    } else {
      setConfirmations(confirmations - 1);
      setIsConfirmed(false);
    }
  };

  return (
    <div className={`bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-md border border-white/30 transform transition-transform duration-300 ${!blurred ? 'hover:scale-[1.02]' : ''}`}>
      {review.personReviewed && (
        <p className={`mb-2 text-sm text-gray-500 ${blurred ? 'filter blur-sm' : ''}`}>
          Reseña sobre: <span className="font-bold text-pink-500 capitalize">{review.personReviewed}</span>
        </p>
      )}
      <div className="flex justify-between items-start mb-2">
        <div className={`flex items-center gap-2 text-sm font-bold text-white px-3 py-1 rounded-full ${categoryDetails.color}`}>
          <span>{categoryDetails.emoji}</span>
          <span>{categoryDetails.label}</span>
        </div>
        <span className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
      </div>
      <p className={`text-gray-700 mb-4 ${blurred ? 'filter blur-sm' : ''}`}>"{review.text}"</p>
      
      {!blurred && review.evidenceUrl && (
        <div className="mb-4">
            <a href={review.evidenceUrl} target="_blank" rel="noopener noreferrer" title="Ver evidencia">
                <img src={review.evidenceUrl} alt="Evidencia" className="rounded-lg max-h-64 mx-auto border shadow-sm cursor-pointer" />
            </a>
        </div>
      )}
      
      <div className="flex justify-between items-center text-sm">
        <span className={`text-gray-500 ${blurred ? 'filter blur-sm' : ''}`}>Autor: <span className="font-semibold">{review.pseudoAuthor}</span></span>
        <button 
          onClick={handleConfirm}
          disabled={blurred}
          className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors ${isConfirmed ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-700'} ${!blurred ? 'hover:bg-pink-200' : 'cursor-not-allowed'}`}
        >
          <i className="fa-solid fa-check"></i>
          <span className={blurred ? 'filter blur-sm' : ''}>{isConfirmed ? 'Confirmado' : 'Yo viví algo similar'}</span>
          <span className={`font-bold ${blurred ? 'filter blur-sm' : ''}`}>{confirmations}</span>
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;