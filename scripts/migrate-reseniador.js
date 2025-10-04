import fs from 'node:fs';
import path from 'node:path';

const RESEÑAS_FILE = path.resolve('Reseñas-Grid view.csv');
const PERSONAS_FILE = path.resolve('Personas-Grid view.csv');
const OUTPUT_DIR = path.resolve('output');

function readCsv(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return raw.replace(/^\uFEFF/, '');
}

function parseCsv(content) {
  const rows = [];
  let current = '';
  let row = [];
  let inQuotes = false;

  const pushValue = () => {
    row.push(current);
    current = '';
  };

  const pushRow = () => {
    if (inQuotes) {
      throw new Error('Malformed CSV: unmatched quote');
    }
    pushValue();
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];

    if (char === '\r') {
      continue;
    }

    if (char === '"') {
      if (inQuotes && content[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      pushValue();
      continue;
    }

    if (char === '\n' && !inQuotes) {
      pushRow();
      continue;
    }

    current += char;
  }

  // handle last value if file does not end with newline
  if (current.length > 0 || inQuotes || row.length > 0) {
    if (inQuotes) {
      throw new Error('Malformed CSV: unmatched quote at EOF');
    }
    pushValue();
    rows.push(row);
  }

  return rows;
}

function stringifyCsv(rows) {
  return rows
    .map((row) =>
      row
        .map((value = '') => {
          const stringValue = String(value ?? '');
          const needsQuotes = /[",\n]/.test(stringValue);
          if (!needsQuotes) {
            return stringValue;
          }
          const escaped = stringValue.replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(','),
    )
    .join('\r\n') + '\r\n';
}

function normalizeName(value) {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .trim()
    .toLowerCase();
}

function splitNames(value) {
  if (!value) {
    return [];
  }
  return value
    .split(/[;,|]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizeInstagram(value) {
  if (!value) {
    return '';
  }
  let handle = value.trim();
  if (!handle) {
    return '';
  }
  handle = handle.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '');
  handle = handle.replace(/\/.*$/, '');
  handle = handle.replace(/^@/, '');
  return normalizeName(handle);
}

function ensureLength(row, length) {
  while (row.length < length) {
    row.push('');
  }
}

function main() {
  if (!fs.existsSync(RESEÑAS_FILE)) {
    throw new Error(`No se encontró el archivo ${RESEÑAS_FILE}`);
  }
  if (!fs.existsSync(PERSONAS_FILE)) {
    throw new Error(`No se encontró el archivo ${PERSONAS_FILE}`);
  }

  const reseñasRaw = readCsv(RESEÑAS_FILE);
  const reseñasRows = parseCsv(reseñasRaw);
  const reseñasHeader = reseñasRows[0];

  const personaIdx = reseñasHeader.indexOf('Persona Reseñada');
  const reviewerIdx = reseñasHeader.indexOf('Reseñadores');
  if (personaIdx === -1 || reviewerIdx === -1) {
    throw new Error('Las columnas "Persona Reseñada" o "Reseñadores" no existen en Reseñas');
  }

  let reseniadorIdx = reseñasHeader.indexOf('RESENIADOR');
  if (reseniadorIdx === -1) {
    reseñasHeader.push('RESENIADOR');
    reseniadorIdx = reseñasHeader.length - 1;
  }

  const authorPhoneIdx = reseñasHeader.indexOf('Autor Telefono');
  const reviewerNamesNormalized = new Set();
  const reviewerPhonesNormalized = new Set();

  for (let i = 1; i < reseñasRows.length; i += 1) {
    const row = reseñasRows[i];
    if (!row || row.length === 0) {
      continue;
    }
    ensureLength(row, reseñasHeader.length);

    const personaName = row[personaIdx] ?? '';
    const personaNorm = normalizeName(personaName);

    const reviewerNames = splitNames(row[reviewerIdx] ?? '');
    const hasReviewerNames = reviewerNames.length > 0;

    const reviewerPhones = [];
    if (authorPhoneIdx !== -1) {
      const phoneValue = row[authorPhoneIdx] ?? '';
      if (phoneValue.trim()) {
        reviewerPhones.push(phoneValue.replace(/\D/g, ''));
      }
    }

    let isReviewer = false;
    if (hasReviewerNames) {
      const distinctFromPersona = reviewerNames.some((name) => normalizeName(name) !== personaNorm || !personaNorm);
      const sameAsPersona = reviewerNames.some((name) => normalizeName(name) === personaNorm && personaNorm);
      if (distinctFromPersona) {
        isReviewer = true;
      } else if (sameAsPersona && !distinctFromPersona) {
        isReviewer = false;
      }
    } else if (reviewerPhones.length > 0 && !personaNorm) {
      isReviewer = true;
    }

    row[reseniadorIdx] = isReviewer ? 'SI' : 'NO';

    if (isReviewer) {
      reviewerNames.forEach((name) => {
        const normalized = normalizeName(name);
        if (normalized && normalized !== personaNorm) {
          reviewerNamesNormalized.add(normalized);
        }
      });
      reviewerPhones.forEach((digits) => {
        if (digits) {
          reviewerPhonesNormalized.add(digits);
        }
      });
    }
  }

  const personasRaw = readCsv(PERSONAS_FILE);
  const personasRows = parseCsv(personasRaw);
  const personasHeader = personasRows[0];

  const nombreIdx = personasHeader.indexOf('Nombre');
  if (nombreIdx === -1) {
    throw new Error('La columna "Nombre" no existe en Personas');
  }

  let flagIdx = personasHeader.indexOf('Es Reseñador');
  if (flagIdx === -1) {
    personasHeader.push('Es Reseñador');
    flagIdx = personasHeader.length - 1;
  }

  const phoneIdx = personasHeader.indexOf('Celular');
  const apodoIdx = personasHeader.indexOf('Apodo');
  const instagramIdx = personasHeader.indexOf('Instagram');

  for (let i = 1; i < personasRows.length; i += 1) {
    const row = personasRows[i];
    if (!row || row.length === 0) {
      continue;
    }
    ensureLength(row, personasHeader.length);
    const nameNorm = normalizeName(row[nombreIdx] ?? '');
    const apodoNorm = apodoIdx !== -1 ? normalizeName(row[apodoIdx] ?? '') : '';
    const instagramNorm = instagramIdx !== -1 ? normalizeInstagram(row[instagramIdx] ?? '') : '';

    const candidateNames = new Set([nameNorm, apodoNorm, instagramNorm].filter(Boolean));

    let isReviewer = Array.from(candidateNames).some((candidate) => reviewerNamesNormalized.has(candidate));
    if (!isReviewer && phoneIdx !== -1) {
      const digits = (row[phoneIdx] ?? '').replace(/\D/g, '');
      if (digits) {
        isReviewer = reviewerPhonesNormalized.has(digits);
      }
    }
    row[flagIdx] = isReviewer ? 'SI' : 'NO';
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const reseñasOutputPath = path.join(OUTPUT_DIR, 'Reseñas-Grid view.migrated.csv');
  const personasOutputPath = path.join(OUTPUT_DIR, 'Personas-Grid view.migrated.csv');

  fs.writeFileSync(reseñasOutputPath, '\uFEFF' + stringifyCsv(reseñasRows), 'utf8');
  fs.writeFileSync(personasOutputPath, '\uFEFF' + stringifyCsv(personasRows), 'utf8');

  console.log('Migración completada. Archivos generados:');
  console.log(`- ${reseñasOutputPath}`);
  console.log(`- ${personasOutputPath}`);
}

try {
  main();
} catch (error) {
  console.error('[ERROR] ', error.message);
  process.exitCode = 1;
}
