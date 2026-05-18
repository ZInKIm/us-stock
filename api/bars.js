const ALPACA_KEY = 'PKQQ543P5I4JKNZJCN6BI66YMD';
const ALPACA_SECRET = 'HX2gyZ25JV1uHZ3xQEoNjpDRv5KX24uYfntCqpwT5UmC';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });
  try {
    const headers = {
      'APCA-API-KEY-ID': ALPACA_KEY,
      'APCA-API-SECRET-KEY': ALPACA_SECRET,
    };
    // 오늘 날짜 ET 기준 (UTC-4 EDT)
    const now = new Date();
    const etNow = new Date(now.getTime() - 4 * 3600000);
    const today = etNow.toISOString().split('T')[0];
    const start = `${today}T09:30:00-04:00`;
    const end   = `${today}T16:00:00-04:00`;
    const url = `https://data.alpaca.markets/v2/stocks/bars?symbols=${symbol}&timeframe=5Min&start=${start}&end=${end}&feed=iex&limit=200`;
    const r = await fetch(url, { headers, signal: AbortSignal.timeout(10000) });
    if (!r.ok) throw new Error(`Alpaca ${r.status}`);
    const data = await r.json();
    const bars = data.bars?.[symbol] || [];
    res.json({ points: bars.map(b => ({ t: new Date(b.t).getTime(), v: b.c })) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
