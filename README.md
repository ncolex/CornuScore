<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1eItelzFwHDUmRV0UVN6eNJK72idMkOnL

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Ejecución rápida (ES)

- Instala dependencias: `npm install`
- Crea `.env.local` en la raíz con: `GEMINI_API_KEY=tu_api_key`
- Inicia el servidor: `npm run dev` (abre http://localhost:3000)

Notas:
- Si no configuras `GEMINI_API_KEY`, el sitio funciona igual; solo se desactivan funciones de IA (ej. imagen de perfil generada) y verás un icono de respaldo.
- Para build de producción: `npm run build` y luego `npm run preview`.
