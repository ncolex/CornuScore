// fetch_airtable.js
import fs from "fs";
import fetch from "node-fetch";

// Variables de entorno (ponelas en tu .env o export en shell)
const AIRTABLE_API_KEY = process.env.VITE_AIRTABLE_API_KEY;
const BASE_ID = process.env.VITE_AIRTABLE_BASE_ID;

// Tablas a descargar
const tables = ["Personas", "Reseñas"];

async function fetchTable(table) {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}`;
  let records = [];
  let offset;

  do {
    const resp = await fetch(`${url}${offset ? `?offset=${offset}` : ""}`, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
    });
    const data = await resp.json();
    records = records.concat(data.records);
    offset = data.offset;
  } while (offset);

  return records;
}

function toCSV(records) {
  if (!records.length) return "";
  const fields = Object.keys(records[0].fields);
  const header = fields.join(",");
  const rows = records.map(r =>
    fields.map(f => JSON.stringify(r.fields[f] ?? "")).join(",")
  );
  return [header, ...rows].join("\n");
}

(async () => {
  for (const table of tables) {
    console.log(`Descargando tabla: ${table}...`);
    const records = await fetchTable(table);
    const csv = toCSV(records);
    fs.writeFileSync(`${table}.csv`, csv, "utf8");
    console.log(`✅ Guardado en ${table}.csv (${records.length} registros)`);
  }
})();
