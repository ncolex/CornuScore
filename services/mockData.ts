import { PersonProfile, ReputationLevel, Review, ReviewCategory } from '../types';
import { calculateReputationLevel, getScoreFromCategory } from '../utils/reputation';

interface SeedPerson {
  id: string;
  name: string;
  country: string;
  aliases: string[];
}

interface SeedReview {
  id: string;
  personId: string;
  category: ReviewCategory;
  ratingEmoji: string;
  text: string;
  pseudoAuthor: string;
  confirmations: number;
  daysAgo: number;
  evidenceUrl?: string;
}

const daysAgoToIso = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

const seedPeople: SeedPerson[] = [
  {
    id: 'person-juan-perez',
    name: 'Juan Perez',
    country: 'Argentina',
    aliases: ['@juanperez', '+5491112345678', 'juan.perez@example.com'],
  },
  {
    id: 'person-maria-garcia',
    name: 'Maria Garcia',
    country: 'México',
    aliases: ['@mariagarcia', '+5215512345678', 'maria.garcia@example.com'],
  },
  {
    id: 'person-pedro-gomez',
    name: 'Pedro Gomez',
    country: 'Colombia',
    aliases: ['@pedrogomez', '+573001234567', 'pedro.gomez@example.com'],
  },
];

const seedReviews: SeedReview[] = [
  {
    id: 'review-juan-1',
    personId: 'person-juan-perez',
    category: ReviewCategory.Infidelity,
    ratingEmoji: '😡',
    text: 'Me fue infiel con mi mejor amiga. No lo recomiendo.',
    pseudoAuthor: 'Anonimo123',
    confirmations: 5,
    daysAgo: 12,
  },
  {
    id: 'review-juan-2',
    personId: 'person-juan-perez',
    category: ReviewCategory.Toxic,
    ratingEmoji: '🤔',
    text: 'Muy controlador y celoso. Revisaba mi celular a escondidas.',
    pseudoAuthor: 'ExCansada',
    confirmations: 2,
    daysAgo: 7,
  },
  {
    id: 'review-maria-1',
    personId: 'person-maria-garcia',
    category: ReviewCategory.Positive,
    ratingEmoji: '😍',
    text: 'Es una persona increíble, siempre me apoya en todo.',
    pseudoAuthor: 'AmigaFiel',
    confirmations: 10,
    daysAgo: 3,
  },
  {
    id: 'review-pedro-1',
    personId: 'person-pedro-gomez',
    category: ReviewCategory.Theft,
    ratingEmoji: '😡',
    text: 'Le presté dinero y nunca me lo devolvió.',
    pseudoAuthor: 'AmigoEstafado',
    confirmations: 1,
    daysAgo: 20,
  },
];

export interface MockDatabase {
  people: PersonProfile[];
}

export const buildMockDatabase = (): MockDatabase => {
  const peopleMap = new Map<string, PersonProfile>();

  seedPeople.forEach((seed) => {
    peopleMap.set(seed.id, {
      id: seed.id,
      identifiers: [seed.name, ...seed.aliases],
      country: seed.country,
      totalScore: 0,
      reputation: ReputationLevel.Unknown,
      reviewCount: 0,
      reviews: [],
    });
  });

  seedReviews.forEach((seed) => {
    const person = peopleMap.get(seed.personId);
    if (!person) return;

    const score = getScoreFromCategory(seed.category);
    const review: Review = {
      id: seed.id,
      category: seed.category,
      ratingEmoji: seed.ratingEmoji,
      text: seed.text,
      score,
      date: daysAgoToIso(seed.daysAgo),
      pseudoAuthor: seed.pseudoAuthor,
      confirmations: seed.confirmations,
      evidenceUrl: seed.evidenceUrl,
      personReviewed: person.identifiers[0],
    };

    person.reviews.push(review);
    person.totalScore += score;
    person.reviewCount += 1;
  });

  peopleMap.forEach((person) => {
    person.reputation = calculateReputationLevel(person.totalScore, person.reviewCount);
  });

  return { people: Array.from(peopleMap.values()) };
};
