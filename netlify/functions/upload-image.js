// Netlify Function: upload-image
// Accepts POST JSON: { dataUrl, filename, mimeType }
// Stores the image in Netlify Blobs public scope and returns { url }

exports.handler = async (event) => {
  const { getStore } = await import('@netlify/blobs');
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders(),
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  try {
    const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
    if (!contentType.includes('application/json')) {
      return json(400, { error: 'Expected application/json' });
    }

    const { dataUrl, filename = 'evidence', mimeType = 'application/octet-stream' } = JSON.parse(event.body || '{}');
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.includes(',')) {
      return json(400, { error: 'Invalid dataUrl' });
    }

    const base64 = dataUrl.split(',')[1];
    const buffer = Buffer.from(base64, 'base64');

    // Enforce max 2MB
    const MAX_BYTES = 2 * 1024 * 1024;
    if (buffer.length > MAX_BYTES) {
      return json(413, { error: 'Image too large. Max 2MB.' });
    }

    const store = getStore('evidence', { scope: 'public' });
    const key = `evidence/${Date.now()}-${Math.random().toString(36).slice(2)}-${sanitize(filename)}`;
    const res = await store.set(key, buffer, {
      contentType: mimeType,
      addRandomSuffix: false,
    });

    // res contains { url } for public scope
    return json(200, { url: res.url });
  } catch (err) {
    console.error('upload-image error:', err);
    return json(500, { error: 'Upload failed' });
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    body: JSON.stringify(body),
  };
}

function sanitize(name) {
  return String(name).replace(/[^a-zA-Z0-9._-]+/g, '-');
}
