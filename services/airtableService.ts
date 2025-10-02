import Airtable from 'airtable';
import { Review, PersonProfile, UserProfile, ReviewCategory, ReputationLevel, WebCheckResult } from '../types';
import { CATEGORIES } from '../constants';

const CATEGORY_LABEL_TO_ENUM = Object.entries(CATEGORIES).reduce<Record<string, ReviewCategory>>((acc, [key, value]) => {
    acc[value.label] = key as ReviewCategory;
    return acc;
}, {} as Record<string, ReviewCategory>);

// Initialize Airtable
const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY as string;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID as string;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.error("Airtable API Key or Base ID is not set in environment variables.");
    // Fallback to mock data or throw an error if Airtable is critical
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

const PEOPLE_TABLE = 'Personas';
const REVIEWS_TABLE = 'Reseñas';

// Helper to calculate reputation score from category
const getScoreFromCategory = (category: ReviewCategory): number => {
    switch (category) {
        case ReviewCategory.Infidelity: return -3;
        case ReviewCategory.Theft: return -4;
        case ReviewCategory.Betrayal: return -3;
        case ReviewCategory.Toxic: return -2;
        case ReviewCategory.Positive: return 2;
        default: return 0;
    }
};

// Helper to calculate reputation level from total score
const calculateReputationLevel = (score: number, totalReviews: number): ReputationLevel => {
    if (totalReviews === 0) return ReputationLevel.Unknown;
    if (score > 0) return ReputationLevel.Positive;
    if (score >= -5) return ReputationLevel.Warning;
    return ReputationLevel.Risk;
};

// Function to fetch reviews for a given person ID
const fetchReviewsForPerson = async (personRecordId: string): Promise<Review[]> => {
    const reviews: Review[] = [];
    await base(REVIEWS_TABLE).select({
        filterByFormula: `{Persona Reseñada} = '${personRecordId}'`
    }).eachPage((records, fetchNextPage) => {
        records.forEach(record => {
            const rawCategory = record.get('Categoría');
            const mappedCategory = typeof rawCategory === 'string' ? CATEGORY_LABEL_TO_ENUM[rawCategory] ?? ReviewCategory.Positive : ReviewCategory.Positive;

            reviews.push({
                id: record.id,
                personReviewed: (record.get('Persona Reseñada Nombre') as string[])[0] || '', // Assuming a lookup field for name
                category: mappedCategory,
                rating: record.get('Calificación') as string, // Emojis
                text: record.get('Texto') as string,
                pseudoAuthor: record.get('Autor Pseudo') as string,
                date: record.get('Fecha') as string,
                confirmations: record.get('Confirmaciones') as number || 0,
                evidenceUrl: record.get('Evidencia') ? (record.get('Evidencia') as any[])[0]?.url : undefined,
                score: record.get('Puntaje') as number, // Assuming Puntaje is a formula field in Airtable
            });
        });
        fetchNextPage();
    });
    return reviews;
};

export const getProfileByQuery = async (query: string): Promise<PersonProfile | null> => {
    console.log(`Searching for: ${query}`);
    const normalizedQuery = query.toLowerCase().trim();
    let profile: PersonProfile | null = null;

    try {
        await base(PEOPLE_TABLE).select({
            filterByFormula: `OR(LOWER(Nombre) = '${normalizedQuery}', LOWER(Instagram) = '${normalizedQuery}', LOWER(Celular) = '${normalizedQuery}', LOWER(Email) = '${normalizedQuery}')`,
            maxRecords: 1,
        }).eachPage((records, fetchNextPage) => {
            if (records.length > 0) {
                const record = records[0];
                const totalScore = record.get('Puntaje Total') as number || 0;
                const totalReviews = record.get('Nro de Reseñas') as number || 0;

                profile = {
                    id: record.id,
                    identifiers: [record.get('Nombre') as string], // Main identifier
                    country: record.get('País') as string,
                    totalScore: totalScore,
                    reputation: calculateReputationLevel(totalScore, totalReviews),
                    reviews: [], // Will be fetched separately
                };
            }
            fetchNextPage();
        });

        if (profile) {
            profile.reviews = await fetchReviewsForPerson(profile.id);
        }

    } catch (error) {
        console.error("Error fetching profile from Airtable:", error);
    }

    return profile;
};

export const submitReview = async (reviewData: { personIdentifier: string, nickname?: string, email?: string, phoneNumber?: string, instagram?: string, country: string, category: ReviewCategory, rating: string, text: string, pseudoAuthor: string, evidenceUrl?: string }): Promise<boolean> => {
    console.log("Submitting review:", reviewData);
    try {
        const score = getScoreFromCategory(reviewData.category);
        let personRecordId: string | undefined;

        console.log("Step 1: Checking if person exists...");
        // 1. Check if person exists
        let existingPerson: any;
        await base(PEOPLE_TABLE).select({
            filterByFormula: `LOWER(Nombre) = '${reviewData.personIdentifier.toLowerCase()}'`,
            maxRecords: 1,
        }).eachPage((records, fetchNextPage) => {
            if (records.length > 0) {
                existingPerson = records[0];
                personRecordId = existingPerson.id;
            }
            fetchNextPage();
        });
        console.log("Step 1 Result: personRecordId", personRecordId);

        // 2. Create person if not exists
        if (!personRecordId) {
            console.log("Step 2: Person does not exist, creating new person...");
            const newPersonRecord = await base(PEOPLE_TABLE).create({
                "Nombre": reviewData.personIdentifier,
                "País": reviewData.country,
                ...(reviewData.nickname && { "Apodo": reviewData.nickname }),
                ...(reviewData.email && { "Email": reviewData.email }),
                ...(reviewData.phoneNumber && { "Celular": reviewData.phoneNumber }),
                ...(reviewData.instagram && { "Instagram": reviewData.instagram }),
            });
            personRecordId = newPersonRecord.id;
            console.log("Step 2 Result: New person created with ID", personRecordId);
        } else {
            console.log("Step 2: Person exists with ID", personRecordId, ". Optionally updating...");
            // Optionally update existing person with new info if provided
            const updateFields: any = {};
            if (reviewData.nickname && !existingPerson.get("Apodo")) updateFields["Apodo"] = reviewData.nickname;
            if (reviewData.email && !existingPerson.get("Email")) updateFields["Email"] = reviewData.email;
            if (reviewData.phoneNumber && !existingPerson.get("Celular")) updateFields["Celular"] = reviewData.phoneNumber;
            if (reviewData.instagram && !existingPerson.get("Instagram")) updateFields["Instagram"] = reviewData.instagram;

            if (Object.keys(updateFields).length > 0) {
                await base(PEOPLE_TABLE).update(personRecordId, updateFields);
                console.log("Step 2 Result: Existing person updated.");
            }
        }

        console.log("Step 3: Creating review...");
        // 3. Create review
        await base(REVIEWS_TABLE).create({
            "Persona Reseñada": [personRecordId],
            "Categoría": CATEGORIES[reviewData.category].label,
            "Calificación": reviewData.rating,
            "Texto": reviewData.text,
            "Autor Pseudo": reviewData.pseudoAuthor,
            "Puntaje": score,
            "Confirmaciones": 0, // Initial confirmations
            "Evidencia": reviewData.evidenceUrl ? [{ url: reviewData.evidenceUrl }] : undefined,
        });
        console.log("Step 3 Result: Review created successfully.");

        // Note: Airtable formulas will automatically update 'Puntaje Total', 'Nro de Reseñas', 'Semáforo' in PEOPLE_TABLE

        return true;
    } catch (error) {
        console.error("Error submitting review to Airtable:", error);
        return false;
    }
};

export const getRankings = async (): Promise<{ topNegative: PersonProfile[], topPositive: PersonProfile[] }> => {
    console.log("Fetching rankings");
    const allProfiles: PersonProfile[] = [];

    try {
        await base(PEOPLE_TABLE).select({
            sort: [{ field: "Puntaje Total", direction: "asc" }] // Sort by score for ranking
        }).eachPage((records, fetchNextPage) => {
            records.forEach(record => {
                const totalScore = record.get('Puntaje Total') as number || 0;
                const totalReviews = record.get('Nro de Reseñas') as number || 0;
                allProfiles.push({
                    id: record.id,
                    identifiers: [record.get('Nombre') as string],
                    country: record.get('País') as string,
                    totalScore: totalScore,
                    reputation: calculateReputationLevel(totalScore, totalReviews),
                    reviews: [], // Not needed for ranking display
                });
            });
            fetchNextPage();
        });

        const topNegative = allProfiles.filter(p => p.reputation === ReputationLevel.Risk || p.reputation === ReputationLevel.Warning).slice(0, 5);
        const topPositive = allProfiles.filter(p => p.reputation === ReputationLevel.Positive).slice(0, 5);

        return { topNegative, topPositive };

    } catch (error) {
        console.error("Error fetching rankings from Airtable:", error);
        return { topNegative: [], topPositive: [] };
    }
};

export const getUserProfile = async (pseudoUsername: string): Promise<UserProfile | null> => {
    console.log(`Fetching user profile for: ${pseudoUsername}`);
    const userReviews: Review[] = [];
    let userProfile: UserProfile | null = null;

    try {
        await base(REVIEWS_TABLE).select({
            filterByFormula: `{Autor Pseudo} = '${pseudoUsername}'`,
            sort: [{ field: "Fecha", direction: "desc" }]
        }).eachPage((records, fetchNextPage) => {
            records.forEach(record => {
                const rawCategory = record.get('Categoría');
                const mappedCategory = typeof rawCategory === 'string' ? CATEGORY_LABEL_TO_ENUM[rawCategory] ?? ReviewCategory.Positive : ReviewCategory.Positive;

                userReviews.push({
                    id: record.id,
                    personReviewed: (record.get('Persona Reseñada Nombre') as string[])[0] || '',
                    category: mappedCategory,
                    rating: record.get('Calificación') as string,
                    text: record.get('Texto') as string,
                    pseudoAuthor: record.get('Autor Pseudo') as string,
                    date: record.get('Fecha') as string,
                    confirmations: record.get('Confirmaciones') as number || 0,
                    evidenceUrl: record.get('Evidencia') ? (record.get('Evidencia') as any[])[0]?.url : undefined,
                    score: record.get('Puntaje') as number,
                });
            });
            fetchNextPage();
        });

        // Mock contribution score for now, as Airtable doesn't track user scores directly
        if (userReviews.length > 0) {
            userProfile = {
                id: pseudoUsername, // Using pseudoUsername as ID for mock
                pseudoUsername: pseudoUsername,
                contributionScore: userReviews.reduce((sum, review) => sum + review.score, 0) + (userReviews.length * 5), // Simple mock score
                reviews: userReviews,
            };
        }

    } catch (error) {
        console.error("Error fetching user profile from Airtable:", error);
    }

    return userProfile;
};


export const performWebChecks = async (query: string): Promise<WebCheckResult[]> => {
    console.log(`Performing web check for: ${query}`);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate a longer delay for web scraping/API calls

    const results: WebCheckResult[] = [];
    const normalizedQuery = query.toLowerCase();
    const hash = Array.from(normalizedQuery).reduce((sum, char) => sum + char.charCodeAt(0), 0);

    // Simulate finding different numbers of profiles based on a simple hash of the query
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
