import Airtable from 'airtable';
import TelegramBot from 'node-telegram-bot-api';
import { REPUTATION_LEVELS } from '../constants';
import { buildMockDatabase } from '../services/mockData';
import { calculateReputationLevel } from '../utils/reputation';
import { PersonProfile, Review, ReviewCategory } from '../types';

const {
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_BOT_POLLING = 'true',
  AIRTABLE_API_KEY,
  AIRTABLE_BASE_ID,
} = process.env;

if (!TELEGRAM_BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN is required to run the CornuScore bot.');
  process.exit(1);
}

const usePolling = TELEGRAM_BOT_POLLING !== 'false';

const isAirtableConfigured = Boolean(AIRTABLE_API_KEY && AIRTABLE_BASE_ID);
const PEOPLE_TABLE = 'Personas';
const REVIEWS_TABLE = 'Reseñas';

const base = isAirtableConfigured
  ? new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID as string)
  : null;

const localDatabase = buildMockDatabase();

const normalize = (value: string) => value.trim().toLowerCase();

const mapAirtableReview = (record: Airtable.Record<any>): Review => ({
  id: record.id,
  category: record.get('Categoría') as ReviewCategory,
  ratingEmoji: (record.get('Calificación') as string) || '🤔',
  text: (record.get('Texto') as string) || '',
  pseudoAuthor: (record.get('Autor Pseudo') as string) || 'anon',
  date: (record.get('Fecha') as string) || new Date().toISOString(),
  confirmations: (record.get('Confirmaciones') as number) || 0,
  evidenceUrl: record.get('Evidencia') ? (record.get('Evidencia') as any[])[0]?.url : undefined,
  score: (record.get('Puntaje') as number) || 0,
  personReviewed: ((record.get('Persona Reseñada Nombre') as string[]) || [])[0],
});

const lookupProfile = async (query: string): Promise<PersonProfile | null> => {
  if (!query) return null;

  if (!isAirtableConfigured || !base) {
    const normalizedQuery = normalize(query);
    const person = localDatabase.people.find((candidate) =>
      candidate.identifiers.some((identifier) => normalize(identifier) === normalizedQuery),
    );
    return person ?? null;
  }

  const normalizedQuery = normalize(query);
  let profile: PersonProfile | null = null;

  await base(PEOPLE_TABLE)
    .select({
      filterByFormula:
        `OR(LOWER(Nombre) = '${normalizedQuery}', LOWER(Instagram) = '${normalizedQuery}', LOWER(Celular) = '${normalizedQuery}', LOWER(Email) = '${normalizedQuery}')`,
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
        const review = mapAirtableReview(record);
        reviews.push(review);
      });
      fetchNextPage();
    });

  profile.reviews = reviews;
  profile.reviewCount = reviews.length;
  profile.totalScore = reviews.reduce((sum, review) => sum + review.score, 0);
  profile.reputation = calculateReputationLevel(profile.totalScore, profile.reviewCount);

  return profile;
};

const formatSummary = (profile: PersonProfile): string => {
  const reputation = REPUTATION_LEVELS[profile.reputation];
  const header = `Semáforo: ${reputation.label} (${profile.reviewCount} reseñas)`;
  const location = `País/Región: ${profile.country}`;
  const scoreLine = `Puntaje total: ${profile.totalScore}`;

  const reviewsSnippet = profile.reviews.slice(0, 3).map((review) => {
    const date = new Date(review.date).toLocaleDateString();
    return `${review.ratingEmoji} ${date} – ${review.text}`;
  });

  const footer =
    profile.reviews.length > 3
      ? `...y ${profile.reviews.length - 3} reseñas más en la web.`
      : 'Consulta el resto en CornuScore.com 💖';

  return [header, location, scoreLine, '', ...reviewsSnippet, '', footer].join('\n');
};

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: usePolling });

bot.onText(/^\/start$/, (msg) => {
  const welcome =
    '💗 Bienvenida a CornuScore Bot. Usa /verify [nombre o @usuario] para revisar reputaciones o /report para compartir tu experiencia.';
  bot.sendMessage(msg.chat.id, welcome);
});

bot.onText(/^\/verify(?:\s+(.+))?$/i, async (msg, match) => {
  const query = match?.[1]?.trim();

  if (!query) {
    bot.sendMessage(msg.chat.id, 'Por favor ingresa un nombre, alias, celular o correo después de /verify.');
    return;
  }

  bot.sendChatAction(msg.chat.id, 'typing');

  try {
    const profile = await lookupProfile(query);
    if (!profile) {
      bot.sendMessage(
        msg.chat.id,
        `No encontramos coincidencias internas para "${query}". Puedes ser la primera en reportar desde CornuScore.com 💅`,
      );
      return;
    }

    const summary = formatSummary(profile);
    bot.sendMessage(msg.chat.id, summary);
  } catch (error) {
    console.error('Error verifying profile via bot', error);
    bot.sendMessage(msg.chat.id, 'Ocurrió un error al buscar. Intenta nuevamente en unos segundos.');
  }
});

bot.onText(/^\/report$/i, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    'Para compartir tu historia entra a CornuScore.com y toca "Report". Tu identidad es pseudo-anónima pero cuidamos a la comunidad. 💌',
  );
});

bot.on('polling_error', (error) => {
  console.error('Polling error', error);
});

if (!usePolling) {
  console.log('CornuScore bot iniciado en modo webhook. Configura el webhook manualmente.');
} else {
  console.log('CornuScore bot escuchando comandos en Telegram.');
}
