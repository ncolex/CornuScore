import React, { useState, useEffect } from 'react';
import { getUserProfile } from '../services/airtableService';
import { UserProfile } from '../types';
import ReviewCard from '../components/ReviewCard';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const userProfileData = await getUserProfile();
        // In a real app, this would be fetched based on the logged-in user's ID
        setProfile(userProfileData);
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mx-auto"></div>
        <p className="mt-4 text-lg font-semibold text-gray-700">Cargando Perfil...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center bg-white/80 p-8 rounded-2xl shadow-lg max-w-md mx-auto">
        <i className="fa-solid fa-circle-question text-6xl text-pink-300 mb-4"></i>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No se pudo cargar el perfil</h2>
        <p className="text-gray-600">Hubo un error al obtener tus datos. Por favor, intenta de nuevo más tarde.</p>
      </div>
    );
  }

  const pseudoUsername = user ? `user***${user.phone.slice(-4)}` : 'Anónimo';

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/30 text-center">
        <i className="fa-solid fa-user-circle text-6xl text-pink-400 mb-4"></i>
        <h1 className="text-3xl font-bold text-gray-800">{pseudoUsername}</h1>
        <p className="text-lg text-gray-600">
          Puntuación de Contribuidor: 
          <span className="font-bold text-pink-500 ml-2">{profile.contributionScore}</span>
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Mis Reseñas Publicadas ({profile.reviews.length})
        </h2>
        <div className="space-y-4">
          {profile.reviews.length > 0 ? (
            profile.reviews.map(review => <ReviewCard key={review.id} review={review} />)
          ) : (
            <p className="text-center text-gray-500 bg-white/80 p-6 rounded-xl shadow-md">
              Aún no has publicado ninguna reseña. ¡Anímate a ser el primero!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;