export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'symbol required' });

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d&includePrePost=true`;
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!r.ok) throw new Error(`Yahoo ${r.status}`);
    const data = await r.json();
    const meta = data.chart.result[0].meta;
    const quote = data.chart.result[0].indicators.quote[0];
    // 프리/애프터/장중 모두 최신 가격 우선
    const price = meta.regularMarketPrice
      ?? meta.preMarketPrice
      ?? meta.postMarketPrice
      ?? meta.regularMarketPreviousClose;

    // 프리마켓/애프터마켓 가격이 있으면 그걸 우선 사용
    const livePrice = meta.postMarketPrice || meta.preMarketPrice || price;
    const prevClose = meta.chartPreviousClose || meta.previousClose || price;
    const chg = livePrice - prevClose;
    const pct = (chg / prevClose) * 100;

    res.json({
      symbol,
      price: livePrice,
      chg,
      pct,
      prev: prevClose,
      high: meta.regularMarketDayHigh,
      low: meta.regularMarketDayLow,
      vol: meta.regularMarketVolume,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
