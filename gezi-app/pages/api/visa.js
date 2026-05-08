// pages/api/visa.js
// Vize bilgisi - Passport Index veritabanı (statik + güncel)

const VISA_DATA = {
  TR: { // Türk pasaportu
    ID: { type: 'voa', name: 'Vize on Arrival', duration: 30, fee: '500.000 IDR (~€30)', extendable: true, notes: 'Havalimanında veya e-VoA ile online alınabilir. 30 gün uzatılabilir.', link: 'https://molina.imigrasi.go.id' },
    TH: { type: 'free', name: 'Vizesiz', duration: 30, fee: null, notes: 'Pasaport 6 ay geçerli olmalı. Dönüş bileti gerekli.' },
    JP: { type: 'free', name: 'Vizesiz', duration: 90, fee: null, notes: '2023 sonrası Türk vatandaşları için vizesiz.' },
    GR: { type: 'schengen', name: 'Schengen Vize Gerekli', duration: 90, fee: '80€', notes: 'Konsolosluktan önceden alınmalı. Online başvuru mümkün.' },
    US: { type: 'visa', name: 'Vize Gerekli (B1/B2)', duration: 180, fee: '$185', notes: 'Randevu süresi uzun olabilir. Erken başvurun.' },
    GB: { type: 'visa', name: 'Standart Ziyaretçi Vizesi', duration: 180, fee: '£115', notes: 'Online başvuru yapılabilir.' },
    AU: { type: 'eta', name: 'ETA (Electronic Travel Authority)', duration: 90, fee: 'AUD 20', notes: 'Online başvuru — 24 saat içinde onay.' },
    AE: { type: 'voa', name: 'Vize on Arrival', duration: 30, fee: 'Ücretsiz', notes: 'Dubai havalimanında ücretsiz 30 gün.' },
    MA: { type: 'free', name: 'Vizesiz', duration: 90, fee: null, notes: 'Fas — doğrudan giriş.' },
    EG: { type: 'voa', name: 'Vize on Arrival', duration: 30, fee: '$25', notes: 'Havalimanında veya e-Visa.' },
    SG: { type: 'free', name: 'Vizesiz', duration: 30, fee: null, notes: 'Singapur — 30 gün vizesiz.' },
    PT: { type: 'schengen', name: 'Schengen Vize Gerekli', duration: 90, fee: '80€', notes: 'AB/Schengen ülkesi.' },
    ES: { type: 'schengen', name: 'Schengen Vize Gerekli', duration: 90, fee: '80€', notes: 'AB/Schengen ülkesi.' },
    IT: { type: 'schengen', name: 'Schengen Vize Gerekli', duration: 90, fee: '80€', notes: 'AB/Schengen ülkesi.' },
  },
  CH: { // İsviçre pasaportu
    ID: { type: 'voa', name: 'Vize on Arrival', duration: 30, fee: '500.000 IDR (~€30)', extendable: true, notes: 'Havalimanında veya e-VoA ile online alınabilir.' },
    TH: { type: 'free', name: 'Vizesiz', duration: 30, fee: null },
    JP: { type: 'free', name: 'Vizesiz', duration: 90, fee: null },
    US: { type: 'esta', name: 'ESTA (Online Pre-Auth)', duration: 90, fee: '$21', notes: 'Seyahatten en az 72 saat önce başvurun.' },
    AU: { type: 'eta', name: 'ETA', duration: 90, fee: 'AUD 20' },
  },
  DE: { // Alman pasaportu — AB vatandaşı
    ID: { type: 'voa', name: 'Vize on Arrival', duration: 30, fee: '500.000 IDR (~€30)' },
    TH: { type: 'free', name: 'Vizesiz', duration: 30, fee: null },
    US: { type: 'esta', name: 'ESTA', duration: 90, fee: '$21' },
    AU: { type: 'eta', name: 'ETA', duration: 90, fee: 'AUD 20' },
  },
};

// Ülke koordinatları (afet API için)
const COUNTRY_COORDS = {
  ID: { lat: -8.3405, lon: 115.0920, name: 'Bali, Endonezya' },
  TH: { lat: 13.7563, lon: 100.5018, name: 'Bangkok, Tayland' },
  JP: { lat: 35.6762, lon: 139.6503, name: 'Tokyo, Japonya' },
  GR: { lat: 37.9838, lon: 23.7275, name: 'Atina, Yunanistan' },
  US: { lat: 40.7128, lon: -74.0060, name: 'New York, ABD' },
  AE: { lat: 25.2048, lon: 55.2708, name: 'Dubai, BAE' },
  SG: { lat: 1.3521, lon: 103.8198, name: 'Singapur' },
  PT: { lat: 38.7169, lon: -9.1399, name: 'Lizbon, Portekiz' },
  ES: { lat: 40.4168, lon: -3.7038, name: 'Madrid, İspanya' },
  MA: { lat: 33.9716, lon: -6.8498, name: 'Rabat, Fas' },
  EG: { lat: 30.0444, lon: 31.2357, name: 'Kahire, Mısır' },
};

export default function handler(req, res) {
  const { passport = 'TR', destination } = req.query;

  if (!destination) {
    return res.status(400).json({ error: 'destination ülke kodu zorunludur (örn: ID, TH, JP)' });
  }

  const passportData = VISA_DATA[passport.toUpperCase()];
  if (!passportData) {
    return res.status(404).json({ error: `${passport} pasaportu için veri bulunamadı` });
  }

  const dest = destination.toUpperCase();
  const visaInfo = passportData[dest];

  if (!visaInfo) {
    return res.status(200).json({
      passport,
      destination: dest,
      found: false,
      message: 'Bu rota için vize bilgisi veritabanımızda yok. Lütfen ilgili konsolosluğun sitesini kontrol edin.',
    });
  }

  return res.status(200).json({
    passport,
    destination: dest,
    found: true,
    coords: COUNTRY_COORDS[dest] || null,
    ...visaInfo,
  });
}
