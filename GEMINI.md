## Project Overview

CornuScore is a Progressive Web Application (PWA) built with React and TypeScript, designed to allow users to leave and search for reviews about people. It integrates with Airtable as its backend for storing review data and uses Tailwind CSS for styling. The application aims to provide a social reputation index (semáforo) based on user reviews.

## Main Technologies

-   **Frontend:** React, TypeScript, React Router DOM
-   **Styling:** Tailwind CSS (via CDN)
-   **Backend/Database:** Airtable (API integration)
-   **Build Tool:** Vite

## Architecture

The application follows a component-based architecture typical of React applications.

-   `App.tsx` handles routing.
-   `pages/` directory contains main views (HomePage, NewReviewPage, ResultsPage, RankingPage, ProfilePage).
-   `components/` directory contains reusable UI components.
-   `services/airtableService.ts` abstracts the interaction with the Airtable API.
-   `types.ts` defines TypeScript interfaces and enums for data structures.
-   `constants.ts` stores application-wide constants.

## Building and Running

-   **Prerequisites:** Node.js
-   **Install dependencies:**
    ```bash
npm install
    ```
-   **Configure Environment Variables:**
    Create a `.env.local` file in the project root with your Airtable API Key and Base ID:
    ```
VITE_AIRTABLE_API_KEY=YOUR_AIRTABLE_API_KEY
VITE_AIRTABLE_BASE_ID=YOUR_AIRTABLE_BASE_ID
    ```
    These variables also need to be configured in the deployment environment (e.g., Netlify).
-   **Run the app locally:**
    ```bash
npm run dev
    ```
-   **Build for production:**
    ```bash
npm run build
    ```
-   **Preview production build:**
    ```bash
npm run preview
    ```

## Development Conventions

-   **Language:** TypeScript
-   **Framework:** React
-   **Routing:** React Router DOM
-   **Styling:** Tailwind CSS (utility-first approach)
-   **State Management:** React's `useState` hook for local component state.
-   **API Interaction:** Centralized in `services/airtableService.ts`.
-   **Environment Variables:** Uses `import.meta.env` for Vite-specific environment variables.

## Airtable Database Structure

The application interacts with an Airtable base containing at least two tables: `Personas` and `Reseñas`.

### `Personas` Table Fields:

-   `Nombre` (Primary, Single line text)
-   `País` (Single line text)
-   `Instagram` (URL)
-   `Celular` (Phone number)
-   `Email` (Email)
-   `Apodo` (Single line text)
-   `Reseñas` (Link to `Reseñas` table, Allow linking to multiple records)
-   `Nro de Reseñas` (Count of linked `Reseñas`)
-   `Puntaje Total` (Rollup of `Reseñas.Puntaje`, SUM(values))
-   `Semáforo` (Formula for reputation level)

### `Reseñas` Table Fields:

-   `ID Reseña` (Primary, Autonumber)
-   `Persona Reseñada` (Link to `Personas` table, Allow linking to a single record)
-   `Fecha` (Created time)
-   `Categoría` (Single select: Infidelidad, Robo, Traición, Tóxico, Positivo)
-   `Calificación` (Single select: 😍, 🤔, 😡)
-   `Puntaje` (Formula based on `Categoría`)
-   `Texto` (Long text)
-   `Autor Pseudo` (Single line text)
-   `Evidencia` (Attachment)
-   `Confirmaciones` (Number, Integer)
