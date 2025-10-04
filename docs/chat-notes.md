# CornuScore – notas técnicas rápidas

## Arquitectura actual

- Frontend en Vite + React (HashRouter) hospedado en Netlify.
- Autenticación simulada por contexto (`AuthContext`) hasta integrar las funciones `login`/`register`.
- Base de datos en **Neon** usando Drizzle ORM. Las funciones serverless (`netlify/functions/*`) acceden vía `@netlify/neon`.
- Migraciones generadas con `drizzle-kit` (`npm run db:generate`, `npm run db:migrate`).
- Archivos CSV (`Personas-Grid view.csv`, `Reseñas-Grid view.csv`) se mantienen solo como insumo de scripts de migración y nunca entran al bundle.
- Scripts claves:
  - `scripts/migrate-reseniador.js`: marca posibles reseñadores y genera CSV normalizados en `output/`.
  - `scripts/populate_db.ts`: seed básico usando Drizzle + blobs públicos.
  - `scripts/populate_from_csv.ts`: ejemplo de import directo desde objetos in-memory.

## Funciones Netlify

| Endpoint | Descripción |
| --- | --- |
| `/.netlify/functions/searchProfiles` | Busca personas y reseñas en Neon, ordenadas por coincidencia. |
| `/.netlify/functions/getRankings` | Ranking top positivos/negativos. Calcula reputación según puntaje acumulado. |
| `/.netlify/functions/submitReview` | Inserta reseñas, sube evidencia a Netlify Blobs si llega en Base64. |
| `/.netlify/functions/getUserProfile` | Obtiene reseñas hechas por un autor (pseudo). |
| `/.netlify/functions/login` / `register` | Stubs para migrar a auth real; hoy devuelven tokens simulados. |
| `/.netlify/functions/telegram-bot` | Punto de entrada para mini app / bot (WIP). |

## Env vars

```
# Frontend / funciones compartidas
gemini_api_key=...
NETLIFY_DATABASE_URL=postgres://...
# Netlify blobs (opcional: se generan automáticamente en Netlify)
NETLIFY_BLOBS_CONTEXT=...
```

Para desarrollo local con Netlify CLI: `netlify dev` propaga `NETLIFY_DATABASE_URL` desde tu site configurado. Si querés correr funciones en Node sin Netlify, setea `NETLIFY_DATABASE_URL` manualmente.

## Flujo de reseñas

1. Formulario (`NewReviewPage`) envía payload a `submitReview`.
2. La función:
   - Convierte evidencia (`dataUrl`) a blob público (jpeg <=200KB) usando `sharp`.
   - Inserta/actualiza persona por `personIdentifier` o celular.
   - Inserta reseña con categoría, rating (`POSITIVE/NEGATIVE`) y puntaje numérico.
3. `ResultsPage` consulta `searchProfiles` + chequeos web simulados (`services/webCheckService`). Si el usuario no inició sesión, se difumina el contenido (login requerido).

## Próximos pasos pendientes

- Reemplazar el login simulado del frontend por las funciones `login`/`register` (JWT guardado en `sessionStorage`).
- Completar seed desde Airtable (`fetch_airtable.js`) para quienes aún dependen de esa base.
- Ajustar `ProfilePage`/`ResultsPage` para manejar paginación y filtros adicionales.
- Cubrir flujos críticos con pruebas (Vitest + React Testing Library).

## Comandos útiles

```
npm run dev          # sólo frontend (Vite)
npm run start:netlify # frontend + funciones serverless en local
npm run build && npm run preview
npm run db:generate  # genera migraciones Drizzle desde schema
npm run db:migrate   # corre migraciones con Netlify Dev
```

Mantener `Personas.csv` / `Reseñas.csv` fuera del deploy final (solo sirven como backups/manual review).
