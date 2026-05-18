const ALPACA_KEY = 'PKQQ543P5I4JKNZJCN6BI66YMD';
const ALPACA_SECRET = 'HX2gyZ25JV1uHZ3xQEoNjpDRv5KX24uYfntCqpwT5UmC';
const ALPACA_BASE = 'https://data.alpaca.markets/v2';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });

  try {
    const headers = {
      'APCA-API-KEY-ID': ALPACA_KEY,
      'APCA-API-SECRET-KEY': ALPACA_SECRET,
    };

    // 오늘 날짜 ET 기준
    const now = new Date();
    const etOffset = -4; // EDT (DST)
    const etNow = new Date(now.getTime() + etOffset * 3600000);
    const today = etNow.toISOString().split('T')[0];

    const url = `${ALPACA_BASE}/stocks/bars?symbols=${encodeURIComponent(symbol)}&timeframe=5Min&start=${today}T09:30:00-04:00&end=${today}T16:00:00-04:00&feed=iex&limit=200`;
    const r = await fetch(url, { headers, signal: AbortSignal.timeout(10000) });
    if (!r.ok) throw new Error(`Alpaca ${r.status}`);
    const data = await r.json();
    const bars = data.bars?.[symbol] || [];

    const points = bars.map(b => ({
      t: new Date(b.t).getTime(),
      v: b.c,
    }));

    res.json({ points });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
