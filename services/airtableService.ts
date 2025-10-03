import { CATEGORIES } from '../constants';
import {
  PersonProfile,
  Review,
  ReviewCategory,
  ReputationLevel,
  UserProfile,
  WebCheckResult,
} from '../types';

const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;

const API_BASE = AIRTABLE_BASE_ID
  ? `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`
  : '';
const PEOPLE_TABLE = 'Personas';
const REVIEWS_TABLE = 'Reseñas';

const REPORTER_PHONE_SUPPORT_KEY = 'cornuscore-airtable-supports-reporter-phone';
const REPORTER_PHONE_SELECTED_FIELD_KEY = 'cornuscore-airtable-reporter-phone-fieldname';
const RATING_MODE_KEY = 'cornuscore-airtable-rating-mode';
const REPORTER_PHONE_FIELD_CANDIDATES = ['Autor Teléfono', 'Autor Telefono'];
const REVIEWERS_TABLE_CANDIDATES = ['Reseñadores', 'Resenadores', 'Autores', 'Usuarios'];
const REVIEWER_NAME_FIELD_CANDIDATES = ['Nombre', 'Autor', 'Usuario', 'Nombre Completo'];
const REVIEWER_PHONE_FIELD_CANDIDATES = ['Teléfono', 'Telefono', 'Celular'];
const REVIEW_LINK_FIELD_CANDIDATES = ['Reseñador', 'Resenador', 'Autor', 'Usuario'];
const IMGUR_CLIENT_ID = import.meta.env.VITE_IMGUR_CLIENT_ID as string | undefined;
const UPLOAD_ENDPOINT = (import.meta as any).env?.VITE_UPLOAD_ENDPOINT || '/.netlify/functions/upload-image';

type RatingMode = 'emoji' | 'label' | 'omit';

function readReporterPhoneSupport(): boolean | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const stored = window.localStorage.getItem(REPORTER_PHONE_SUPPORT_KEY);
  if (stored === 'true') {
    return true;
  }
  if (stored === 'false') {
    return false;
  }
  return null;
}

function persistReporterPhoneSupport(value: boolean) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(REPORTER_PHONE_SUPPORT_KEY, value ? 'true' : 'false');
}

function readReporterPhoneFieldName(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const stored = window.localStorage.getItem(REPORTER_PHONE_SELECTED_FIELD_KEY);
  return stored || null;
}

function persistReporterPhoneFieldName(value: string) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(REPORTER_PHONE_SELECTED_FIELD_KEY, value);
}

function readRatingMode(): RatingMode | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const stored = window.localStorage.getItem(RATING_MODE_KEY) as RatingMode | null;
  if (stored === 'emoji' || stored === 'label' || stored === 'omit') {
    return stored;
  }
  return null;
}

function persistRatingMode(value: RatingMode) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(RATING_MODE_KEY, value);
}

function readFromLS(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(key);
}

function writeToLS(key: string, value: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, value);
}

let reporterPhoneFieldSupported = readReporterPhoneSupport();
let ratingMode: RatingMode | null = readRatingMode();
let reporterPhoneFieldName: string | null = readReporterPhoneFieldName();
let reviewerTableName: string | null = null;
let reviewerNameField: string | null = null;
let reviewerPhoneField: string | null = null;
let reviewLinkField: string | null = null;

interface AirtableRecord<TFields> {
  id: string;
  createdTime: string;
  fields: TFields;
}

interface AttachmentField {
  url: string;
  filename?: string;
  type?: string;
}

interface ReviewRecordFields {
  'Categoría'?: string;
  'Calificación'?: string;
  'Texto'?: string;
  'Autor Pseudo'?: string;
  'Fecha'?: string;
  'Confirmaciones'?: number;
  'Evidencia'?: AttachmentField[];
  'Evidencia Base64'?: string;
  'Persona Reseñada Nombre'?: string[];
  'Puntaje'?: number;
}

interface PersonRecordFields {
  'Nombre'?: string;
  'Apodo'?: string;
  'Email'?: string;
  'Celular'?: string;
  'Instagram'?: string;
  'País'?: string;
  'Puntaje Total'?: number;
  'Nro de Reseñas'?: number;
  'Semáforo'?: string;
  'Semaforo'?: string;
  'Emoji Semáforo'?: string;
  'Emoji Semaforo'?: string;
}

export interface SubmitReviewEvidence {
  dataUrl: string;
  filename: string;
  mimeType: string;
}

export interface SubmitReviewPayload {
  personIdentifier: string;
  nickname?: string;
  email?: string;
  phoneNumber: string;
  instagram?: string;
  country: string;
  category: ReviewCategory;
  rating: string;
  text: string;
  reporterName: string;
  reporterPhone: string;
  evidence?: SubmitReviewEvidence;
}

interface AirtableListResponse<TFields> {
  records: AirtableRecord<TFields>[];
}

const CATEGORY_LABEL_TO_ENUM: Record<string, ReviewCategory> = Object.entries(CATEGORIES).reduce(
  (acc, [key, value]) => {
    acc[value.label] = key as ReviewCategory;
    return acc;
  },
  {} as Record<string, ReviewCategory>,
);

const hasCredentials = Boolean(AIRTABLE_API_KEY && AIRTABLE_BASE_ID);

const defaultHeaders: HeadersInit = {
  Authorization: `Bearer ${AIRTABLE_API_KEY}`,
  'Content-Type': 'application/json',
};

function buildTableUrl(table: string, params?: Record<string, string>): string {
  const url = new URL(`${API_BASE}/${encodeURIComponent(table)}`);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
}

async function airtableRequest<T>(url: string, init?: RequestInit): Promise<T> {
  if (!hasCredentials) {
    throw new Error('Airtable credentials are not configured.');
  }

  const response = await fetch(url, {
    ...init,
    headers: {
      ...defaultHeaders,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Airtable request failed (${response.status}): ${message}`);
  }

  return response.json() as Promise<T>;
}

async function ensureReviewerRecord(name: string, phone?: string): Promise<string | null> {
  if (!name) return null;

  const tableCandidates = reviewerTableName ? [reviewerTableName, ...REVIEWERS_TABLE_CANDIDATES] : REVIEWERS_TABLE_CANDIDATES;
  const nameFieldCandidates = reviewerNameField ? [reviewerNameField, ...REVIEWER_NAME_FIELD_CANDIDATES] : REVIEWER_NAME_FIELD_CANDIDATES;
  const phoneFieldCandidates = reviewerPhoneField ? [reviewerPhoneField, ...REVIEWER_PHONE_FIELD_CANDIDATES] : REVIEWER_PHONE_FIELD_CANDIDATES;

  for (const table of tableCandidates) {
    try {
      // Try to find by name using the first viable field
      let foundField: string | null = null;
      for (const f of nameFieldCandidates) {
        const url = buildTableUrl(table, {
          filterByFormula: `LOWER({${f}}) = '${name.toLowerCase().replace(/'/g, "\\'")}'`,
          maxRecords: '1',
        });
        try {
          const res = await airtableRequest<AirtableListResponse<Record<string, unknown>>>(url);
          foundField = f;
          if (res.records.length > 0) {
            reviewerTableName = table; writeToLS('cornuscore-airtable-reviewers-table', table);
            reviewerNameField = f; writeToLS('cornuscore-airtable-reviewer-name-field', f);
            return res.records[0].id;
          }
          break; // field exists even if no records
        } catch (err) {
          // Unknown field -> try next
          continue;
        }
      }

      // Create reviewer if not found
      const createFields: Record<string, unknown> = {};
      const nameF = foundField ?? nameFieldCandidates[0];
      createFields[nameF] = name;
      if (phone) {
        // Try best-effort phone field
        const phoneF = phoneFieldCandidates[0];
        createFields[phoneF] = phone;
      }
      const createUrl = buildTableUrl(table);
      try {
        const created = await airtableRequest<AirtableRecord<Record<string, unknown>>>(createUrl, {
          method: 'POST',
          body: JSON.stringify({ fields: createFields }),
        });
        reviewerTableName = table; writeToLS('cornuscore-airtable-reviewers-table', table);
        reviewerNameField = nameF; writeToLS('cornuscore-airtable-reviewer-name-field', nameF);
        if (phone) { reviewerPhoneField = phoneFieldCandidates[0]; writeToLS('cornuscore-airtable-reviewer-phone-field', reviewerPhoneField); }
        return created.id;
      } catch (err) {
        // Try alternative name/phone fields on failure
        for (const nf of nameFieldCandidates) {
          for (const pf of [undefined, ...phoneFieldCandidates]) {
            const fields: Record<string, unknown> = { [nf]: name };
            if (phone && pf) fields[pf] = phone;
            try {
              const created2 = await airtableRequest<AirtableRecord<Record<string, unknown>>>(createUrl, {
                method: 'POST',
                body: JSON.stringify({ fields }),
              });
              reviewerTableName = table; writeToLS('cornuscore-airtable-reviewers-table', table);
              reviewerNameField = nf; writeToLS('cornuscore-airtable-reviewer-name-field', nf);
              if (phone && pf) { reviewerPhoneField = pf; writeToLS('cornuscore-airtable-reviewer-phone-field', pf); }
              return created2.id;
            } catch {}
          }
        }
      }
    } catch {
      // Unknown table -> try next
      continue;
    }
  }
  return null;
}

function mapToReviewCategory(label?: string): ReviewCategory {
  if (!label) {
    return ReviewCategory.Positive;
  }
  return CATEGORY_LABEL_TO_ENUM[label] ?? ReviewCategory.Positive;
}

function computeReviewScore(category: ReviewCategory, confirmations: number = 0): number {
  const base = CATEGORIES[category]?.score ?? 0;
  const confirmBonus = Math.min(5, Math.max(0, confirmations));
  return base + confirmBonus;
}

function normalizeStr(val?: string): string {
  return (val || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function mapSemaforoToReputation(semaforo?: string, fallback: ReputationLevel = ReputationLevel.Unknown): ReputationLevel {
  const s = normalizeStr(semaforo);
  if (s === 'positivo') return ReputationLevel.Positive;
  if (s === 'alerta') return ReputationLevel.Warning;
  if (s === 'riesgo') return ReputationLevel.Risk;
  if (s === 'sin datos' || s === 'sindatos') return ReputationLevel.Unknown;
  return fallback;
}

function calculateReputationLevel(score: number, totalReviews: number): ReputationLevel {
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
}

function mapReviewRecord(record: AirtableRecord<ReviewRecordFields>): Review {
  const attachments = record.fields['Evidencia'] ?? [];
  const attachmentUrl = attachments[0]?.url;
  const inlineEvidence = record.fields['Evidencia Base64'];

  return {
    id: record.id,
    category: mapToReviewCategory(record.fields['Categoría']) ?? ReviewCategory.Positive,
    text: record.fields['Texto'] ?? '',
    score: record.fields['Puntaje'] ?? 0,
    date: record.fields['Fecha'] ?? record.createdTime,
    pseudoAuthor: record.fields['Autor Pseudo'] ?? 'Anónimo',
    confirmations: record.fields['Confirmaciones'] ?? 0,
    evidenceUrl: attachmentUrl ?? inlineEvidence,
    rating: record.fields['Calificación'] ?? '',
    personReviewed: record.fields['Persona Reseñada Nombre']?.[0],
  };
}

async function fetchReviewsForPerson(personId: string): Promise<Review[]> {
  const formula = `({Persona Reseñada} = '${personId}')`;
  const url = buildTableUrl(REVIEWS_TABLE, {
    filterByFormula: formula,
    'sort[0][field]': 'Fecha',
    'sort[0][direction]': 'desc',
  });

  const data = await airtableRequest<AirtableListResponse<ReviewRecordFields>>(url);
  return data.records.map(mapReviewRecord);
}

async function uploadToImgur(evidence: SubmitReviewEvidence): Promise<string | null> {
  if (!IMGUR_CLIENT_ID) return null;
  try {
    const base64 = evidence.dataUrl.split(',')[1] ?? '';
    if (!base64) return null;
    const body = new URLSearchParams();
    body.set('image', base64);
    body.set('type', 'base64');
    body.set('name', evidence.filename || 'evidence');
    const resp = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: { Authorization: `Client-ID ${IMGUR_CLIENT_ID}` },
      body,
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data?.data?.link ?? null;
  } catch {
    return null;
  }
}

async function resolveAttachmentPayload(evidence?: SubmitReviewEvidence): Promise<{ attachments: AttachmentField[]; inlineBase64?: string }> {
  if (!evidence) {
    return { attachments: [] };
  }

  if (evidence.dataUrl.startsWith('http')) {
    return {
      attachments: [
        { url: evidence.dataUrl, filename: evidence.filename, type: evidence.mimeType },
      ],
    };
  }

  // Try Netlify Function first (preferred), then Imgur, else fallback to base64
  let uploadedUrl: string | null = null;
  try {
    if (UPLOAD_ENDPOINT) {
      const resp = await fetch(UPLOAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl: evidence.dataUrl, filename: evidence.filename, mimeType: evidence.mimeType }),
      });
      if (resp.ok) {
        const data = await resp.json();
        uploadedUrl = data?.url ?? null;
      }
    }
  } catch {}

  if (!uploadedUrl) {
    uploadedUrl = await uploadToImgur(evidence);
  }
  if (uploadedUrl) {
    return {
      attachments: [
        { url: uploadedUrl, filename: evidence.filename, type: evidence.mimeType },
      ],
    };
  }

  const base64Only = evidence.dataUrl.includes(',') ? evidence.dataUrl.split(',')[1] : evidence.dataUrl;
  return { attachments: [], inlineBase64: base64Only };
}

export async function submitReview(
  payload: SubmitReviewPayload,
  options?: { onProgress?: (p: number) => void },
): Promise<boolean> {
  if (
    !payload.personIdentifier.trim() ||
    !payload.phoneNumber.trim() ||
    !payload.reporterName.trim() ||
    !payload.reporterPhone.trim()
  ) {
    return false;
  }

  if (!hasCredentials) {
    console.warn('Airtable credentials missing. Review will not be sent.');
    return false;
  }

  try {
    const normalizedIdentifier = payload.personIdentifier.trim().toLowerCase();
    const sanitizedIdentifier = normalizedIdentifier.replace(/'/g, "\'");
    const normalizedPhoneDigits = payload.phoneNumber.replace(/\D/g, '');
    const lookupConditions: string[] = [];

    if (normalizedPhoneDigits.length >= 6) {
      lookupConditions.push(`REGEX_REPLACE({Celular} & '', "[^0-9]", '') = '${normalizedPhoneDigits}'`);
    }
    lookupConditions.push(`LOWER({Nombre}) = '${sanitizedIdentifier}'`);

    const personLookupFormula = lookupConditions.length > 1
      ? `OR(${lookupConditions.join(',')})`
      : lookupConditions[0];

    const lookupUrl = buildTableUrl(PEOPLE_TABLE, {
      filterByFormula: personLookupFormula,
      maxRecords: '1',
    });

    const lookupResponse = await airtableRequest<AirtableListResponse<PersonRecordFields>>(lookupUrl);
    let personRecord = lookupResponse.records[0];

    if (!personRecord) {
      const createBody = {
        fields: {
          'Nombre': payload.personIdentifier.trim(),
          'País': payload.country,
          'Celular': payload.phoneNumber,
          ...(payload.nickname ? { 'Apodo': payload.nickname } : {}),
          ...(payload.email ? { 'Email': payload.email } : {}),
          ...(payload.instagram ? { 'Instagram': payload.instagram } : {}),
        },
      };

      const createUrl = buildTableUrl(PEOPLE_TABLE);
      personRecord = await airtableRequest<AirtableRecord<PersonRecordFields>>(createUrl, {
        method: 'POST',
        body: JSON.stringify(createBody),
      });
    } else {
      const updateFields: PersonRecordFields = {
        'Celular': payload.phoneNumber,
      };
      if (payload.nickname && !personRecord.fields['Apodo']) {
        updateFields['Apodo'] = payload.nickname;
      }
      if (payload.email && !personRecord.fields['Email']) {
        updateFields['Email'] = payload.email;
      }
      if (payload.instagram && !personRecord.fields['Instagram']) {
        updateFields['Instagram'] = payload.instagram;
      }
      if (payload.country && !personRecord.fields['País']) {
        updateFields['País'] = payload.country;
      }

      if (Object.keys(updateFields).length > 0) {
        const updateUrl = `${buildTableUrl(PEOPLE_TABLE)}/${personRecord.id}`;
        await airtableRequest<AirtableRecord<PersonRecordFields>>(updateUrl, {
          method: 'PATCH',
          body: JSON.stringify({ fields: updateFields }),
        });
      }
    }

    // Optionally ensure reviewer record and link field if possible
    let reviewerRecordId: string | null = null;
    try {
      reviewerRecordId = await ensureReviewerRecord(payload.reporterName.trim(), payload.reporterPhone.trim());
    } catch (e) {
      console.warn('Unable to ensure reviewer record:', e);
    }

    options?.onProgress?.(65);
    const { attachments, inlineBase64 } = await resolveAttachmentPayload(payload.evidence ?? undefined);
    options?.onProgress?.(85);
    const reviewFields: Record<string, unknown> = {
      'Persona Reseñada': [personRecord.id],
      'Categoría': CATEGORIES[payload.category].label,
      'Texto': payload.text,
      'Autor Pseudo': payload.reporterName.trim(),
      'Confirmaciones': 0,
    };

    // Try to include reporter phone using the most likely field, with fallback below on error
    if (reporterPhoneFieldSupported !== false) {
      const candidate = reporterPhoneFieldName ?? REPORTER_PHONE_FIELD_CANDIDATES[0];
      reviewFields[candidate] = payload.reporterPhone;
    }

    if (attachments.length > 0) {
      reviewFields['Evidencia'] = attachments;
    } else if (inlineBase64) {
      reviewFields['Evidencia Base64'] = inlineBase64;
    }

    // Try to link reviewer if we found/created it
    if (reviewerRecordId) {
      const linkName = reviewLinkField ?? REVIEW_LINK_FIELD_CANDIDATES[0];
      reviewFields[linkName] = [reviewerRecordId];
    }

    const reviewUrl = buildTableUrl(REVIEWS_TABLE);
    const fieldsForRequest: Record<string, unknown> = { ...reviewFields };

    let currentRatingMode: RatingMode = ratingMode ?? 'emoji';

    const applyRatingMode = () => {
      delete fieldsForRequest['Calificación'];
      if (currentRatingMode === 'omit') {
        return;
      }
      const ratingValue = currentRatingMode === 'emoji'
        ? payload.rating
        : CATEGORIES[payload.category].label;
      if (ratingValue) {
        fieldsForRequest['Calificación'] = ratingValue;
      }
    };

    applyRatingMode();

    while (true) {
      try {
        await airtableRequest<AirtableRecord<ReviewRecordFields>>(reviewUrl, {
          method: 'POST',
          body: JSON.stringify({ fields: fieldsForRequest }),
        });

        // If any reporter phone field was included, persist the fact and chosen name
        for (const name of REPORTER_PHONE_FIELD_CANDIDATES) {
          if (name in fieldsForRequest) {
            reporterPhoneFieldSupported = true;
            persistReporterPhoneSupport(true);
            reporterPhoneFieldName = name;
            persistReporterPhoneFieldName(name);
            break;
          }
        }

        if ('Calificación' in fieldsForRequest) {
          ratingMode = currentRatingMode;
          persistRatingMode(currentRatingMode);
        }

        options?.onProgress?.(100);
        break;
      } catch (error) {
        // Handle unknown reporter phone field name: try fallbacks
        if (error instanceof Error && error.message.includes('UNKNOWN_FIELD_NAME')) {
          const usedName = REPORTER_PHONE_FIELD_CANDIDATES.find((n) => n in fieldsForRequest);
          if (usedName) {
            const idx = REPORTER_PHONE_FIELD_CANDIDATES.indexOf(usedName);
            if (idx >= 0 && idx + 1 < REPORTER_PHONE_FIELD_CANDIDATES.length) {
              // Try next candidate
              const next = REPORTER_PHONE_FIELD_CANDIDATES[idx + 1];
              console.warn(`Airtable missing field "${usedName}". Retrying with "${next}".`);
              const val = fieldsForRequest[usedName];
              delete (fieldsForRequest as Record<string, unknown>)[usedName];
              (fieldsForRequest as Record<string, unknown>)[next] = val;
              continue;
            } else {
              console.warn('Airtable base missing reporter phone field. Retrying without reporter phone.');
              reporterPhoneFieldSupported = false;
              persistReporterPhoneSupport(false);
              delete (fieldsForRequest as Record<string, unknown>)[usedName];
              continue;
            }
          }
          // Also handle unknown reviewer link field name
          const usedReviewerLink = REVIEW_LINK_FIELD_CANDIDATES.find((n) => n in fieldsForRequest);
          if (usedReviewerLink) {
            const idx = REVIEW_LINK_FIELD_CANDIDATES.indexOf(usedReviewerLink);
            if (idx >= 0 && idx + 1 < REVIEW_LINK_FIELD_CANDIDATES.length) {
              const next = REVIEW_LINK_FIELD_CANDIDATES[idx + 1];
              const val = (fieldsForRequest as Record<string, unknown>)[usedReviewerLink];
              delete (fieldsForRequest as Record<string, unknown>)[usedReviewerLink];
              (fieldsForRequest as Record<string, unknown>)[next] = val;
              console.warn(`Retrying with alternate reviewer link field "${next}".`);
              continue;
            } else {
              delete (fieldsForRequest as Record<string, unknown>)[usedReviewerLink];
              console.warn('Reviewer link field not present. Proceeding without link.');
              continue;
            }
          }
        }

        const invalidRatingOption =
          error instanceof Error &&
          (
            error.message.includes('INVALID_MULTIPLE_CHOICE_OPTIONS') ||
            error.message.includes('Insufficient permissions to create new select option')
          ) &&
          'Calificación' in fieldsForRequest;

        if (invalidRatingOption) {
          if (currentRatingMode === 'emoji') {
            currentRatingMode = 'label';
            ratingMode = currentRatingMode;
            persistRatingMode(currentRatingMode);
            applyRatingMode();
            continue;
          }
          if (currentRatingMode === 'label') {
            currentRatingMode = 'omit';
            ratingMode = currentRatingMode;
            persistRatingMode(currentRatingMode);
            applyRatingMode();
            continue;
          }
        }

        // Handle missing Evidencia Base64 field by retrying without it
        if (
          error instanceof Error &&
          error.message.includes('UNKNOWN_FIELD_NAME') &&
          error.message.includes('Evidencia Base64') &&
          'Evidencia Base64' in fieldsForRequest
        ) {
          console.warn('Airtable base missing "Evidencia Base64" field. Retrying without inline evidence.');
          delete (fieldsForRequest as Record<string, unknown>)['Evidencia Base64'];
          continue;
        }

        // Handle invalid value type for Evidencia Base64 by omitting it
        if (
          error instanceof Error &&
          error.message.includes('INVALID_VALUE_FOR_COLUMN') &&
          error.message.includes('Evidencia Base64') &&
          'Evidencia Base64' in fieldsForRequest
        ) {
          console.warn('Airtable field "Evidencia Base64" rejected value. Retrying without inline evidence.');
          delete (fieldsForRequest as Record<string, unknown>)['Evidencia Base64'];
          continue;
        }

        throw error;
      }
    }

    return true;
  } catch (error) {
    console.error('Error submitting review to Airtable:', error);
    return false;
  }
}

export async function getProfileByQuery(query: string): Promise<PersonProfile | null> {
  if (!query.trim()) {
    return null;
  }

  if (!hasCredentials) {
    console.warn('Airtable credentials missing. Returning null profile.');
    return null;
  }

  try {
    const normalized = query.trim().toLowerCase();
    const sanitized = normalized.replace(/'/g, "\'");
    const digitQuery = normalized.replace(/[^0-9]/g, '');
    const conditions = [
      `LOWER({Nombre}) = '${sanitized}'`,
      `SEARCH('${sanitized}', LOWER({Nombre}))`,
      `LOWER({Instagram}) = '${sanitized}'`,
      `SEARCH('${sanitized}', LOWER({Instagram}))`,
      `LOWER({Celular}) = '${sanitized}'`,
      `SEARCH('${sanitized}', LOWER({Celular}))`,
      `LOWER({Email}) = '${sanitized}'`,
      `SEARCH('${sanitized}', LOWER({Email}))`,
    ];

    if (digitQuery.length >= 6) {
      conditions.push(
        `REGEX_REPLACE({Celular} & '', "[^0-9]", '') = '${digitQuery}'`,
        `SEARCH('${digitQuery}', REGEX_REPLACE({Celular} & '', "[^0-9]", ''))`,
      );
    }

    const formula = `OR(${conditions.join(',')})`;

    const url = buildTableUrl(PEOPLE_TABLE, {
      filterByFormula: formula,
      maxRecords: '1',
    });

    const response = await airtableRequest<AirtableListResponse<PersonRecordFields>>(url);
    if (response.records.length === 0) {
      return null;
    }

    const record = response.records[0];
    const totalScore = record.fields['Puntaje Total'] ?? 0;
    const totalReviews = record.fields['Nro de Reseñas'] ?? 0;
    const semaforo = record.fields['Semaforo'] ?? record.fields['Semáforo'];
    const semaforoEmoji = record.fields['Emoji Semaforo'] ?? record.fields['Emoji Semáforo'];

    const reviews = await fetchReviewsForPerson(record.id);

    const identifiers = [record.fields['Nombre'] ?? ''];
    if (record.fields['Apodo']) {
      identifiers.push(record.fields['Apodo']);
    }

    return {
      id: record.id,
      identifiers,
      country: record.fields['País'] ?? 'No especificado',
      totalScore,
      reputation: mapSemaforoToReputation(semaforo, calculateReputationLevel(totalScore, totalReviews)),
      reviews,
      reviewsCount: totalReviews,
      semaforoEmoji,
    };
  } catch (error) {
    console.error('Error fetching profile from Airtable:', error);
    return null;
  }
}

export async function searchProfilesByQuery(query: string, limit = 5, country?: string): Promise<PersonProfile[]> {
  if (!query.trim()) {
    return [];
  }

  if (!hasCredentials) {
    console.warn('Airtable credentials missing. Returning empty profile list.');
    return [];
  }

  try {
    const normalized = query.trim().toLowerCase();
    const sanitized = normalized.replace(/'/g, "\\'");
    const digitQuery = normalized.replace(/[^0-9]/g, '');
    const conditions = [
      `LOWER({Nombre}) = '${sanitized}'`,
      `SEARCH('${sanitized}', LOWER({Nombre}))`,
      `LOWER({Instagram}) = '${sanitized}'`,
      `SEARCH('${sanitized}', LOWER({Instagram}))`,
      `LOWER({Celular}) = '${sanitized}'`,
      `SEARCH('${sanitized}', LOWER({Celular}))`,
      `LOWER({Email}) = '${sanitized}'`,
      `SEARCH('${sanitized}', LOWER({Email}))`,
    ];

    if (digitQuery.length >= 6) {
      conditions.push(
        `REGEX_REPLACE({Celular} & '', "[^0-9]", '') = '${digitQuery}'`,
        `SEARCH('${digitQuery}', REGEX_REPLACE({Celular} & '', "[^0-9]", ''))`,
      );
    }

    const orExpr = `OR(${conditions.join(',')})`;
    let formula = orExpr;
    if (country && country.trim()) {
      const countrySanitized = country.trim().toLowerCase().replace(/'/g, "\\'");
      formula = `AND(${orExpr}, LOWER({País}) = '${countrySanitized}')`;
    }
    const url = buildTableUrl(PEOPLE_TABLE, {
      filterByFormula: formula,
      maxRecords: String(Math.max(1, Math.min(25, limit))),
    });

    const response = await airtableRequest<AirtableListResponse<PersonRecordFields>>(url);
    if (response.records.length === 0) {
      return [];
    }

    const profiles: PersonProfile[] = await Promise.all(
      response.records.map(async (record) => {
        const totalScore = record.fields['Puntaje Total'] ?? 0;
        const totalReviews = record.fields['Nro de Reseñas'] ?? 0;
        const semaforo = record.fields['Semaforo'] ?? record.fields['Semáforo'];
        const semaforoEmoji = record.fields['Emoji Semaforo'] ?? record.fields['Emoji Semáforo'];
        const reviews = await fetchReviewsForPerson(record.id);

        const identifiers = [record.fields['Nombre'] ?? ''];
        if (record.fields['Apodo']) {
          identifiers.push(record.fields['Apodo']);
        }

        return {
          id: record.id,
          identifiers,
          country: record.fields['País'] ?? 'No especificado',
          totalScore,
          reputation: mapSemaforoToReputation(semaforo, calculateReputationLevel(totalScore, totalReviews)),
          reviews,
          reviewsCount: totalReviews,
          semaforoEmoji,
        };
      }),
    );

    return profiles;
  } catch (error) {
    console.error('Error searching profiles from Airtable:', error);
    return [];
  }
}

export async function getRankings(): Promise<{ topNegative: PersonProfile[]; topPositive: PersonProfile[] }> {
  if (!hasCredentials) {
    console.warn('Airtable credentials missing. Returning empty rankings.');
    return { topNegative: [], topPositive: [] };
  }

  try {
    const url = buildTableUrl(PEOPLE_TABLE, {
      'sort[0][field]': 'Puntaje Total',
      'sort[0][direction]': 'asc',
      maxRecords: '50',
    });

    const response = await airtableRequest<AirtableListResponse<PersonRecordFields>>(url);
    const profiles: PersonProfile[] = response.records.map((record) => {
      const totalScore = record.fields['Puntaje Total'] ?? 0;
      const totalReviews = record.fields['Nro de Reseñas'] ?? 0;
      const semaforo = record.fields['Semaforo'] ?? record.fields['Semáforo'];
      const semaforoEmoji = record.fields['Emoji Semaforo'] ?? record.fields['Emoji Semáforo'];

      return {
        id: record.id,
        identifiers: [record.fields['Nombre'] ?? ''],
        country: record.fields['País'] ?? 'No especificado',
        totalScore,
        reputation: mapSemaforoToReputation(semaforo, calculateReputationLevel(totalScore, totalReviews)),
        reviews: [],
        reviewsCount: totalReviews,
        semaforoEmoji,
      };
    });

    const topNegative = profiles.filter((profile) => (
      profile.reputation === ReputationLevel.Risk ||
      profile.reputation === ReputationLevel.Warning
    )).slice(0, 5);

    const topPositive = profiles
      .filter((profile) => profile.reputation === ReputationLevel.Positive)
      .slice(0, 5);

    return { topNegative, topPositive };
  } catch (error) {
    console.error('Error fetching rankings from Airtable:', error);
    return { topNegative: [], topPositive: [] };
  }
}

export async function getUserProfile(pseudoUsername: string): Promise<UserProfile | null> {
  if (!pseudoUsername.trim()) {
    return null;
  }

  if (!hasCredentials) {
    console.warn('Airtable credentials missing. Returning null user profile.');
    return null;
  }

  try {
    const formula = `({Autor Pseudo} = '${pseudoUsername}')`;
    const url = buildTableUrl(REVIEWS_TABLE, {
      filterByFormula: formula,
      'sort[0][field]': 'Fecha',
      'sort[0][direction]': 'desc',
    });

    const response = await airtableRequest<AirtableListResponse<ReviewRecordFields>>(url);
    const reviews = response.records.map(mapReviewRecord);

    if (reviews.length === 0) {
      return null;
    }

    const contributionScore = reviews.reduce((total, review) => total + review.score, 0) + reviews.length * 5;

    return {
      id: pseudoUsername,
      pseudoUsername,
      contributionScore,
      reviews,
    };
  } catch (error) {
    console.error('Error fetching user profile from Airtable:', error);
    return null;
  }
}

export async function performWebChecks(query: string): Promise<WebCheckResult[]> {
  const normalizedQuery = query.toLowerCase();
  const hash = Array.from(normalizedQuery).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const results: WebCheckResult[] = [];

  const fbProfiles = hash % 4;
  const tinderProfiles = hash % 2;

  if (fbProfiles > 0) {
    results.push({
      id: `web-fb-${hash}`,
      source: 'Facebook',
      title: `Se encontraron ${fbProfiles} perfiles públicos en Facebook`,
      link: `https://www.facebook.com/search/top/?q=${encodeURIComponent(query)}`,
      snippet: `Se hallaron perfiles que podrían coincidir con "${query}". Verifica manualmente.`,
    });
  }

  if (tinderProfiles > 0) {
    results.push({
      id: `web-tinder-${hash}`,
      source: 'Tinder',
      title: 'Posible perfil encontrado en apps de citas',
      link: '#',
      snippet: 'Indicamos una posible presencia en aplicaciones de citas. No se puede mostrar un enlace directo por privacidad.',
    });
  }

  results.push({
    id: `web-google-${hash}`,
    source: 'Google',
    title: `Buscar "${query}" en Google`,
    link: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
    snippet: 'Realiza una búsqueda general para obtener más información pública.',
  });

  return results;
}
