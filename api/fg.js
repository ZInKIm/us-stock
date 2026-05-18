export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const r = await fetch('https://production.dataviz.cnn.io/index/fearandgreed/graphdata', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.cnn.com/',
        'Origin': 'https://www.cnn.com',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) throw new Error(`CNN ${r.status}`);
    const data = await r.json();
    res.json({
      score: Math.round(data.fear_and_greed.score),
      rating: data.fear_and_greed.rating,
      pw: Math.round(data.fear_and_greed_historical?.previous_1_week?.score || 0),
      pm: Math.round(data.fear_and_greed_historical?.previous_1_month?.score || 0),
      py: Math.round(data.fear_and_greed_historical?.previous_1_year?.score || 0),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
