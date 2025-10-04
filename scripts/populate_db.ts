import { db } from '../db';
import { personas, reseñas } from '../db/schema';
import { getStore } from '@netlify/blobs';

function sanitize(name: string) {
  return String(name).replace(/[^a-zA-Z0-9._-]+/g, '-');
}

async function uploadEvidence(dataUrl: string, filename: string, mimeType: string): Promise<string | undefined> {
  try {
    const base64 = dataUrl.split(',')[1];
    const buffer = Buffer.from(base64, 'base64');

    const store = getStore('evidence', { scope: 'public' });
    const key = `evidence/${Date.now()}-${Math.random().toString(36).slice(2)}-${sanitize(filename)}`;
    const res = await store.set(key, buffer, {
      contentType: mimeType,
      addRandomSuffix: false,
    });
    return res.url;
  } catch (error) {
    console.error('Error uploading evidence:', error);
    return undefined;
  }
}

async function main() {
  console.log('Seeding database...');

  const evidenceUrl = await uploadEvidence('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'evidence.png', 'image/png');

  const juan = await db.insert(personas).values({ nombre: 'Juan Perez', celular: '111111111', pais: 'Argentina' }).returning();
  const maria = await db.insert(personas).values({ nombre: 'Maria Garcia', celular: '222222222', pais: 'Mexico' }).returning();
  const pedro = await db.insert(personas).values({ nombre: 'Pedro Rodriguez', celular: '333333333', pais: 'Colombia' }).returning();

  await db.insert(reseñas).values([
    {
      personaId: juan[0].id,
      categoria: 'POSITIVE',
      calificacion: '😍',
      texto: 'Muy buena persona, muy atento y amable.',
      autorPseudo: 'testuser',
      puntaje: 10,
      evidencia: evidenceUrl,
    },
    {
      personaId: maria[0].id,
      categoria: 'TOXIC',
      calificacion: '😡',
      texto: 'Muy toxica, no la recomiendo.',
      autorPseudo: 'testuser',
      puntaje: -10,
      evidencia: evidenceUrl,
    },
    {
      personaId: pedro[0].id,
      categoria: 'INFIDELITY',
      calificacion: '😡',
      texto: 'Me fue infiel, no confien en el.',
      autorPseudo: 'testuser',
      puntaje: -20,
      evidencia: evidenceUrl,
    },
  ]);

  console.log('Database seeded!');
}

main().catch(console.error);