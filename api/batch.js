const ALPACA_KEY = 'PKQQ543P5I4JKNZJCN6BI66YMD';
const ALPACA_SECRET = 'HX2gyZ25JV1uHZ3xQEoNjpDRv5KX24uYfntCqpwT5UmC';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: 'symbols required' });
  try {
    const headers = {
      'APCA-API-KEY-ID': ALPACA_KEY,
      'APCA-API-SECRET-KEY': ALPACA_SECRET,
    };
    const url = `https://data.alpaca.markets/v2/stocks/snapshots?symbols=${encodeURIComponent(symbols)}&feed=iex`;
    const r = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
    if (!r.ok) throw new Error(`Alpaca ${r.status}`);
    const data = await r.json();
    const out = {};
    for (const [sym, snap] of Object.entries(data)) {
      const price = snap.latestTrade?.p || snap.dailyBar?.c;
      const prev = snap.prevDailyBar?.c || price;
      const chg = price - prev;
      const pct = (chg / prev) * 100;
      out[sym] = { price, chg, pct };
    }
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
