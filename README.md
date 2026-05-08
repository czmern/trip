# WANDR — Akıllı Gezi Planlayıcısı

Canlı veri kaynakları: OpenWeatherMap, Amadeus, ExchangeRate-API, USGS/GDACS

## Kurulum

### 1. API Keyleri Al (ücretsiz)

| API | Kayıt | Kullanım |
|---|---|---|
| OpenWeatherMap | https://openweathermap.org/api | Hava durumu |
| Amadeus | https://developers.amadeus.com | Uçuş fiyatları |
| ExchangeRate | Gerekmez | Döviz kurları (otomatik) |
| GDACS/USGS | Gerekmez | Afet uyarıları (otomatik) |

### 2. .env.local Dosyası Oluştur

```
OPENWEATHER_API_KEY=xxx
AMADEUS_API_KEY=xxx
AMADEUS_API_SECRET=xxx
```

### 3. Vercel'de Environment Variables Ekle

Vercel Dashboard → Project → Settings → Environment Variables

### 4. Yerel Çalıştır (opsiyonel)

```bash
npm install
npm run dev
```

## API Endpointleri

- `GET /api/weather?city=Bali` — Hava durumu
- `GET /api/currency?base=EUR&targets=IDR,TRY` — Döviz kuru
- `GET /api/flights?origin=IST&destination=DPS&departureDate=2025-09-15` — Uçuşlar
- `GET /api/alerts?lat=-8.34&lon=115.09` — Afet uyarıları
- `GET /api/visa?passport=TR&destination=ID` — Vize bilgisi
