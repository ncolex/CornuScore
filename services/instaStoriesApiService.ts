// This is a mock response structure based on the prompt's requirements.
interface InstaStoriesApiResponse {
    status: 'ok' | 'fail';
    message?: string;
    result?: {
        avatar: string; // Corresponds to avatarUrl
        fullname: string; // Corresponds to fullName
        biography: string; // Corresponds to bio
        posts_count: number; // Corresponds to publicPostsCount
    };
}

// Mock database of Insta-Stories.ru responses
const mockInstaStoriesDb: Record<string, InstaStoriesApiResponse> = {
    'anita.perez95': {
        status: 'ok',
        result: {
            avatar: 'https://i.imgur.com/8b1eWCk.jpg', // A deterministic but different image
            fullname: 'Ana P. (Público)',
            biography: 'Amante de los viajes y la fotografía 📸✈️. Viviendo la vida al máximo. No DM.',
            posts_count: 154
        }
    },
    'charlyg': {
        status: 'ok',
        result: {
            avatar: 'https://i.imgur.com/sC5vJ4p.jpg',
            fullname: 'Carlos "Charly" Gómez',
            biography: 'Entrenador personal y entusiasta del fitness. Ayudando a la gente a alcanzar sus metas 💪.',
            posts_count: 321,
        }
    },
    'nicobattaglia.33': {
        status: 'fail',
        message: 'This account is private.'
    },
    'unknownuser123': {
        status: 'fail',
        message: 'User not found.'
    }
};

/**
 * Fetches public profile data from a mock Insta-Stories.ru API.
 * @param username The Instagram username to fetch.
 * @returns A promise that resolves to the profile data or null if not found/private/error.
 */
export const fetchInstagramProfileData = async (username: string): Promise<InstaStoriesApiResponse['result'] | null> => {
    console.log(`[InstaStories API] Fetching profile for: ${username}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    const normalizedUsername = username.toLowerCase().trim();
    const response = mockInstaStoriesDb[normalizedUsername];

    if (response && response.status === 'ok' && response.result) {
        console.log(`[InstaStories API] Found data for: ${username}`);
        return response.result;
    }
    
    console.log(`[InstaStories API] No public data for: ${username}. Reason: ${response?.message || 'Not in mock DB'}`);
    return null;
};
