# Configuración de CornuScore como Telegram Mini App

Estos pasos te permiten publicar la versión web de CornuScore dentro de Telegram utilizando el nuevo soporte para Mini Apps.

## 1. Preparar la aplicación web

1. Asegurate de tener la aplicación desplegada en una URL HTTPS pública (por ejemplo, Netlify o Vercel). Anotá la URL final, porque Telegram solo acepta dominios con certificado válido.
2. La app ya incluye el script oficial `telegram-web-app.js` y detecta el contexto de Telegram para adaptar el layout. No hace falta ningún otro cambio en el código.
3. Si vas a usar un entorno diferente al de producción, recordá reconstruir (`npm run build`) y publicar la carpeta `dist` en el hosting seleccionado.

## 2. Crear o configurar el bot con BotFather

1. Abrí un chat con [@BotFather](https://t.me/BotFather) en Telegram y ejecutá `/newbot` si todavía no tenés uno para CornuScore. Seguí las instrucciones hasta obtener el `BOT_TOKEN`.
2. Ejecutá `/setdomain` y enviá la URL (solo el dominio, sin ruta) donde está alojada la Mini App. Ejemplo: `cornuscore.netlify.app`.
3. Ejecutá `/setmenubutton` → elegí `web_app` y pegá la URL completa del sitio (`https://cornuscore.netlify.app/`). Podés añadir un título en español para el botón.
4. Opcional: con `/setcommands` añadí comandos como `start - Abrir CornuScore` o `help - Cómo usar el bot`.
5. Guardá el `BOT_TOKEN` en un lugar seguro. Si en el futuro querés integrar un backend (webhook/polling), lo vas a necesitar.

## 3. Probar la Mini App

1. Abrí el enlace `https://t.me/<nombre_del_bot>?startapp` (reemplazando `<nombre_del_bot>` por el alias que te dio BotFather).
2. Telegram abrirá la Mini App en pantalla completa. Verificá que:
   - El header propio de CornuScore no aparece (para aprovechar mejor el espacio).
   - El fondo y colores respetan el tema de Telegram.
   - La navegación funciona dentro del contenedor (se usa `HashRouter`, así que no se rompe el historial de Telegram).
3. Si necesitás depurar, Telegram Desktop permite abrir las DevTools con `Ctrl+Shift+I`.

## 4. Buenas prácticas adicionales

- **Control de estados**: si vas a diferenciar usuarios de Telegram, aprovechá `window.Telegram.WebApp.initDataUnsafe.user` en futuras mejoras.
- **Feedback visual**: podés llamar a `webApp.MainButton` y otras APIs desde la app para acciones específicas.
- **Seguridad**: si más adelante tenés backend, verificá la firma de `initData` siguiendo la [documentación oficial](https://core.telegram.org/bots/webapps#auth-data).
- **Compatibilidad**: recomienda a los usuarios abrir la Mini App en Telegram versión ≥ 6.0, que es cuando se habilitaron las Web Apps.

Con esto, el bot queda asociado a la Mini App y los usuarios pueden abrir CornuScore directamente desde Telegram.

## 5. Activar respuestas del bot (webhook)

Además de la mini app, podés hacer que el bot responda a comandos básicos (`/start`, `/help`, `/miniapp`). La función serverless `netlify/functions/telegram-bot.js` ya está lista; solo queda configurarla:

1. En Netlify (o el entorno donde deployás las funciones), definí las variables de entorno:
   - `TELEGRAM_BOT_TOKEN`: el token que te dio BotFather (recordá regenerarlo si quedó expuesto).
   - `TELEGRAM_MINIAPP_URL`: URL completa de la mini app (por ejemplo, `https://cornuscore.netlify.app/`).
2. Deployá el sitio y las funciones (`netlify deploy` o `npm run deploy:netlify`). El endpoint público quedará en `https://<tu-sitio>/.netlify/functions/telegram-bot`.
3. Registrá el webhook con Telegram:
   ```bash
   curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
     -d "url=https://<tu-sitio>/.netlify/functions/telegram-bot"
   ```
4. Probá en el chat de `@cornuscorebot` enviando `/start` o `/miniapp`. El bot responderá con los mensajes preconfigurados.

> Si en algún momento querés desactivar el webhook, ejecutá `/deleteWebhook` vía BotFather o `curl https://api.telegram.org/bot<token>/deleteWebhook`.
