export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=5m&range=1d`;
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) throw new Error(`Yahoo ${r.status}`);
    const data = await r.json();
    const result = data.chart.result[0];
    const ts = result.timestamp || [];
    const closes = result.indicators.quote[0].close || [];
    const points = ts.map((t, i) => ({ t: t * 1000, v: closes[i] })).filter(p => p.v != null);
    res.json({ points });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
