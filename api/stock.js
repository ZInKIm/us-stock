const FH_KEY = 'd84qe99r01qutij9qeh0d84qe99r01qutij9qehg';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });
  try {
    const [quoteR, profileR] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FH_KEY}`, { signal: AbortSignal.timeout(8000) }),
      fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&count=2&token=${FH_KEY}`, { signal: AbortSignal.timeout(8000) }),
    ]);
    const q = await quoteR.json();
    if (!q || q.c === 0) throw new Error('no data');
    res.json({
      price: q.c,
      chg: q.d,
      pct: q.dp,
      high: q.h,
      low: q.l,
      prev: q.pc,
      vol: null,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
