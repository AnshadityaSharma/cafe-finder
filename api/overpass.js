// Vercel Serverless Function — proxies Overpass API requests server-side
// This eliminates CORS issues since the call is server-to-server.

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
];

module.exports = async function handler(req, res) {
  // Allow POST only
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse body — Vercel auto-parses JSON, but handle raw string too
  let qlData;
  if (typeof req.body === 'string') {
    try {
      qlData = JSON.parse(req.body).data;
    } catch {
      qlData = req.body;
    }
  } else {
    qlData = req.body?.data;
  }

  if (!qlData) {
    return res.status(400).json({ error: 'Missing "data" field in request body' });
  }

  let lastError = null;

  for (const url of ENDPOINTS) {
    try {
      const upstream = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(qlData)}`,
      });

      if (upstream.status === 429 || upstream.status === 503 || upstream.status === 504) {
        lastError = `Endpoint ${url} returned ${upstream.status}`;
        continue;
      }

      if (!upstream.ok) {
        lastError = `Endpoint ${url} returned ${upstream.status}: ${await upstream.text().catch(() => 'no body')}`;
        continue;
      }

      const json = await upstream.json();

      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
      return res.status(200).json(json);
    } catch (err) {
      lastError = `${url}: ${err.message}`;
      continue;
    }
  }

  return res.status(502).json({
    error: 'All Overpass API endpoints failed',
    detail: lastError,
  });
};
