import React, { useState, useEffect } from 'react';
import { PersonProfile, InstagramSearchResult } from '../types';
import { searchInstagramProfiles } from '../services/airtableService';

interface InstagramProfileCardProps {
  profile: PersonProfile | null;
  query: string;
}

// Sub-component for the detailed view when Insta-Stories API succeeds
const DetailedProfileView: React.FC<{ profileData: NonNullable<PersonProfile['instagramProfile']>, username: string }> = ({ profileData, username }) => {
    return (
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/30 dark:bg-gray-800/80 dark:border-gray-700">
            <h3 className="font-bold text-xl text-center text-gray-800 dark:text-gray-200 mb-4">Perfil Público de Instagram</h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <img 
                    src={profileData.avatarUrl} 
                    alt={`Foto de perfil de ${profileData.fullName}`} 
                    className="w-28 h-28 rounded-full object-cover bg-gray-300 shadow-md border-4 border-white dark:border-gray-700"
                />
                <div className="flex-grow text-center sm:text-left">
                    <a href={`https://www.instagram.com/${username}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        <p className="font-bold text-2xl text-gray-900 dark:text-gray-100">{profileData.fullName}</p>
                        <p className="text-md text-pink-500 mb-2">@{username}</p>
                    </a>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-3">"{profileData.bio}"</p>
                    <div className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
                        <span>{profileData.publicPostsCount} publicaciones</span>
                    </div>
                </div>
            </div>
             <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 text-center">
                 <p className="text-xs text-gray-500 dark:text-gray-400">
                    Esta funcionalidad depende de un servicio externo (Insta-Stories.ru). CornuScore no garantiza su disponibilidad ni exactitud.
                </p>
             </div>
        </div>
    );
};

// Sub-component for the fallback view when profile exists but Insta-Stories API fails
const FallbackProfileView: React.FC<{ username: string }> = ({ username }) => {
    return (
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/30 dark:bg-gray-800/80 dark:border-gray-700 text-center">
             <i className="fa-brands fa-instagram text-4xl text-gray-400 dark:text-gray-500 mb-3"></i>
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-2">Información pública no disponible</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">No se pudo cargar la información detallada del perfil. Puede que sea privado o el servicio no esté disponible.</p>
            <a 
                href={`https://www.instagram.com/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-5 py-2 font-bold text-white bg-pink-500 rounded-full shadow-lg hover:bg-pink-600 transform hover:scale-105 transition-all"
            >
                Ver perfil externo <i className="fa-solid fa-arrow-up-right-from-square ml-1 text-xs"></i>
            </a>
        </div>
    );
};


// Sub-component to search for potential profiles when NO CornuScore profile is found
const SearchProfilesView: React.FC<{ query: string }> = ({ query }) => {
    const [foundProfiles, setFoundProfiles] = useState<InstagramSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfiles = async () => {
            if (!query) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const results = await searchInstagramProfiles(query);
                setFoundProfiles(results);
            } catch (err) {
                setError('No se pudo buscar en Instagram. Inténtalo de nuevo.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfiles();
    }, [query]);

    if (isLoading) {
        return (
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/30 dark:bg-gray-800/80 dark:border-gray-700 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400 mx-auto"></div>
                <p className="mt-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Buscando perfiles en Instagram...</p>
            </div>
        );
    }
    
    if (error) {
         return (
             <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/30 dark:bg-gray-800/80 dark:border-gray-700 text-center text-red-600 dark:text-red-400">
                <i className="fa-solid fa-circle-exclamation mr-2"></i>{error}
            </div>
         );
    }

    if (foundProfiles.length === 0) {
        return (
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/30 dark:bg-gray-800/80 dark:border-gray-700 text-center">
                <i className="fa-brands fa-instagram text-3xl text-gray-400 dark:text-gray-500 mb-2"></i>
                <p className="font-semibold text-gray-700 dark:text-gray-300">No se encontraron perfiles públicos en Instagram para "{query}".</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">El perfil puede ser privado, no existir, o tener un nombre de usuario diferente.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/30 dark:bg-gray-800/80 dark:border-gray-700">
            <h3 className="font-bold text-lg text-center text-gray-800 dark:text-gray-200 mb-3">Se encontraron perfiles en Instagram. ¿Cuál es el correcto?</h3>
            <div className="space-y-3">
                {foundProfiles.map(p => (
                    <a 
                        key={p.username}
                        href={`https://www.instagram.com/${p.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-pink-100/50 dark:hover:bg-gray-700/50 border border-transparent hover:border-pink-200 dark:hover:border-gray-600 transition-all"
                    >
                        <img src={p.profilePicUrl} alt={`Foto de perfil de ${p.username}`} className="w-20 h-20 rounded-full object-cover bg-gray-300" />
                        <div className="flex-grow">
                            <p className="font-bold text-xl text-gray-900 dark:text-gray-100">{p.username}</p>
                            <p className="text-lg text-gray-600 dark:text-gray-300">{p.fullName}</p>
                        </div>
                        <i className="fa-solid fa-arrow-up-right-from-square text-gray-500 text-xl"></i>
                    </a>
                ))}
            </div>
        </div>
    );
};


const InstagramProfileCard: React.FC<InstagramProfileCardProps> = ({ profile, query }) => {
    // Case A: A CornuScore profile was found.
    if (profile) {
        const instagramUsername = profile.identifiers.find(id => !id.includes(' ') && isNaN(Number(id))) || query;
        
        // Case A.1: The extended Instagram data was fetched successfully.
        if (profile.instagramProfile) {
            return <DetailedProfileView profileData={profile.instagramProfile} username={instagramUsername} />;
        }
        
        // Case A.2: The extended data could not be fetched (private, error, etc.).
        return <FallbackProfileView username={instagramUsername} />;
    }

    // Case B: No CornuScore profile was found, so we search for potential matches on IG.
    return <SearchProfilesView query={query} />;
};

export default InstagramProfileCard;