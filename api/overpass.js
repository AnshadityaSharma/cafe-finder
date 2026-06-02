// Vercel Serverless Function — proxies Overpass API requests server-side
// This eliminates CORS issues since the call is server-to-server.

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
];

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body?.data;
  if (!body) {
    return res.status(400).json({ error: 'Missing "data" field in request body' });
  }

  let lastError = null;

  for (const url of ENDPOINTS) {
    try {
      const upstream = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(body)}`,
      });

      if (upstream.status === 429 || upstream.status === 503 || upstream.status === 504) {
        lastError = `Endpoint ${url} returned ${upstream.status}`;
        continue; // try next mirror
      }

      if (!upstream.ok) {
        lastError = `Endpoint ${url} returned ${upstream.status}`;
        continue;
      }

      const json = await upstream.json();

      // Cache successful responses for 60s at the edge
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
      return res.status(200).json(json);
    } catch (err) {
      lastError = `${url}: ${err.message}`;
      continue;
    }
  }

  // All endpoints failed
  return res.status(502).json({
    error: 'All Overpass API endpoints failed',
    detail: lastError,
  });
}
