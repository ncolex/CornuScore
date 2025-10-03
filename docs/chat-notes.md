# CornuScore – Resumen de cambios y guía rápida

## Qué implementamos

- Búsqueda con país (obligatorio) y filtrado por `{País}` en Airtable.
- Soporte de múltiples resultados en `ResultsPage` con botón “Reportar”.
- Bandera por país y (opcional) emoji de semáforo leído desde Airtable.
- Semáforo en español (POSITIVO, ALERTA, RIESGO, SIN DATOS) con barra y colores.
- Reseñas: subida de imágenes
  - 1º intento: Netlify Function `/.netlify/functions/upload-image` (2 MB máx, público via Blobs).
  - 2º intento: Imgur si `VITE_IMGUR_CLIENT_ID` está definido.
  - 3º intento: fallback a `Evidencia Base64` (si el campo existe) o envía sin imagen.
- Progreso de carga de imagen en el formulario y spinner en botón “VERIFY”.
- Reseñadores (opcional): auto-detección de tabla/campos para crear y vincular el autor.
- Limpieza de textos (p. ej. “Celular de tu ex”), estilos “pill”, y conteo real de reseñas desde Airtable.

## Archivos clave tocados

- `pages/HomePage.tsx` – país por defecto, selector, spinner “VERIFICANDO…”.
- `pages/NewReviewPage.tsx` – estilos, carga con progreso, límite 2 MB, envío con callback de progreso.
- `pages/ResultsPage.tsx` – lista de perfiles, botón “Reportar”, usa `searchProfilesByQuery(query, limit, country)`.
- `components/ReputationMeter.tsx` – bandera y emoji opcional, muestra `{reviewsCount}`.
- `services/airtableService.ts` –
  - `searchProfilesByQuery` con `country` y normalización; reputación desde “Semaforo” si existe.
  - Subida de evidencia con Netlify/Imgur/fallback Base64 y robustez ante 422.
  - Modo `Calificación`: fallback emoji → etiqueta → omit con cache en `localStorage`.
  - Detección de campo para ‘Autor Teléfono/Telefono’ y reintento.
  - (Opcional) `ensureReviewerRecord` para crear/vincular reseñadores.
- `constants.ts` – `COUNTRY_LIST`, `countryFlagEmoji`.
- `netlify/functions/upload-image.js` – función para blobs públicos (máx 2 MB) con CORS.
- `.netlify/netlify.toml` – directorio de funciones.

## Variables de entorno (no commitear)

Crear `.env.local` (plantilla):

```
VITE_AIRTABLE_API_KEY=xxxxx
VITE_AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
# Opcional: endpoint dev si usás Vite sin netlify dev
# VITE_UPLOAD_ENDPOINT=http://localhost:8888/.netlify/functions/upload-image
# Opcional: fallback Imgur
# VITE_IMGUR_CLIENT_ID=xxxxxxxx
```

## Airtable – esquema recomendado

Tabla “Reseñas”
- `Persona Reseñada` (Link a Personas)
- `Categoría` (Single select: Infidelidad, Robo, Traición, Toxicidad, Positivo)
- `Calificación` (Single select o texto; si es select, define las opciones para evitar 422)
- `Autor Pseudo` (texto) – se guarda siempre
- `Autor Teléfono` o `Autor Telefono` (texto) – la app autodetecta
- `Evidencia` (Attachment) – adjuntos reales
- `Evidencia Base64` (Long text) – fallback opcional

Tabla “Personas”
- `Puntaje Total` (Rollup SUM de Reseñas.Puntaje) – o el campo que uses
- `Nro de Reseñas` (Count/Rollup)
- `Semaforo` (Formula/Single select en español) y opcional `Emoji Semaforo`

Tabla “Reseñadores” (opcional)
- `Nombre` (texto) y `Teléfono/Telefono/Celular` (texto)
- En “Reseñas”: campo Link “Reseñador/Resenador/Autor/Usuario” a esta tabla

## Comandos locales

Instalar dependencias y correr en dev (Vite):

```
npm install
npm run dev
```

Con funciones de Netlify (recomendado para subir imágenes en dev):

```
npm install -g netlify-cli
netlify login
netlify link  # si corresponde
netlify dev   # expone /.netlify/functions/upload-image en :8888
```

Build de producción:

```
npm run build
npm run preview
```

## Publicar en GitHub (ejemplo)

```
git init
git add .
git commit -m "Setup Netlify function, image upload + UI/flow updates"
git branch -M main
git remote add origin https://github.com/USUARIO/REPO.git
git push -u origin main
```

## Despliegue en Netlify

- “Publish directory”: `dist`
- “Functions directory”: `netlify/functions`
- Variables: `VITE_AIRTABLE_API_KEY`, `VITE_AIRTABLE_BASE_ID`, `VITE_IMGUR_CLIENT_ID` (opcional)

## Tips de uso / soporte

- Si el upload falla en dev con 404: usar `netlify dev` o definir `VITE_UPLOAD_ENDPOINT` a `http://localhost:8888/.netlify/functions/upload-image`.
- Si `Calificación` 422: definir opciones en el select o limpiar cache: `localStorage.removeItem('cornuscore-airtable-rating-mode')`.
- Si no existe `Evidencia Base64`: la app reintenta sin inline automaticamente.

