<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

[![Netlify Status](https://api.netlify.com/api/v1/badges/29d74e8c-d5ae-4507-99ea-704d8aa4d455/deploy-status)](https://app.netlify.com/projects/cornuscore/deploys)
[![Netlify Status for pruneondb](https://api.netlify.com/api/v1/badges/29d74e8c-d5ae-4507-99ea-704d8aa4d455/deploy-status?branch=pruneondb)](https://app.netlify.com/projects/cornuscore/deploys?branch=pruneondb)

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1hqBdggefKsCPpLgiE5MQS4rOk-BZwU_u

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app: `npm run dev`

### With Netlify Functions (recommended for uploads)

- Install Netlify CLI (one-time): `npm i -g netlify-cli`
- Link your site (one-time): `netlify login && netlify link`
- Start dev with functions: `npm run start:netlify`

This serves the Vite app and exposes `/.netlify/functions/submitReview` and other helpers for image uploads and searches.

## Database (Neon + Drizzle)

- Crea una base en Neon y copia el `connection string`.
- Define `NETLIFY_DATABASE_URL` en tu entorno de Netlify y en `.env.local` si corrés funciones en local.
- Comandos útiles:
  - `npm run db:generate` para crear migraciones a partir del esquema (`db/schema.ts`).
  - `npm run db:migrate` para aplicarlas en Netlify Dev.
  - `npm run db:studio` abre Drizzle Studio vía Netlify Dev.

### Deploy to Netlify

- Build: `npm run build`
- Deploy (prod): `npm run deploy:netlify`

## Telegram Mini App

Si querés publicar CornuScore dentro de Telegram, seguí la guía en [`docs/telegram-miniapp-setup.md`](docs/telegram-miniapp-setup.md). El código ya detecta cuándo se ejecuta dentro de Telegram y ajusta el layout automáticamente.
