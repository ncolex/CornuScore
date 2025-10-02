<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

CornuScore es una PWA juvenil en tonos rosa pastel que permite:

- 🔍 Buscar reputación de personas por nombre, apodo, celular, email o Instagram.
- 🚦 Ver un semáforo social (verde/amarillo/rojo) con barra de riesgo y resumen.
- 📝 Enviar reseñas con categoría, emoji de puntuación, texto corto y evidencia opcional.
- ❤️ Confirmar experiencias similares, seguir rankings y revisar tu perfil pseudo-anónimo.
- 🤖 Consultar el mismo índice desde Telegram con el bot oficial.

View your app in AI Studio: https://ai.studio/apps/drive/1hqBdggefKsCPpLgiE5MQS4rOk-BZwU_u

## Configuración de entorno

Las funciones se degradan elegantemente a datos locales si no configuras Airtable, pero para producción define:

```
VITE_AIRTABLE_API_KEY=tu_api_key
VITE_AIRTABLE_BASE_ID=tu_base_id
```

Guárdalas en un archivo `.env.local` en la raíz del proyecto. El bot de Telegram también admite estas variables usando `Airtable` directamente.

## Ejecutar la PWA

**Requisitos:** Node.js 18+

```bash
npm install
npm run dev
```

Esto abre la PWA con datos simulados + cualquier reseña guardada en `localStorage`.

## Bot de Telegram

El bot usa `node-telegram-bot-api` y comparte la misma lógica de reputación.

1. Crea un archivo `.env` (o exporta variables) con:

   ```
   TELEGRAM_BOT_TOKEN=tu_token_bot
   TELEGRAM_BOT_POLLING=true
   AIRTABLE_API_KEY=opcional_si_quieres
   AIRTABLE_BASE_ID=opcional_si_quieres
   ```

2. Ejecuta el bot en modo polling:

   ```bash
   npm run bot
   ```

   Comandos disponibles:

   - `/verify [alias]` → devuelve el semáforo y hasta 3 reseñas.
   - `/report` → envía al formulario web.
   - `/start` → mensaje de bienvenida.

3. Ajusta `TELEGRAM_BOT_POLLING=false` si quieres manejar el webhook manualmente.

## Despliegue

El proyecto usa Vite + React y está listo para Vercel:

```bash
npm run build
```

Luego sube la carpeta a Vercel o tu hosting favorito.
