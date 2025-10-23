import { InstagramSearchResult } from '../types';
import { getInstagramAvatarUrl } from './avatar';

export const searchInstagramProfiles = async (query: string): Promise<InstagramSearchResult[]> => {
    console.log(`Searching Instagram for: ${query}`);
    await new Promise(resolve => setTimeout(resolve, 1800)); // Simulate a longer API call

    const normalizedQuery = query.toLowerCase().trim().replace(/[\s._-]+/g, '');
    
    // --- Create search variants ---
    const searchVariants = new Set<string>([normalizedQuery]);
    const dotVariantMatch = normalizedQuery.match(/^([a-z_]+)(\d+)$/);
    if (dotVariantMatch) {
        searchVariants.add(`${dotVariantMatch[1]}.${dotVariantMatch[2]}`);
    }
     // If query is like "name123", also search for "name"
    const prefixVariantMatch = normalizedQuery.match(/^([a-zA-Z]+)/);
    if (prefixVariantMatch) {
        searchVariants.add(prefixVariantMatch[1]);
    }

    // --- Update the mock profile data to use the deterministic function ---
    const allMockProfilesData = [
        { username: 'anita.perez95', fullName: 'Anita Pérez' },
        { username: 'ana_perez_art', fullName: 'Ana Pérez | Artista' },
        { username: 'charlyg', fullName: 'Carlos Gómez' },
        { username: 'sofilu', fullName: 'Sofia Luna' },
        { username: 'anaperez95', fullName: 'Ana Perez - Gamer' },
        // Use the user-provided, specific image for this one profile as requested
        { username: 'nicobattaglia.33', profilePicUrl: 'https://i.imgur.com/7Y25aL9.jpeg', fullName: 'Nico Battaglia' },
        { username: 'nicobattaglia', fullName: 'Nico B.' },
    ];

    const allMockProfiles: InstagramSearchResult[] = allMockProfilesData.map(p => ({
        ...p,
        // Prefer real public avatar (Unavatar). If not provided explicitly, use Unavatar URL.
        profilePicUrl: p.profilePicUrl || getInstagramAvatarUrl(p.username),
    }));


    const foundProfiles = new Map<string, InstagramSearchResult>();

    allMockProfiles.forEach(p => {
        const normalizedUsername = p.username.toLowerCase().replace(/[\s._-]+/g, '');
        for (const variant of searchVariants) {
            if (normalizedUsername.includes(variant)) {
                foundProfiles.set(p.username, p);
            }
        }
    });
    
    return Array.from(foundProfiles.values());
};