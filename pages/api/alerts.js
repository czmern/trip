// pages/api/alerts.js
// Canlı afet uyarıları - GDACS (Global Disaster Alert) + USGS (Deprem)
// KEY GEREKMİYOR

export default async function handler(req, res) {
  const { lat, lon, radius = 500 } = req.query; // radius km cinsinden

  try {
    const results = { earthquakes: [], volcanic: [], weather_alerts: [], tsunamis: [] };

    // 1. USGS Deprem API (son 7 gün, M4.5+)
    const quakeUrl = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${getDateDaysAgo(7)}&minmagnitude=4.5&orderby=magnitude&limit=10`;
    const quakeRes = await fetch(quakeUrl);
    if (quakeRes.ok) {
      const quakeData = await quakeRes.json();
      const nearby = quakeData.features.filter(eq => {
        if (!lat || !lon) return true; // Koordinat yoksa hepsini döndür
        const distance = getDistance(lat, lon, eq.geometry.coordinates[1], eq.geometry.coordinates[0]);
        return distance < radius;
      });

      results.earthquakes = nearby.slice(0, 5).map(eq => ({
        magnitude: eq.properties.mag,
        place: eq.properties.place,
        time: new Date(eq.properties.time).toLocaleDateString('tr-TR'),
        depth: eq.geometry.coordinates[2],
        url: eq.properties.url,
        severity: eq.properties.mag >= 6.5 ? 'high' : eq.properties.mag >= 5.5 ? 'medium' : 'low',
      }));
    }

    // 2. GDACS Global Afet Uyarıları (RSS/JSON feed)
    const gdacsUrl = 'https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventtypes=TC,FL,EQ,VO&alertlevel=Orange,Red&fromdate=' + getDateDaysAgo(14);
    try {
      const gdacsRes = await fetch(gdacsUrl, { 
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      if (gdacsRes.ok) {
        const gdacsData = await gdacsRes.json();
        const events = gdacsData.features || [];
        
        events.forEach(ev => {
          const type = ev.properties?.eventtype;
          const alert = {
            title: ev.properties?.eventname || ev.properties?.name,
            severity: ev.properties?.alertlevel?.toLowerCase(),
            date: ev.properties?.fromdate,
            description: ev.properties?.description,
            country: ev.properties?.country,
          };

          if (type === 'VO') results.volcanic.push(alert);
          else if (type === 'TC') results.weather_alerts.push(alert);
          else if (type === 'TS') results.tsunamis.push(alert);
        });
      }
    } catch (gdacsErr) {
      // GDACS zaman aşımı — devam et
    }

    // Genel risk seviyesi hesapla
    const totalAlerts = results.earthquakes.length + results.volcanic.length + 
                        results.weather_alerts.length + results.tsunamis.length;
    const hasHighRisk = results.earthquakes.some(e => e.severity === 'high') || 
                        results.volcanic.length > 0;

    return res.status(200).json({
      ...results,
      summary: {
        total: totalAlerts,
        risk_level: hasHighRisk ? 'high' : totalAlerts > 0 ? 'medium' : 'low',
        last_checked: new Date().toISOString(),
      }
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

function getDateDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
