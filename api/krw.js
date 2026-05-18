export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const [todayR, yestR] = await Promise.all([
      fetch('https://api.frankfurter.app/latest?from=USD&to=KRW', { signal: AbortSignal.timeout(8000) }),
      fetch('https://api.frankfurter.app/latest?from=USD&to=KRW&date=prev', { signal: AbortSignal.timeout(8000) }),
    ]);
    const today = await todayR.json();
    const price = today.rates.KRW;
    let prev = price;
    try {
      const yest = await yestR.json();
      prev = yest.rates?.KRW || price;
    } catch {}
    const chg = price - prev;
    const pct = (chg / prev) * 100;
    res.json({ price, chg, pct });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
