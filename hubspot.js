export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const token = process.env.HUBSPOT_TOKEN;
  if (!token) { res.status(500).json({ error: 'HUBSPOT_TOKEN no configurado en Vercel' }); return; }

  // GET /api/hubspot?endpoint=owners → fetch HubSpot owners
  if (req.method === 'GET') {
    const ep = req.query.endpoint || 'owners';
    try {
      const r = await fetch(`https://api.hubapi.com/crm/v3/${ep}?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await r.json();
      res.status(r.status).json(data);
    } catch(e) { res.status(500).json({ error: e.message }); }
    return;
  }

  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) {
      res.status(400).json({ error: 'Invalid JSON: ' + e.message }); return;
    }
  }
  if (!body) { res.status(400).json({ error: 'Empty body' }); return; }

  try {
    const r = await fetch('https://api.hubapi.com/crm/v3/objects/deals/search', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch(e) { res.status(500).json({ error: e.message }); }
}
