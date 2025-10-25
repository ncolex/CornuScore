import React, { useState, useEffect } from 'react';
import { getUserProfile } from '../services/airtableService';
import { generatePlaceholderImage } from '../services/imageGenerationService';
import { UserProfile, Review } from '../types';
import ReviewCard from '../components/ReviewCard';
import { useAuth } from '../hooks/useAuth';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const userProfileData = await getUserProfile(user.phone);
        setProfile(userProfileData);
        setUserReviews(userProfileData.reviews);
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (!user) {
        setIsImageLoading(false);
        return;
    };

    const generateImage = async () => {
        setIsImageLoading(true);
        try {
            const pseudoUsername = `user***${user.phone.slice(-4)}`;
            const initials = (pseudoUsername[0] + pseudoUsername.slice(-1)).toUpperCase(); 
            const url = await generatePlaceholderImage(initials);
            setProfileImageUrl(url);
        } catch (error) {
            console.error("Failed to generate placeholder image on profile page", error);
            setProfileImageUrl(null);
        } finally {
            setIsImageLoading(false);
        }
    };

    generateImage();
  }, [user]);


  const handleDeleteReview = (reviewId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta reseña? Esta acción no se puede deshacer.')) {
      // In a real app, this would call an API to delete the review from the server.
      // For this mock, we just filter it out from the local state.
      setUserReviews(currentReviews => currentReviews.filter(review => review.id !== reviewId));
    }
  };

  const handleEditReview = (reviewId: string) => {
    // In a real app, this would open a modal or navigate to an edit page.
    alert(`La funcionalidad para editar la reseña ${reviewId} aún no está implementada.`);
  };

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mx-auto"></div>
        <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Cargando Perfil...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center bg-white/80 dark:bg-gray-800/80 p-8 rounded-2xl shadow-lg max-w-md mx-auto">
        <i className="fa-solid fa-circle-question text-6xl text-pink-300 mb-4"></i>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">No se pudo cargar el perfil</h2>
        <p className="text-gray-600 dark:text-gray-400">Hubo un error al obtener tus datos. Por favor, intenta de nuevo más tarde.</p>
      </div>
    );
  }

  const pseudoUsername = profile.pseudoUsername;

  const ProfileAvatar = () => {
    if (isImageLoading) {
      return (
        <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center animate-pulse dark:bg-gray-700">
            <i className="fa-solid fa-image text-4xl text-gray-400 dark:text-gray-500"></i>
        </div>
      );
    }
    if (profileImageUrl) {
      return (
        <img 
            src={profileImageUrl} 
            alt="Foto de perfil generada por IA" 
            className="w-24 h-24 rounded-full object-cover mx-auto mb-4 shadow-lg border-4 border-white dark:border-gray-800"
        />
      );
    }
    // Fallback icon
    return <i className="fa-solid fa-user-circle text-8xl text-pink-400 mb-4 h-24 flex items-center justify-center"></i>;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/30 text-center dark:bg-gray-800/80 dark:border-gray-700">
        <ProfileAvatar />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{pseudoUsername}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Puntuación de Contribuidor: 
          <span className="font-bold text-pink-500 ml-2">{profile.contributionScore}</span>
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">
          Mis Reseñas Publicadas ({userReviews.length})
        </h2>
        <div className="space-y-4">
          {userReviews.length > 0 ? (
            userReviews.map(review => 
              <ReviewCard 
                key={review.id} 
                review={review} 
                onEdit={() => handleEditReview(review.id)}
                onDelete={() => handleDeleteReview(review.id)}
              />
            )
          ) : (
            <p className="text-center text-gray-500 bg-white/80 dark:bg-gray-800/80 p-6 rounded-xl shadow-md dark:text-gray-400">
              Aún no has publicado ninguna reseña. ¡Anímate a ser el primero!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;