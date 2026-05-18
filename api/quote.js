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

    // 최신 스냅샷 (현재가 + 일봉 정보)
    const snapUrl = `${ALPACA_BASE}/stocks/snapshots?symbols=${encodeURIComponent(symbol)}&feed=iex`;
    const snapR = await fetch(snapUrl, { headers, signal: AbortSignal.timeout(10000) });
    if (!snapR.ok) throw new Error(`Alpaca ${snapR.status}`);
    const snapData = await snapR.json();
    const snap = snapData[symbol];
    if (!snap) throw new Error('no snapshot');

    // latestTrade: 가장 최근 체결가
    // latestQuote: 매수/매도 호가
    // dailyBar: 당일 OHLCV
    // prevDailyBar: 전일 종가
    const price = snap.latestTrade?.p || snap.latestQuote?.ap || snap.dailyBar?.c;
    const prevClose = snap.prevDailyBar?.c || price;
    const chg = price - prevClose;
    const pct = (chg / prevClose) * 100;

    res.json({
      symbol,
      price,
      chg,
      pct,
      prev: prevClose,
      high: snap.dailyBar?.h,
      low: snap.dailyBar?.l,
      vol: snap.dailyBar?.v,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
