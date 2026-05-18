export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const r = await fetch('https://api.frankfurter.app/latest?from=USD&to=KRW', { signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error(`frankfurter ${r.status}`);
    const data = await r.json();
    const price = data.rates.KRW;
    // 전일
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split('T')[0];
    let prev = price;
    try {
      const r2 = await fetch(`https://api.frankfurter.app/${yStr}?from=USD&to=KRW`, { signal: AbortSignal.timeout(5000) });
      const d2 = await r2.json(); prev = d2.rates?.KRW || price;
    } catch {}
    const chg = price - prev, pct = (chg / prev) * 100;
    res.json({ price, chg, pct });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
