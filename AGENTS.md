# Repository Guidelines

## Project Structure & Module Organization
The Vite + React client lives at the repo root. `index.tsx` mounts `App.tsx`, which wires routing and top-level providers. UI building blocks sit in `components/`, route screens in `pages/`, and shared tokens in `constants.ts` and `types.ts`. Airtable integrations stay isolated under `services/`, while shared styling is in `index.css`. Static CSV datasets such as `personas.csv` remain at the top level; treat them as dev-only inputs and keep them out of production bundles.

## Build, Test, and Development Commands
Run `npm install` once per machine. `npm run dev` starts the Vite dev server with hot reload. `npm run build` creates the production bundle in `dist/`, and `npm run preview` serves that bundle for smoke tests before deploying.

## Coding Style & Naming Conventions
Author components in TypeScript + JSX with two-space indentation and single quotes. Export reusable modules by name, keep React components in PascalCase (`ReviewCard.tsx`), hooks in camelCase, and Vite env vars prefixed with `VITE_`. Compose styling with Tailwind utility classes inline; only place shared styles in `index.css`. Align new code with existing ESLint and TypeScript configurations.

## Testing Guidelines
No automated suite ships today, so validate UI flows via `npm run dev`. When adding tests, use Vitest with React Testing Library, colocate specs as `*.test.tsx`, and mock Airtable access through the service layer. Prioritize edge cases around reputation scoring, localization, and offline fallbacks.

## Commit & Pull Request Guidelines
Write short, imperative commit subjects (e.g., `Add ranking badge styles`) and include explanatory bodies when touching Airtable contracts. Pull requests must state the problem, outline the solution, list verification steps (`npm run dev`, screenshots for UI changes), and link tracking issues or documents. Request review from a maintainer familiar with the touched module before merging.

## Security & Configuration Tips
Copy `.env.local` from the template and define `GEMINI_API_KEY`, `VITE_AIRTABLE_API_KEY`, and `VITE_AIRTABLE_BASE_ID` locally. Never commit secret values. Guard new Airtable calls with environment checks so local development works without credentials.
