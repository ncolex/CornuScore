import React, { useState } from 'react';
import { Review } from '../types';
import { CATEGORIES } from '../constants';

interface ReviewCardProps {
  review: Review;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onEdit, onDelete }) => {
  const [confirmations, setConfirmations] = useState(review.confirmations);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const categoryDetails = CATEGORIES[review.category];

  const handleConfirm = () => {
    if (!isConfirmed) {
      setConfirmations(confirmations + 1);
      setIsConfirmed(true);
    } else {
      setConfirmations(confirmations - 1);
      setIsConfirmed(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-md border border-white/30 transform transition-transform duration-300 hover:scale-[1.02] dark:bg-gray-800/90 dark:border-gray-700">
      {review.personReviewed && (
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          Reseña sobre: <span className="font-bold text-pink-500 capitalize">{review.personReviewed}</span>
        </p>
      )}
      <div className="flex justify-between items-start mb-2">
        <div className={`flex items-center gap-2 text-sm font-bold text-white px-3 py-1 rounded-full ${categoryDetails.color}`}>
          <span>{categoryDetails.emoji}</span>
          <span>{categoryDetails.label}</span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
      </div>
      <p className="text-gray-700 dark:text-gray-300 mb-4">"{review.text}"</p>
      
      {review.evidenceUrl && (
        <div className="mb-4">
            <a href={review.evidenceUrl} target="_blank" rel="noopener noreferrer" title="Ver evidencia">
                <img src={review.evidenceUrl} alt="Evidencia" className="rounded-lg max-h-64 mx-auto border shadow-sm cursor-pointer dark:border-gray-600" />
            </a>
        </div>
      )}
      
      <div className="flex justify-between items-center text-sm pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
        <span className="text-gray-500 dark:text-gray-400">Autor: <span className="font-semibold">{review.pseudoAuthor}</span></span>
        
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(review.id)}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
              aria-label="Editar reseña"
            >
              <i className="fa-solid fa-pencil"></i>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(review.id)}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 transition-colors dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/80"
              aria-label="Eliminar reseña"
            >
              <i className="fa-solid fa-trash-can"></i>
            </button>
          )}
          <button 
            onClick={handleConfirm}
            className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors ${isConfirmed ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'} hover:bg-pink-200 dark:hover:bg-pink-800/50`}
          >
            <i className="fa-solid fa-check"></i>
            <span className="hidden sm:inline">{isConfirmed ? 'Confirmado' : 'Confirmar'}</span>
            <span className="font-bold">{confirmations}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;