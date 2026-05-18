export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d&includePrePost=true`;
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' },
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) throw new Error(`Yahoo ${r.status}`);
    const data = await r.json();
    const meta = data.chart.result[0].meta;
    const price = meta.regularMarketPrice ?? meta.regularMarketPreviousClose;
    const prev = meta.chartPreviousClose || meta.previousClose || price;
    const chg = price - prev;
    const pct = (chg / prev) * 100;
    res.json({ price, chg, pct, high: meta.regularMarketDayHigh, low: meta.regularMarketDayLow, vol: meta.regularMarketVolume });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
