
import { Handler } from '@netlify/functions';
import { db } from '../../db';
import { personas, reseñas } from '../../db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { PersonProfile, ReputationLevel } from '../../types';

const calculateReputationLevel = (score: number, totalReviews: number): ReputationLevel => {
  if (totalReviews === 0) {
    return ReputationLevel.Unknown;
  }
  if (score > 0) {
    return ReputationLevel.Positive;
  }
  if (score >= -5) {
    return ReputationLevel.Warning;
  }
  return ReputationLevel.Risk;
};

const handler: Handler = async (event, context) => {
  try {
    const rankingData = await db
      .select({
        id: personas.id,
        nombre: personas.nombre,
        pais: personas.pais,
        totalScore: sql<number>`sum(${reseñas.puntaje})`.mapWith(Number),
        reviewsCount: sql<number>`count(${reseñas.id})`.mapWith(Number),
      })
      .from(personas)
      .leftJoin(reseñas, eq(personas.id, reseñas.personaId))
      .groupBy(personas.id)
      .orderBy(desc(sql`sum(${reseñas.puntaje})`));

    const profiles: PersonProfile[] = rankingData.map(p => ({
      id: String(p.id),
      identifiers: [p.nombre || ''],
      country: p.pais || 'No especificado',
      totalScore: p.totalScore,
      reviewsCount: p.reviewsCount,
      reputation: calculateReputationLevel(p.totalScore, p.reviewsCount),
      reviews: [],
      semaforoEmoji: ''
    }));

    const topPositive = profiles.filter(p => p.reputation === ReputationLevel.Positive).slice(0, 5);
    const topNegative = profiles.filter(p => p.reputation === ReputationLevel.Risk || p.reputation === ReputationLevel.Warning).sort((a, b) => a.totalScore - b.totalScore).slice(0, 5);

    return {
      statusCode: 200,
      body: JSON.stringify({ topPositive, topNegative }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching rankings' }),
    };
  }
};

export { handler };
