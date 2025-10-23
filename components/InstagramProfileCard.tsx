import React, { useState, useEffect } from 'react';
import { PersonProfile, InstagramSearchResult } from '../types';
import { searchInstagramProfiles } from '../services/airtableService';
import Avatar from './Avatar';

interface InstagramProfileCardProps {
  profile: PersonProfile | null;
  query: string;
}

const InstagramProfileCard: React.FC<InstagramProfileCardProps> = ({ profile, query }) => {
    const [foundProfiles, setFoundProfiles] = useState<InstagramSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfiles = async () => {
            const identifierToSearch = profile?.identifiers.find(id => !/\s/.test(id) && isNaN(parseInt(id, 10))) || query;
            
            if (!identifierToSearch) {
                setIsLoading(false);
                return;
            }
            
            setIsLoading(true);
            setError(null);
            try {
                const results = await searchInstagramProfiles(identifierToSearch);
                setFoundProfiles(results);

            } catch (err) {
                setError('No se pudo verificar el perfil de Instagram. Inténtalo de nuevo.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfiles();
    }, [profile, query]);

    if (isLoading) {
        return (
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/30 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400 mx-auto"></div>
                <p className="mt-3 text-sm font-semibold text-gray-600">Verificando perfil en Instagram...</p>
            </div>
        );
    }
    
    if (error) {
         return (
             <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/30 text-center text-red-600">
                <i className="fa-solid fa-circle-exclamation mr-2"></i>{error}
            </div>
         );
    }

    if (foundProfiles.length === 0) {
        return (
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/30 text-center">
                <i className="fa-brands fa-instagram text-3xl text-gray-400 mb-2"></i>
                <p className="font-semibold text-gray-700">No se encontraron perfiles públicos en Instagram para "{query}".</p>
                <p className="text-xs text-gray-500 mt-1">El perfil puede ser privado, no existir, o tener un nombre de usuario diferente.</p>
            </div>
        );
    }
    
    // If one or more profiles are found, always show the selection list to let the user confirm.
    return (
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/30">
            <h3 className="font-bold text-lg text-center text-gray-800 mb-3">Se encontraron uno o más perfiles. ¿Cuál es el correcto?</h3>
            <div className="space-y-3">
                {foundProfiles.map(p => (
                    <a 
                        key={p.username}
                        href={`https://www.instagram.com/${p.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-pink-100/50 border border-transparent hover:border-pink-200 transition-all"
                    >
                        <Avatar username={p.username} src={p.profilePicUrl} className="w-20 h-20" />
                        <div className="flex-grow">
                            <p className="font-bold text-xl text-gray-900">{p.username}</p>
                            <p className="text-lg text-gray-600">{p.fullName}</p>
                        </div>
                        <i className="fa-solid fa-arrow-up-right-from-square text-gray-500 text-xl"></i>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default InstagramProfileCard;
