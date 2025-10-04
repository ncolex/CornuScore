import { Handler } from '@netlify/functions';
import { db } from '../../db';
import { personas, reseñas } from '../../db/schema';
import { eq, or } from 'drizzle-orm';
import { SubmitReviewPayload } from '../../types';
import { getStore } from '@netlify/blobs';
import sharp from 'sharp';

function sanitize(name: string) {
  return String(name).replace(/[^a-zA-Z0-9._-]+/g, '-');
}

const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    let requestBody = event.body || '{}';
    if (event.isBase64Encoded) {
      requestBody = Buffer.from(requestBody, 'base64').toString('utf-8');
    }
    const payload: SubmitReviewPayload = JSON.parse(requestBody);

    let evidenceUrl: string | undefined = undefined;
    if (payload.evidence) {
      const { dataUrl, filename = 'evidence', mimeType = 'application/octet-stream' } = payload.evidence;
      if (dataUrl && typeof dataUrl === 'string' && dataUrl.includes(',')) {
        const base64 = dataUrl.split(',')[1];
        let buffer = Buffer.from(base64, 'base64');

        const RESIZE_THRESHOLD_BYTES = 200 * 1024; // 200KB
        if (buffer.length > RESIZE_THRESHOLD_BYTES) {
          buffer = await sharp(buffer)
            .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toBuffer();
        }

        let store;
        if (process.env.NETLIFY_BLOBS_CONTEXT) {
          const context = JSON.parse(Buffer.from(process.env.NETLIFY_BLOBS_CONTEXT, 'base64').toString('utf-8'));
          store = getStore({ name: 'evidence', siteID: context.siteID, token: context.token, scope: 'public' });
        } else {
          store = getStore('evidence', { scope: 'public' });
        }

        const key = `evidence/${Date.now()}-${Math.random().toString(36).slice(2)}-${sanitize(filename)}`;
        const res = await store.set(key, buffer, {
          contentType: 'image/jpeg', // Always jpeg after resizing
          addRandomSuffix: false,
        });
        evidenceUrl = res.url;
      }
    }

    let person = await db.query.personas.findFirst({
      where: or(
        eq(personas.nombre, payload.personIdentifier),
        eq(personas.celular, payload.phoneNumber)
      ),
    });

    if (!person) {
      const newPerson = await db.insert(personas).values({
        nombre: payload.personIdentifier,
        pais: payload.country,
        celular: payload.phoneNumber,
        instagram: payload.instagram,
        email: payload.email,
        apodo: payload.nickname,
      }).returning();
      person = newPerson[0];
    }

    if (!person) {
      throw new Error('Failed to create or find person');
    }

    await db.insert(reseñas).values({
      personaId: person.id,
      categoria: payload.category,
      texto: payload.text,
      calificacion: payload.rating,
      autorPseudo: payload.reporterName,
      evidencia: evidenceUrl,
      puntaje: payload.score ?? 0,
      confirmaciones: 0,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Error submitting review:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error submitting review', error: error.message }),
    };
  }
};

export { handler };
