const fetch = global.fetch;

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN || '';
const TELEGRAM_API_BASE = TELEGRAM_BOT_TOKEN
  ? `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`
  : null;

exports.handler = async (event) => {
  if (event.httpMethod === 'GET') {
    return ok({ status: 'ok' });
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  if (!TELEGRAM_API_BASE) {
    console.error('Missing TELEGRAM_BOT_TOKEN environment variable');
    return json(500, { error: 'Bot token is not configured' });
  }

  try {
    const update = JSON.parse(event.body || '{}');
    const message = update.message || update.edited_message || update.channel_post;
    if (!message || !message.chat) {
      return ok({});
    }

    const chatId = message.chat.id;
    const text = (message.text || message.caption || '').trim();

    if (!text) {
      await sendMessage(chatId, 'Enviá un comando como /start para comenzar.');
      return ok({ handled: true });
    }

    const [command, ...rest] = text.split(/\s+/);
    const argText = rest.join(' ').trim();

    switch (command.toLowerCase()) {
      case '/start':
        await sendMessage(chatId, startMessage());
        break;
      case '/help':
        await sendMessage(chatId, helpMessage());
        break;
      case '/miniapp':
        await sendMessage(chatId, miniAppMessage());
        break;
      case '/score':
        if (!argText) {
          await sendMessage(chatId, 'Usá el comando así: /score <nombre o dato de la persona>');
          break;
        }
        await sendMessage(chatId, `Abrí la mini app para ver resultados detallados: ${miniAppUrl()}`);
        break;
      default:
        await sendMessage(chatId, `No reconozco el comando "${command}". Probá /help.`);
        break;
    }

    return ok({ handled: true });
  } catch (error) {
    console.error('telegram-bot error', error);
    return json(500, { error: 'Internal error' });
  }
};

async function sendMessage(chatId, text) {
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
  };

  const res = await fetch(`${TELEGRAM_API_BASE}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('Failed to send message', res.status, body);
  }
}

function miniAppUrl() {
  const link = process.env.TELEGRAM_MINIAPP_URL || 'https://cornuscore.netlify.app/';
  return link;
}

function startMessage() {
  return [
    '*CornuScore*',
    '',
    'Verificá reputaciones antes de confiar. Abrí la mini app con /miniapp o tocá el botón en el menú.',
  ].join('\n');
}

function helpMessage() {
  return [
    '*Comandos disponibles*',
    '/start - Información inicial',
    '/miniapp - Abrir CornuScore como mini app',
    '/score <dato> - Consulta rápida (te lleva a la mini app)',
  ].join('\n');
}

function miniAppMessage() {
  return `Abrí CornuScore desde Telegram: ${miniAppUrl()}`;
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function ok(body) {
  return json(200, body);
}
