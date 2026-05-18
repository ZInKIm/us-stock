export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const r = await fetch('https://api.alternative.me/fng/?limit=30', { signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error(`alt.me ${r.status}`);
    const data = await r.json();
    const arr = data.data;
    res.json({
      score: parseInt(arr[0].value),
      rating: arr[0].value_classification,
      pw: parseInt(arr[6]?.value || arr[0].value),
      pm: parseInt(arr[29]?.value || arr[0].value),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
