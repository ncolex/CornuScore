// Fix: Create a mock service to handle data fetching and submission.
import { Review, PersonProfile, UserProfile, ReviewCategory, ReputationLevel, WebCheckResult } from '../types';

// MOCK DATA
const mockReviews: Review[] = [
  // ... reviews for 'ana perez' ...
  { id: 'rev1', category: ReviewCategory.Infidelity, text: "Me fue infiel con mi mejor amiga. Cero confianza.", score: -3, date: "2023-10-15T12:00:00Z", pseudoAuthor: "user123", confirmations: 12, personReviewed: 'Ana Perez' },
  { id: 'rev2', category: ReviewCategory.Toxic, text: "Muy controladora y celosa. Revisaba mi celular a escondidas.", score: -2, date: "2023-08-20T12:00:00Z", pseudoAuthor: "user456", confirmations: 7, personReviewed: 'Ana Perez' },
  { id: 'rev3', category: ReviewCategory.Betrayal, text: "Contó secretos míos a todo nuestro grupo de amigos. Una traidora.", score: -3, date: "2024-01-05T12:00:00Z", pseudoAuthor: "user789", confirmations: 5, personReviewed: 'Ana Perez' },
  // ... reviews for 'carlos gomez' ...
  { id: 'rev4', category: ReviewCategory.Positive, text: "El amigo más leal que he tenido. Siempre está ahí para apoyarte.", score: 2, date: "2024-02-10T12:00:00Z", pseudoAuthor: "user321", confirmations: 25, personReviewed: 'Carlos Gomez' },
  { id: 'rev5', category: ReviewCategory.Positive, text: "Súper detallista y atento. La mejor pareja que he tenido.", score: 2, date: "2023-11-30T12:00:00Z", pseudoAuthor: "user654", confirmations: 18, personReviewed: 'Carlos Gomez' },
  // ... reviews for others for ranking ...
  { id: 'rev6', category: ReviewCategory.Theft, text: "Le presté dinero y nunca me lo devolvió, se desapareció.", score: -4, date: "2023-09-01T12:00:00Z", pseudoAuthor: "user987", confirmations: 3, personReviewed: 'Ricardo Diaz' },
  { id: 'rev7', category: ReviewCategory.Infidelity, text: "Me enteré que tenía una doble vida con otra familia.", score: -3, date: "2022-05-12T12:00:00Z", pseudoAuthor: "user111", confirmations: 9, personReviewed: 'Ricardo Diaz' },
  { id: 'rev8', category: ReviewCategory.Positive, text: "Una persona increíble, honesta y trabajadora.", score: 2, date: "2024-03-01T12:00:00Z", pseudoAuthor: "user222", confirmations: 15, personReviewed: 'Sofia Luna' },
];

const mockProfiles: PersonProfile[] = [
  { id: 'prof1', identifiers: ['ana perez', 'anita_p', '1122334455'], country: 'Argentina', totalScore: -8, reputation: ReputationLevel.Risk, reviews: mockReviews.filter(r => r.personReviewed === 'Ana Perez') },
  { id: 'prof2', identifiers: ['carlos gomez', 'charlyg', '5544332211'], country: 'México', totalScore: 4, reputation: ReputationLevel.Positive, reviews: mockReviews.filter(r => r.personReviewed === 'Carlos Gomez') },
  { id: 'prof3', identifiers: ['ricardo diaz', 'richid'], country: 'Colombia', totalScore: -7, reputation: ReputationLevel.Risk, reviews: mockReviews.filter(r => r.personReviewed === 'Ricardo Diaz') },
  { id: 'prof4', identifiers: ['sofia luna', 'sofilu'], country: 'España', totalScore: 2, reputation: ReputationLevel.Positive, reviews: mockReviews.filter(r => r.personReviewed === 'Sofia Luna') },
  { id: 'prof5', identifiers: ['pedro navaja'], country: 'Perú', totalScore: -2, reputation: ReputationLevel.Warning, reviews: [{ id: 'rev9', category: ReviewCategory.Toxic, text: "Manipulador, te hace sentir culpable por todo.", score: -2, date: "2023-06-18T12:00:00Z", pseudoAuthor: "user333", confirmations: 4, personReviewed: 'Pedro Navaja' }] },
];


// MOCK SERVICE FUNCTIONS

const calculateReputation = (score: number): ReputationLevel => {
    if (score > 0) return ReputationLevel.Positive;
    if (score > -3) return ReputationLevel.Warning;
    return ReputationLevel.Risk;
};

export const getProfileByQuery = async (query: string): Promise<PersonProfile | null> => {
  console.log(`Searching for: ${query}`);
  const normalizedQuery = query.toLowerCase().trim();
  
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

  const profile = mockProfiles.find(p => 
    p.identifiers.some(id => id.toLowerCase().includes(normalizedQuery))
  );
  
  return profile || null;
};

export const submitReview = async (reviewData: { personIdentifier: string, country: string, category: ReviewCategory, text: string, score: number, pseudoAuthor: string, evidenceUrl?: string }): Promise<boolean> => {
    console.log("Submitting review:", reviewData);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

    const newReview: Review = {
        id: `rev${Math.random()}`,
        date: new Date().toISOString(),
        confirmations: 0,
        ...reviewData
    };
    mockReviews.push(newReview);
    
    const normalizedIdentifier = reviewData.personIdentifier.toLowerCase().trim();
    let profile = mockProfiles.find(p => p.identifiers.some(id => id.toLowerCase() === normalizedIdentifier));
    
    if (profile) {
        profile.reviews.push(newReview);
        profile.totalScore += reviewData.score;
        profile.reputation = calculateReputation(profile.totalScore);
    } else {
        const newProfile: PersonProfile = {
            id: `prof${Math.random()}`,
            identifiers: [reviewData.personIdentifier],
            country: reviewData.country,
            reviews: [newReview],
            totalScore: reviewData.score,
            reputation: calculateReputation(reviewData.score),
        };
        mockProfiles.push(newProfile);
    }
    
    return true; // Simulate success
};

export const getRankings = async (): Promise<{ topNegative: PersonProfile[], topPositive: PersonProfile[] }> => {
    console.log("Fetching rankings");
    await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate network delay

    const sortedProfiles = [...mockProfiles].sort((a, b) => a.totalScore - b.totalScore);
    
    const topNegative = sortedProfiles.slice(0, 5);
    const topPositive = sortedProfiles.slice().reverse().slice(0, 5);

    return { topNegative, topPositive };
};


export const getUserProfile = async (): Promise<UserProfile> => {
    console.log("Fetching user profile");
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

    // Return a static mock profile for the "logged in" user
    const userReviews = mockReviews.filter(r => r.pseudoAuthor === 'user123' || r.pseudoAuthor === 'user456');
    return {
        id: 'user_xyz',
        pseudoUsername: 'user123',
        contributionScore: 125,
        reviews: userReviews
    };
};

export const performWebChecks = async (query: string): Promise<WebCheckResult[]> => {
    console.log(`Performing web check for: ${query}`);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate a longer delay for web scraping/API calls

    const results: WebCheckResult[] = [];
    const normalizedQuery = query.toLowerCase();

    // Simulate finding different numbers of profiles based on a simple hash of the query
    const hash = normalizedQuery.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const facebookProfiles = (hash % 4); // 0 to 3
    const tinderProfiles = (hash % 2); // 0 or 1

    if (facebookProfiles > 0) {
        results.push({
            id: `web-fb-${hash}`,
            source: 'Facebook',
            title: `Se encontraron ${facebookProfiles} perfiles públicos en Facebook`,
            link: `https://www.facebook.com/search/top/?q=${encodeURIComponent(query)}`,
            snippet: `Se encontraron perfiles que podrían coincidir con "${query}". Se recomienda verificar manualmente.`
        });
    }

    if (tinderProfiles > 0) {
        results.push({
            id: `web-tinder-${hash}`,
            source: 'Tinder',
            title: `Posible perfil encontrado en apps de citas`,
            link: `#`, // Tinder doesn't have public searchable profiles
            snippet: `Nuestra búsqueda indica una posible presencia en aplicaciones de citas. No se puede mostrar un enlace directo por privacidad.`
        });
    }
    
     results.push({
        id: `web-google-${hash}`,
        source: 'Google',
        title: `Buscar "${query}" en Google`,
        link: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        snippet: `Realiza una búsqueda general en Google para encontrar más información pública y en otras redes sociales.`
    });

    return results;
};
