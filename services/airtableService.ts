import { Review, PersonProfile, UserProfile, ReviewCategory, ReputationLevel, WebCheckResult, InstagramSearchResult, RegisteredUser } from '../types';

// --- NOTA PARA LA BASE DE DATOS ---
// Los siguientes datos son de prueba (mock data).
// En una implementación de producción, estas funciones se conectarían a la base de datos de Neon
// a través de una API backend para obtener y modificar datos reales.

// --- Utility Function for Realistic and Consistent Profile Pics ---
const getDeterministicProfilePic = (username: string): string => {
    const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    // This service provides realistic, consistent photos based on a seed.
    // It alternates between male and female avatars for variety.
    const gender = hash % 2 === 0 ? 'male' : 'female';
    const avatarId = hash % 70; // The service has about 70 avatars per gender
    return `https://xsgames.co/randomusers/assets/avatars/${gender}/${avatarId}.jpg`;
};


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
  { id: 'prof1', identifiers: ['ana perez', 'anita.perez95', '1122334455'], country: 'Argentina', totalScore: -8, reputation: ReputationLevel.Risk, reviews: mockReviews.filter(r => r.personReviewed === 'Ana Perez') },
  { id: 'prof2', identifiers: ['carlos gomez', 'charlyg', '5544332211'], country: 'México', totalScore: 4, reputation: ReputationLevel.Positive, reviews: mockReviews.filter(r => r.personReviewed === 'Carlos Gomez') },
  { id: 'prof3', identifiers: ['ricardo diaz', 'richid'], country: 'Colombia', totalScore: -7, reputation: ReputationLevel.Risk, reviews: mockReviews.filter(r => r.personReviewed === 'Ricardo Diaz') },
  { id: 'prof4', identifiers: ['sofia luna', 'sofilu'], country: 'España', totalScore: 2, reputation: ReputationLevel.Positive, reviews: mockReviews.filter(r => r.personReviewed === 'Sofia Luna') },
  { id: 'prof5', identifiers: ['pedro navaja'], country: 'Perú', totalScore: -2, reputation: ReputationLevel.Warning, reviews: [{ id: 'rev9', category: ReviewCategory.Toxic, text: "Manipulador, te hace sentir culpable por todo.", score: -2, date: "2023-06-18T12:00:00Z", pseudoAuthor: "user333", confirmations: 4, personReviewed: 'Pedro Navaja' }] },
];

// --- MOCK USER DATABASE ---
const mockUsers: RegisteredUser[] = [
    { id: 'user_xyz', phone: 'google_user_123456', email: 'test@google.com', contributionScore: 125 },
    { id: 'user_abc', phone: '1122334455', email: 'user@example.com', passwordHash: 'hashed_password', contributionScore: 50 },
];


// MOCK SERVICE FUNCTIONS

const calculateReputation = (score: number): ReputationLevel => {
    if (score > 0) return ReputationLevel.Positive;
    if (score > -3) return ReputationLevel.Warning;
    return ReputationLevel.Risk;
};

export const getProfileByQuery = async (query: string): Promise<PersonProfile | null> => {
  console.log(`Searching for: ${query}`);
  // Normalize query: lowercase, trim, and remove common separators like spaces, dots, underscores.
  const normalizedQuery = query.toLowerCase().trim().replace(/[\s._-]+/g, '');
  
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

  if (!normalizedQuery) return null;

  const profile = mockProfiles.find(p => 
    p.identifiers.some(id => 
      // Normalize identifier in the same way for a robust match.
      id.toLowerCase().replace(/[\s._-]+/g, '').includes(normalizedQuery)
    )
  );
  
  return profile || null;
};

// Fix: Update submitReview to accept an optional pseudoAuthor and make reviewer contact info optional.
export const submitReview = async (reviewData: { personIdentifier: string, country: string, category: ReviewCategory, text: string, score: number, reviewerEmail?: string, reviewerInstagram?: string, reviewerPhone?: string, evidenceUrl?: string, pseudoAuthor?: string }): Promise<boolean> => {
    console.log("Submitting review:", reviewData);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

    const newReview: Review = {
        id: `rev${Math.random()}`,
        date: new Date().toISOString(),
        confirmations: 0,
        personReviewed: reviewData.personIdentifier,
        category: reviewData.category,
        text: reviewData.text,
        score: reviewData.score,
        pseudoAuthor: reviewData.pseudoAuthor || reviewData.reviewerInstagram || 'Anónimo', // Use provided author, fallback to instagram, then to anonymous
        evidenceUrl: reviewData.evidenceUrl
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

export const registerUser = async (userData: { phone: string; email?: string; password?: string }): Promise<{ success: boolean; message: string; user?: RegisteredUser }> => {
    console.log("Registering user:", { phone: userData.phone, email: userData.email });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    // Check if phone or email already exists
    const existingUser = mockUsers.find(u => u.phone === userData.phone || (userData.email && u.email === userData.email));
    if (existingUser) {
        return { success: false, message: 'El número de teléfono o correo electrónico ya está registrado.' };
    }

    const newUser: RegisteredUser = {
        id: `user_${Math.random().toString(36).substring(2, 9)}`,
        phone: userData.phone,
        email: userData.email,
        // In a real app, you would hash the password here before storing
        passwordHash: userData.password ? `hashed_${userData.password}` : undefined,
        contributionScore: 0,
    };

    mockUsers.push(newUser);
    console.log("Current users:", mockUsers);
    
    return { success: true, message: 'Registro exitoso.', user: newUser };
};


export const getUserProfile = async (phone?: string): Promise<UserProfile> => {
    console.log("Fetching user profile for phone:", phone);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

    const dbUser = mockUsers.find(u => u.phone === phone);

    // This part for reviews is static for now, as there's no link between a user and the reviews they create in mock data
    const userReviews = mockReviews.filter(r => r.pseudoAuthor === 'user123' || r.pseudoAuthor === 'user456');
    return {
        id: dbUser?.id || 'user_xyz',
        pseudoUsername: dbUser?.phone ? `user***${dbUser.phone.slice(-4)}` : 'user123',
        contributionScore: dbUser?.contributionScore ?? 125,
        reviews: userReviews
    };
};

export const performWebChecks = async (query: string): Promise<WebCheckResult[]> => {
    console.log(`Performing web check for: ${query}`);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate a longer delay for web scraping/API calls

    // Simulate a potential failure for testing purposes
    if (query.toLowerCase().trim() === 'failcheck') {
        throw new Error("Simulated web check API failure.");
    }

    const results: WebCheckResult[] = [];
    const normalizedQuery = query.toLowerCase().trim();
    const hash = normalizedQuery.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const isLikelyPhoneNumber = /^\+?[\d\s-]{7,}$/.test(query);
    
    // Add generic search engine links for all queries
    results.push({
        id: `web-google`,
        source: 'Google',
        title: `Buscar "${query}" en Google`,
        link: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        snippet: `Realiza una búsqueda general para encontrar información pública.`,
        status: 'info'
    });
    results.push({
        id: `web-duck`,
        source: 'DuckDuckGo',
        title: `Buscar "${query}" en DuckDuckGo`,
        link: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
        snippet: `Busca en DuckDuckGo con un enfoque en la privacidad.`,
        status: 'info'
    });
    results.push({
        id: `web-yandex`,
        source: 'Yandex',
        title: `Buscar "${query}" en Yandex`,
        link: `https://yandex.com/search/?text=${encodeURIComponent(query)}`,
        snippet: `Yandex puede ser útil para encontrar resultados en otras regiones.`,
        status: 'info'
    });
    results.push({
        id: `web-facebook`,
        source: 'Facebook',
        title: `Buscar "${query}" en Facebook`,
        link: `https://www.facebook.com/search/top/?q=${encodeURIComponent(query)}`,
        snippet: `Busca perfiles, páginas y grupos en Facebook.`,
        status: 'info'
    });
    results.push({
        id: `web-tiktok`,
        source: 'TikTok',
        title: `Buscar "${query}" en TikTok`,
        link: `https://www.tiktok.com/search?q=${encodeURIComponent(query)}`,
        snippet: `Busca perfiles y contenido en la plataforma de TikTok.`,
        status: 'info'
    });

    // Badoo check with found/not_found status
    if (hash % 3 === 0 && !isLikelyPhoneNumber) { // 1 in 3 chance of finding a profile
        results.push({
            id: `web-badoo`,
            source: 'Badoo',
            title: `Se encontró un perfil en Badoo`,
            link: `https://badoo.com/es/search/?q=${encodeURIComponent(query)}`,
            snippet: `Se detectó una coincidencia que requiere verificación manual.`,
            status: 'found',
            screenshotUrl: 'https://i.imgur.com/gfZiEol.png'
        });
    } else {
        results.push({
            id: `web-badoo`,
            source: 'Badoo',
            title: `No se encontraron perfiles en Badoo`,
            link: `#`,
            snippet: `La búsqueda automática no arrojó resultados claros en esta plataforma.`,
            status: 'not_found'
        });
    }

    results.push({
        id: `web-skokka`,
        source: 'Skokka',
        title: `Búsqueda de acompañantes en Skokka`,
        link: `https://www.skokka.com/buscar?q=${encodeURIComponent(query)}`,
        snippet: `Verifica si hay perfiles relacionados en sitios de acompañantes.`,
        status: 'info'
    });

    // Add simulated social media checks only if it's NOT likely a phone number
    if (!isLikelyPhoneNumber) {
        const tinderProfiles = (hash % 2); // 0 or 1
        if (tinderProfiles > 0) {
            results.unshift({
                id: `web-tinder-${hash}`,
                source: 'Tinder',
                title: `Posible perfil en apps de citas`,
                link: `#`,
                snippet: `Indicios de presencia en apps de citas (Tinder, etc.).`,
                status: 'found'
            });
        }
    }

    return results;
};

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
        // Use the specific URL if provided, otherwise generate one deterministically
        profilePicUrl: p.profilePicUrl || getDeterministicProfilePic(p.username),
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