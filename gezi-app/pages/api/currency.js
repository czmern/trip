// pages/api/currency.js
// Canlı döviz kuru - ExchangeRate-API (KEY GEREKMİYOR)

export default async function handler(req, res) {
  const { base = 'EUR', targets = 'IDR,TRY,USD,CHF,GBP' } = req.query;

  try {
    // Ücretsiz, key gerektirmeyen endpoint
    const response = await fetch(`https://open.er-api.com/v6/latest/${base}`);
    if (!response.ok) throw new Error('Döviz API bağlantı hatası');
    const data = await response.json();

    const targetList = targets.split(',');
    const rates = {};
    targetList.forEach(currency => {
      if (data.rates[currency]) {
        rates[currency] = {
          rate: data.rates[currency],
          formatted: formatRate(base, currency, data.rates[currency]),
        };
      }
    });

    // Değişim oranı için önceki günü de çek (yaklaşık hesap)
    return res.status(200).json({
      base,
      rates,
      last_updated: data.time_last_update_utc,
      next_update: data.time_next_update_utc,
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

function formatRate(base, target, rate) {
  if (target === 'IDR') return Math.round(rate).toLocaleString('tr-TR');
  if (target === 'TRY') return rate.toFixed(2);
  return rate.toFixed(4);
}
