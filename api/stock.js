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
    const url = `https://data.alpaca.markets/v2/stocks/snapshots?symbols=${symbol}&feed=iex`;
    const r = await fetch(url, { headers, signal: AbortSignal.timeout(10000) });
    if (!r.ok) throw new Error(`Alpaca ${r.status}`);
    const data = await r.json();
    const snap = data[symbol];
    if (!snap) throw new Error('no data');

    // latestTrade: 가장 최근 체결가 (실시간)
    const price = snap.latestTrade?.p || snap.dailyBar?.c;
    const prev = snap.prevDailyBar?.c || price;
    const chg = price - prev;
    const pct = (chg / prev) * 100;

    res.json({
      price,
      chg,
      pct,
      high: snap.dailyBar?.h,
      low: snap.dailyBar?.l,
      prev,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
