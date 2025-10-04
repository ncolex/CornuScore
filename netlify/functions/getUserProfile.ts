
import { Handler } from '@netlify/functions';
import { db } from '../../db';
import { personas, reseñas } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { UserProfile, Review, ReviewCategory } from '../../types';

const handler: Handler = async (event, context) => {
  const { username } = event.queryStringParameters || {};

  if (!username || !username.trim()) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Username parameter is required' }),
    };
  }

  try {
    const reviewsData = await db
      .select()
      .from(reseñas)
      .where(eq(reseñas.autorPseudo, username))
      .orderBy(desc(reseñas.fecha));

    if (reviewsData.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User not found' }),
      };
    }

    const reviews: Review[] = await Promise.all(reviewsData.map(async (r) => {
      let personReviewedName = '';
      if (r.personaId) {
          const personaData = await db.select({ nombre: personas.nombre }).from(personas).where(eq(personas.id, r.personaId));
          if (personaData.length > 0) {
              personReviewedName = personaData[0].nombre || '';
          }
      }
      
      return {
        id: String(r.id),
        category: r.categoria as ReviewCategory,
        text: r.texto || '',
        score: r.puntaje || 0,
        date: r.fecha?.toISOString() || '',
        pseudoAuthor: r.autorPseudo || 'Anónimo',
        confirmations: r.confirmaciones || 0,
        evidenceUrl: r.evidencia || undefined,
        rating: r.calificacion || '',
        personReviewed: personReviewedName,
      };
    }));

    const contributionScore = reviews.reduce((total, review) => total + (review.score || 0), 0) + reviews.length * 5;

    const userProfile: UserProfile = {
      id: username,
      pseudoUsername: username,
      contributionScore,
      reviews,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(userProfile),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching user profile' }),
    };
  }
};

export { handler };
