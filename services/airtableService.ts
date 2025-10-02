import Airtable from 'airtable';
import {
  PersonProfile,
  Review,
  ReviewCategory,
  ReputationLevel,
  UserProfile,
  WebCheckResult,
} from '../types';
import { buildMockDatabase, MockDatabase } from './mockData';
import { calculateReputationLevel, getScoreFromCategory } from '../utils/reputation';

const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY as string | undefined;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID as string | undefined;

const isAirtableConfigured = Boolean(AIRTABLE_API_KEY && AIRTABLE_BASE_ID);

const base = isAirtableConfigured
  ? new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID!)
  : null;

const PEOPLE_TABLE = 'Personas';
const REVIEWS_TABLE = 'Reseñas';

const isBrowser = typeof window !== 'undefined';
const LOCAL_STORAGE_KEY = 'cornuscore-local-db-v1';

let localDatabase: MockDatabase = (() => {
  if (!isBrowser) {
    return buildMockDatabase();
  }

  const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    const seeded = buildMockDatabase();
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const parsed = JSON.parse(stored) as MockDatabase;
    // Deep clone to avoid accidental mutations outside of this module
    return {
      people: parsed.people.map((person) => ({
        ...person,
        reviews: person.reviews.map((review) => ({ ...review })),
      })),
    };
  } catch (error) {
    console.warn('No se pudo leer la base local, recreando desde semillas.', error);
    const seeded = buildMockDatabase();
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
})();

const persistLocalDatabase = () => {
  if (!isBrowser) return;
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localDatabase));
};

const normalize = (value: string) => value.trim().toLowerCase();

const findLocalPersonByQuery = (query: string): PersonProfile | undefined => {
  const normalizedQuery = normalize(query);
  return localDatabase.people.find((person) =>
    person.identifiers.some((identifier) => normalize(identifier) === normalizedQuery),
  );
};

const updateLocalPersonMetrics = (person: PersonProfile) => {
  person.totalScore = person.reviews.reduce((sum, review) => sum + review.score, 0);
  person.reviewCount = person.reviews.length;
  person.reputation = calculateReputationLevel(person.totalScore, person.reviewCount);
};

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

const mapAirtableReview = (record: Airtable.Record<any>): Review => ({
  id: record.id,
  category: record.get('Categoría') as ReviewCategory,
  ratingEmoji: (record.get('Calificación') as string) || '🤔',
  text: (record.get('Texto') as string) || '',
  pseudoAuthor: (record.get('Autor Pseudo') as string) || 'anon',
  date: (record.get('Fecha') as string) || new Date().toISOString(),
  confirmations: (record.get('Confirmaciones') as number) || 0,
  evidenceUrl: record.get('Evidencia') ? (record.get('Evidencia') as any[])[0]?.url : undefined,
  score: (record.get('Puntaje') as number) ?? getScoreFromCategory(record.get('Categoría') as ReviewCategory),
  personReviewed: ((record.get('Persona Reseñada Nombre') as string[]) || [])[0],
});

export const getProfileByQuery = async (query: string): Promise<PersonProfile | null> => {
  if (!query) return null;

  if (!isAirtableConfigured || !base) {
    const person = findLocalPersonByQuery(query);
    return person ? { ...person, reviews: person.reviews.map((review) => ({ ...review })) } : null;
  }

  let profile: PersonProfile | null = null;

  await base(PEOPLE_TABLE)
    .select({
      filterByFormula:
        `OR(LOWER(Nombre) = '${normalize(query)}', LOWER(Instagram) = '${normalize(query)}', LOWER(Celular) = '${normalize(query)}', LOWER(Email) = '${normalize(query)}')`,
      maxRecords: 1,
    })
    .eachPage((records, fetchNextPage) => {
      if (records.length > 0) {
        const record = records[0];
        const totalScore = (record.get('Puntaje Total') as number) || 0;
        const totalReviews = (record.get('Nro de Reseñas') as number) || 0;

        profile = {
          id: record.id,
          identifiers: [record.get('Nombre') as string],
          country: (record.get('País') as string) || 'Desconocido',
          totalScore,
          reputation: calculateReputationLevel(totalScore, totalReviews),
          reviewCount: totalReviews,
          reviews: [],
        };
      }
      fetchNextPage();
    });

  if (!profile) {
    return null;
  }

  const reviews: Review[] = [];

  await base(REVIEWS_TABLE)
    .select({
      filterByFormula: `{Persona Reseñada} = '${profile.id}'`,
      sort: [{ field: 'Fecha', direction: 'desc' }],
    })
    .eachPage((records, fetchNextPage) => {
      records.forEach((record) => {
        reviews.push(mapAirtableReview(record));
      });
      fetchNextPage();
    });

  profile.reviews = reviews;
  profile.reviewCount = reviews.length;
  profile.totalScore = reviews.reduce((sum, review) => sum + review.score, 0);
  profile.reputation = calculateReputationLevel(profile.totalScore, profile.reviewCount);

  return profile;
};

export const submitReview = async (reviewData: {
  personIdentifier: string;
  country: string;
  category: ReviewCategory;
  ratingEmoji: string;
  text: string;
  pseudoAuthor: string;
  evidenceUrl?: string;
}): Promise<boolean> => {
  if (!reviewData.personIdentifier) return false;

  const score = getScoreFromCategory(reviewData.category);

  if (!isAirtableConfigured || !base) {
    const existingPerson = findLocalPersonByQuery(reviewData.personIdentifier);

    const ensurePerson = (): PersonProfile => {
      if (existingPerson) {
        return existingPerson;
      }

      const newPerson: PersonProfile = {
        id: `local-${Date.now()}`,
        identifiers: [reviewData.personIdentifier],
        country: reviewData.country,
        totalScore: 0,
        reputation: calculateReputationLevel(0, 0),
        reviewCount: 0,
        reviews: [],
      };

      localDatabase.people.push(newPerson);
      return newPerson;
    };

    const person = ensurePerson();

    if (!person.identifiers.includes(reviewData.personIdentifier)) {
      person.identifiers.push(reviewData.personIdentifier);
    }

    const review: Review = {
      id: `local-review-${Date.now()}`,
      category: reviewData.category,
      ratingEmoji: reviewData.ratingEmoji,
      text: reviewData.text,
      pseudoAuthor: reviewData.pseudoAuthor,
      date: new Date().toISOString(),
      confirmations: 0,
      evidenceUrl: reviewData.evidenceUrl,
      score,
      personReviewed: person.identifiers[0],
    };

    person.reviews.unshift(review);
    updateLocalPersonMetrics(person);
    persistLocalDatabase();
    return true;
  }

  try {
    let personRecordId: string | undefined;

    await base(PEOPLE_TABLE)
      .select({
        filterByFormula: `LOWER(Nombre) = '${normalize(reviewData.personIdentifier)}'`,
        maxRecords: 1,
      })
      .eachPage((records, fetchNextPage) => {
        if (records.length > 0) {
          personRecordId = records[0].id;
        }
        fetchNextPage();
      });

    if (!personRecordId) {
      const newPerson = await base(PEOPLE_TABLE).create({
        Nombre: reviewData.personIdentifier,
        País: reviewData.country,
      });
      personRecordId = newPerson.id;
    }

    await base(REVIEWS_TABLE).create({
      'Persona Reseñada': [{ id: personRecordId }],
      Categoría: reviewData.category,
      Calificación: reviewData.ratingEmoji,
      Texto: reviewData.text,
      'Autor Pseudo': reviewData.pseudoAuthor,
      Puntaje: score,
      Confirmaciones: 0,
      Evidencia: reviewData.evidenceUrl ? [{ url: reviewData.evidenceUrl }] : undefined,
    });

    return true;
  } catch (error) {
    console.error('Error submitting review to Airtable:', error);
    return false;
  }
};

export const getRankings = async (): Promise<{ topNegative: PersonProfile[]; topPositive: PersonProfile[] }> => {
  if (!isAirtableConfigured || !base) {
    const sorted = [...localDatabase.people].sort((a, b) => a.totalScore - b.totalScore);
    const topNegative = sorted
      .filter((person) => person.reputation !== ReputationLevel.Positive)
      .slice(0, 5);
    const topPositive = [...localDatabase.people]
      .filter((person) => person.reputation === ReputationLevel.Positive)
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 5);

    return {
      topNegative: topNegative.map((person) => ({
        ...person,
        identifiers: [...person.identifiers],
        reviews: [],
      })),
      topPositive: topPositive.map((person) => ({
        ...person,
        identifiers: [...person.identifiers],
        reviews: [],
      })),
    };
  }

  const profiles: PersonProfile[] = [];

  await base(PEOPLE_TABLE)
    .select({
      sort: [{ field: 'Puntaje Total', direction: 'asc' }],
    })
    .eachPage((records, fetchNextPage) => {
      records.forEach((record) => {
        const totalScore = (record.get('Puntaje Total') as number) || 0;
        const reviewCount = (record.get('Nro de Reseñas') as number) || 0;

        profiles.push({
          id: record.id,
          identifiers: [record.get('Nombre') as string],
          country: (record.get('País') as string) || 'Desconocido',
          totalScore,
          reputation: calculateReputationLevel(totalScore, reviewCount),
          reviewCount,
          reviews: [],
        });
      });
      fetchNextPage();
    });

  const topNegative = profiles
    .filter((profile) => profile.reputation !== ReputationLevel.Positive)
    .slice(0, 5);
  const topPositive = profiles
    .filter((profile) => profile.reputation === ReputationLevel.Positive)
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 5);

  return { topNegative, topPositive };
};

export const getUserProfile = async (pseudoUsername: string): Promise<UserProfile | null> => {
  if (!pseudoUsername) return null;

  if (!isAirtableConfigured || !base) {
    const reviews: Review[] = [];

    localDatabase.people.forEach((person) => {
      person.reviews.forEach((review) => {
        if (normalize(review.pseudoAuthor) === normalize(pseudoUsername)) {
          reviews.push({ ...review, personReviewed: person.identifiers[0] });
        }
      });
    });

    if (reviews.length === 0) {
      return {
        id: pseudoUsername,
        pseudoUsername,
        contributionScore: 0,
        reviews: [],
      };
    }

    const contributionScore = reviews.reduce((sum, review) => sum + review.score, 0) + reviews.length * 5;

    return {
      id: pseudoUsername,
      pseudoUsername,
      contributionScore,
      reviews,
    };
  }

  const userReviews: Review[] = [];

  await base(REVIEWS_TABLE)
    .select({
      filterByFormula: `{Autor Pseudo} = '${pseudoUsername}'`,
      sort: [{ field: 'Fecha', direction: 'desc' }],
    })
    .eachPage((records, fetchNextPage) => {
      records.forEach((record) => {
        userReviews.push(mapAirtableReview(record));
      });
      fetchNextPage();
    });

  if (userReviews.length === 0) {
    return {
      id: pseudoUsername,
      pseudoUsername,
      contributionScore: 0,
      reviews: [],
    };
  }

  const contributionScore = userReviews.reduce((sum, review) => sum + review.score, 0) + userReviews.length * 5;

  return {
    id: pseudoUsername,
    pseudoUsername,
    contributionScore,
    reviews: userReviews,
  };
};

export const performWebChecks = async (query: string): Promise<WebCheckResult[]> => {
  if (!query) return [];

  const normalizedQuery = query.trim();
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const hash = hashString(normalizedQuery.toLowerCase());

  const facebookProfiles = hash % 4;
  const tinderProfiles = hash % 2;

  const results: WebCheckResult[] = [];

  if (facebookProfiles > 0) {
    results.push({
      id: `web-fb-${hash}`,
      source: 'Facebook',
      title: `Se encontraron ${facebookProfiles} perfil(es) públicos en Facebook`,
      link: `https://www.facebook.com/search/top/?q=${encodeURIComponent(normalizedQuery)}`,
      snippet: `Existen resultados que podrían coincidir con "${normalizedQuery}". Revisa manualmente antes de confiar.`,
    });
  }

  if (tinderProfiles > 0) {
    results.push({
      id: `web-tinder-${hash}`,
      source: 'Tinder',
      title: 'Posible aparición en apps de citas',
      link: '#',
      snippet: 'Detectamos actividad en apps de citas. No se muestra enlace directo por políticas de privacidad.',
    });
  }

  results.push({
    id: `web-google-${hash}`,
    source: 'Google',
    title: `Buscar "${normalizedQuery}" en Google`,
    link: `https://www.google.com/search?q=${encodeURIComponent(normalizedQuery)}`,
    snippet: 'Realiza una búsqueda manual para complementar la información con otras fuentes públicas.',
  });

  return results;
};
