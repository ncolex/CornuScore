
import { Handler } from '@netlify/functions';
import { db } from '../../db';
import { personas, reseñas } from '../../db/schema';
import { eq, desc, sql, like, or } from 'drizzle-orm';
import { PersonProfile, ReputationLevel, Review, ReviewCategory } from '../../types';

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
  const { query, limit, country } = event.queryStringParameters || {};

  if (!query || !query.trim()) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Query parameter is required' }),
    };
  }

  try {
    const lowerCaseQuery = query.toLowerCase();
    const profilesQuery = db
      .select({
        id: personas.id,
        nombre: personas.nombre,
        pais: personas.pais,
        instagram: personas.instagram,
        celular: personas.celular,
        email: personas.email,
      })
      .from(personas)
      .where(
        or(
          like(personas.nombre, `%${lowerCaseQuery}%`),
          like(personas.instagram, `%${lowerCaseQuery}%`),
          like(personas.celular, `%${lowerCaseQuery}%`),
          like(personas.email, `%${lowerCaseQuery}%`)
        )
      )
      .limit(Number(limit) || 5);
    
    const profileData = await profilesQuery;

    const profilesWithDetails: PersonProfile[] = await Promise.all(
      profileData.map(async (p) => {
        const reviewsData = await db
          .select()
          .from(reseñas)
          .where(eq(reseñas.personaId, p.id))
          .orderBy(desc(reseñas.fecha));

        const totalScore = reviewsData.reduce((acc, r) => acc + (r.puntaje || 0), 0);
        const reviewsCount = reviewsData.length;

        const reviews: Review[] = reviewsData.map(r => ({
          id: String(r.id),
          category: r.categoria as ReviewCategory,
          text: r.texto || '',
          score: r.puntaje || 0,
          date: r.fecha?.toISOString() || '',
          pseudoAuthor: r.autorPseudo || 'Anónimo',
          confirmations: r.confirmaciones || 0,
          evidenceUrl: r.evidencia || undefined,
          rating: r.calificacion || '',
          personReviewed: p.nombre || '',
        }));

        return {
          id: String(p.id),
          identifiers: [p.nombre || ''],
          country: p.pais || 'No especificado',
          totalScore,
          reviewsCount,
          reputation: calculateReputationLevel(totalScore, reviewsCount),
          reviews,
          semaforoEmoji: '',
        };
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify(profilesWithDetails),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error searching profiles' }),
    };
  }
};

export { handler };
