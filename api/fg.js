export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // alternative.me Crypto Fear & Greed (주식 시장과 높은 상관관계)
    const r = await fetch('https://api.alternative.me/fng/?limit=30', {
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) throw new Error(`alt.me ${r.status}`);
    const data = await r.json();
    const arr = data.data; // 최신순 배열
    const latest = arr[0];
    const week = arr[6] || arr[arr.length-1];
    const month = arr[29] || arr[arr.length-1];

    const ratingMap = {
      'Extreme Fear': 'Extreme Fear',
      'Fear': 'Fear',
      'Neutral': 'Neutral',
      'Greed': 'Greed',
      'Extreme Greed': 'Extreme Greed',
    };

    res.json({
      score: parseInt(latest.value),
      rating: latest.value_classification,
      pw: parseInt(week.value),
      pm: parseInt(month.value),
      py: parseInt(latest.value), // 1년치는 무료 미제공, 현재값으로 대체
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
