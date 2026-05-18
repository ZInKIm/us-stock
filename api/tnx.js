export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const url = 'https://query1.finance.yahoo.com/v8/finance/chart/%5ETNX?interval=1d&range=2d';
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) throw new Error(`Yahoo ${r.status}`);
    const data = await r.json();
    const meta = data.chart.result[0].meta;
    const price = meta.regularMarketPrice;
    const prev = meta.chartPreviousClose || meta.previousClose;
    const chg = price - prev;
    const pct = (chg / prev) * 100;
    res.json({ price, chg, pct });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
