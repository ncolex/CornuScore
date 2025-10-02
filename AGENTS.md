# Repository Guidelines

## Project Structure & Module Organization
The Vite + React front end lives at the repository root. Routing starts in `index.tsx` and `App.tsx`, with reusable UI in `components/` and route-level screens in `pages/`. Cross-cutting types and constants reside in `types.ts` and `constants.ts`. Airtable integrations are isolated under `services/`, while static assets flow through standard Vite public imports. Scenario data used for evaluations sits in `eval/`; avoid bundling it into production builds.

## Build, Test, and Development Commands
Run `npm install` once per environment. Use `npm run dev` for the local development server, and `npm run build` to generate the production bundle in `dist/`. `npm run preview` serves the built bundle for smoke testing prior to deploying.

## Coding Style & Naming Conventions
Follow the existing TypeScript + JSX style: two-space indentation, single quotes, and named exports for composable modules. Co-locate component styles via Tailwind utility classes inside the JSX and keep shared styling in `index.css`. Name React components in PascalCase (`ReviewCard.tsx`), hooks in camelCase, and Vite environment variables with the `VITE_` prefix.

## Testing Guidelines
There is no bundled test runner today, so manual verification via `npm run dev` is expected. When introducing automated coverage, align with Vitest + React Testing Library, place specs alongside the source as `*.test.tsx`, and mock Airtable calls via thin service abstractions. Capture edge cases around reputation scoring and Airtable fallbacks before merging.

## Commit & Pull Request Guidelines
Existing history is sparse; standardize on short, imperative commit subjects (e.g., `Add ranking badge styles`). Include context-rich bodies when touching Airtable schema or data contracts. Pull requests should state the problem, summarize the solution, list verification steps (`npm run dev`, screenshots of UI changes), and link any tracking issues. Request review from a maintainer familiar with the affected module.

## Configuration & Secrets
Copy `.env.local` from the provided template and define `GEMINI_API_KEY`, `VITE_AIRTABLE_API_KEY`, and `VITE_AIRTABLE_BASE_ID`. Never commit secret values; rely on environment-specific storage. For local debug without Airtable access, guard new calls behind environment checks to preserve offline workflows.
