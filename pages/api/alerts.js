// pages/api/alerts.js - Sadece hedef koordinata göre afet uyarısı

export default async function handler(req, res) {
  const { lat, lon, country } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'lat ve lon zorunludur' });

  const results = { earthquakes: [], volcanic: [], weather_alerts: [], tsunamis: [], summary: {} };

  try {
    // USGS Deprem - son 30 gün, M4.5+, 500km yarıçap
    const startDate = getDateDaysAgo(30);
    const quakeUrl = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startDate}&minmagnitude=4.5&orderby=magnitude&limit=20&latitude=${lat}&longitude=${lon}&maxradiuskm=500`;
    const quakeRes = await fetch(quakeUrl, { signal: AbortSignal.timeout(8000) });
    if (quakeRes.ok) {
      const quakeData = await quakeRes.json();
      results.earthquakes = (quakeData.features || []).slice(0, 5).map(eq => ({
        magnitude: eq.properties.mag,
        place: eq.properties.place,
        time: new Date(eq.properties.time).toLocaleDateString('tr-TR'),
        depth: Math.round(eq.geometry.coordinates[2]),
        severity: eq.properties.mag >= 6.5 ? 'high' : eq.properties.mag >= 5.5 ? 'medium' : 'low',
        url: eq.properties.url,
      }));
    }
  } catch (e) { /* devam et */ }

  // Risk seviyesi hesapla - sadece gerçek verilere göre
  const hasHighQuake = results.earthquakes.some(e => e.severity === 'high');
  const hasMediumQuake = results.earthquakes.some(e => e.severity === 'medium');
  const totalAlerts = results.earthquakes.length;

  results.summary = {
    total: totalAlerts,
    risk_level: hasHighQuake ? 'high' : hasMediumQuake ? 'medium' : totalAlerts > 0 ? 'low' : 'safe',
    last_checked: new Date().toISOString(),
  };

  return res.status(200).json(results);
}

function getDateDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}
