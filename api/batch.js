const FH_KEY = 'd84qe99r01qutij9qeh0d84qe99r01qutij9qehg';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: 'symbols required' });
  const syms = symbols.split(',').slice(0, 10);
  try {
    const results = await Promise.allSettled(
      syms.map(s => fetch(`https://finnhub.io/api/v1/quote?symbol=${s}&token=${FH_KEY}`, { signal: AbortSignal.timeout(8000) }).then(r => r.json()))
    );
    const out = {};
    results.forEach((r, i) => {
      if (r.status === 'fulfilled' && r.value?.c) {
        out[syms[i]] = { price: r.value.c, chg: r.value.d, pct: r.value.dp };
      }
    });
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
