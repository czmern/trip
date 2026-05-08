// pages/api/countrydata.js
// Ülkelere göre priz, sağlık, koordinat bilgileri

const COUNTRY_DATA = {
  // ASYA
  ID: { name:'Endonezya', city:'Bali', lat:-8.3405, lon:115.0920, plugs:['C','F'], voltage:'220V', freq:'50Hz', trCompat:true, health:[{name:'Tifo',level:'required'},{name:'Hepatit A & B',level:'recommended'},{name:'Sıtma',level:'regional'},{name:'Dengue Humması',level:'warning'},{name:'Kuduz',level:'recommended'},{name:'COVID-19',level:'ok'}], volcano:true, tsunami:true, earthquake:true },
  TH: { name:'Tayland', city:'Bangkok', lat:13.7563, lon:100.5018, plugs:['A','B','C'], voltage:'220V', freq:'50Hz', trCompat:false, health:[{name:'Hepatit A & B',level:'recommended'},{name:'Tifo',level:'recommended'},{name:'Sıtma (kuzey bölgeler)',level:'regional'},{name:'Dengue',level:'warning'},{name:'COVID-19',level:'ok'}], volcano:false, tsunami:false, earthquake:false },
  JP: { name:'Japonya', city:'Tokyo', lat:35.6762, lon:139.6503, plugs:['A','B'], voltage:'100V', freq:'50/60Hz', trCompat:false, health:[{name:'Hepatit A',level:'recommended'},{name:'Japon Ensefaliti',level:'regional'},{name:'COVID-19',level:'ok'}], volcano:true, tsunami:true, earthquake:true },
  SG: { name:'Singapur', city:'Singapur', lat:1.3521, lon:103.8198, plugs:['G'], voltage:'230V', freq:'50Hz', trCompat:false, health:[{name:'Hepatit A',level:'recommended'},{name:'COVID-19',level:'ok'}], volcano:false, tsunami:false, earthquake:false },
  VN: { name:'Vietnam', city:'Ho Chi Minh', lat:10.8231, lon:106.6297, plugs:['A','C','F'], voltage:'220V', freq:'50Hz', trCompat:true, health:[{name:'Hepatit A & B',level:'recommended'},{name:'Tifo',level:'recommended'},{name:'Sıtma (kırsal)',level:'regional'},{name:'Dengue',level:'warning'}], volcano:false, tsunami:false, earthquake:false },
  IN: { name:'Hindistan', city:'New Delhi', lat:28.6139, lon:77.2090, plugs:['C','D','M'], voltage:'230V', freq:'50Hz', trCompat:true, health:[{name:'Tifo',level:'required'},{name:'Hepatit A & B',level:'recommended'},{name:'Sıtma',level:'regional'},{name:'Kolera',level:'regional'},{name:'Kuduz',level:'recommended'}], volcano:false, tsunami:false, earthquake:true },
  AE: { name:'BAE', city:'Dubai', lat:25.2048, lon:55.2708, plugs:['G'], voltage:'220V', freq:'50Hz', trCompat:false, health:[{name:'COVID-19',level:'ok'},{name:'Hepatit A',level:'recommended'}], volcano:false, tsunami:false, earthquake:false },
  TR_DEST: { name:'Türkiye', city:'İstanbul', lat:41.0082, lon:28.9784, plugs:['C','F'], voltage:'220V', freq:'50Hz', trCompat:true, health:[{name:'Hepatit A',level:'recommended'},{name:'COVID-19',level:'ok'}], volcano:false, tsunami:false, earthquake:true },

  // AVRUPA
  FR: { name:'Fransa', city:'Paris', lat:48.8566, lon:2.3522, plugs:['C','E'], voltage:'230V', freq:'50Hz', trCompat:true, health:[{name:'COVID-19',level:'ok'},{name:'Standart AB Aşıları',level:'recommended'}], volcano:false, tsunami:false, earthquake:false },
  ES: { name:'İspanya', city:'Madrid', lat:40.4168, lon:-3.7038, plugs:['C','F'], voltage:'230V', freq:'50Hz', trCompat:true, health:[{name:'COVID-19',level:'ok'}], volcano:false, tsunami:false, earthquake:false },
  IT: { name:'İtalya', city:'Roma', lat:41.9028, lon:12.4964, plugs:['C','F','L'], voltage:'230V', freq:'50Hz', trCompat:true, health:[{name:'COVID-19',level:'ok'}], volcano:true, tsunami:false, earthquake:true },
  DE: { name:'Almanya', city:'Berlin', lat:52.5200, lon:13.4050, plugs:['C','F'], voltage:'230V', freq:'50Hz', trCompat:true, health:[{name:'COVID-19',level:'ok'}], volcano:false, tsunami:false, earthquake:false },
  GB: { name:'İngiltere', city:'Londra', lat:51.5074, lon:-0.1278, plugs:['G'], voltage:'230V', freq:'50Hz', trCompat:false, health:[{name:'COVID-19',level:'ok'}], volcano:false, tsunami:false, earthquake:false },
  GR: { name:'Yunanistan', city:'Atina', lat:37.9838, lon:23.7275, plugs:['C','F'], voltage:'230V', freq:'50Hz', trCompat:true, health:[{name:'COVID-19',level:'ok'},{name:'Hepatit A',level:'recommended'}], volcano:true, tsunami:false, earthquake:true },
  PT: { name:'Portekiz', city:'Lizbon', lat:38.7169, lon:-9.1399, plugs:['C','F'], voltage:'230V', freq:'50Hz', trCompat:true, health:[{name:'COVID-19',level:'ok'}], volcano:false, tsunami:false, earthquake:true },
  NL: { name:'Hollanda', city:'Amsterdam', lat:52.3676, lon:4.9041, plugs:['C','F'], voltage:'230V', freq:'50Hz', trCompat:true, health:[{name:'COVID-19',level:'ok'}], volcano:false, tsunami:false, earthquake:false },
  CH: { name:'İsviçre', city:'Zürih', lat:47.3769, lon:8.5417, plugs:['J'], voltage:'230V', freq:'50Hz', trCompat:false, health:[{name:'COVID-19',level:'ok'}], volcano:false, tsunami:false, earthquake:false },

  // AMERİKA
  US: { name:'ABD', city:'New York', lat:40.7128, lon:-74.0060, plugs:['A','B'], voltage:'120V', freq:'60Hz', trCompat:false, health:[{name:'COVID-19',level:'ok'},{name:'Hepatit A',level:'recommended'}], volcano:false, tsunami:false, earthquake:true },
  MX: { name:'Meksika', city:'Mexico City', lat:19.4326, lon:-99.1332, plugs:['A','B'], voltage:'127V', freq:'60Hz', trCompat:false, health:[{name:'Hepatit A',level:'recommended'},{name:'Tifo',level:'recommended'},{name:'Montezuma İshali',level:'warning'}], volcano:true, tsunami:false, earthquake:true },
  BR: { name:'Brezilya', city:'São Paulo', lat:-23.5505, lon:-46.6333, plugs:['C','N'], voltage:'127/220V', freq:'60Hz', trCompat:true, health:[{name:'Sarı Humma',level:'required'},{name:'Sıtma (Amazon)',level:'regional'},{name:'Dengue',level:'warning'}], volcano:false, tsunami:false, earthquake:false },
  AR: { name:'Arjantin', city:'Buenos Aires', lat:-34.6037, lon:-58.3816, plugs:['C','I'], voltage:'220V', freq:'50Hz', trCompat:true, health:[{name:'Hepatit A',level:'recommended'},{name:'Tifo',level:'recommended'}], volcano:true, tsunami:false, earthquake:true },

  // AFRİKA
  MA: { name:'Fas', city:'Marakeş', lat:31.6295, lon:-7.9811, plugs:['C','E'], voltage:'220V', freq:'50Hz', trCompat:true, health:[{name:'Hepatit A',level:'recommended'},{name:'Tifo',level:'recommended'},{name:'COVID-19',level:'ok'}], volcano:false, tsunami:false, earthquake:true },
  EG: { name:'Mısır', city:'Kahire', lat:30.0444, lon:31.2357, plugs:['C','F'], voltage:'220V', freq:'50Hz', trCompat:true, health:[{name:'Hepatit A',level:'recommended'},{name:'Tifo',level:'recommended'},{name:'Kolera',level:'regional'}], volcano:false, tsunami:false, earthquake:false },
  ZA: { name:'Güney Afrika', city:'Cape Town', lat:-33.9249, lon:18.4241, plugs:['M','N','C'], voltage:'230V', freq:'50Hz', trCompat:false, health:[{name:'Sıtma (kuzey)',level:'regional'},{name:'Hepatit A & B',level:'recommended'},{name:'Sarı Humma',level:'regional'}], volcano:false, tsunami:false, earthquake:false },

  // OKYANUSYA
  AU: { name:'Avustralya', city:'Sydney', lat:-33.8688, lon:151.2093, plugs:['I'], voltage:'230V', freq:'50Hz', trCompat:false, health:[{name:'COVID-19',level:'ok'},{name:'Hepatit A',level:'recommended'}], volcano:false, tsunami:false, earthquake:false },
  NZ: { name:'Yeni Zelanda', city:'Auckland', lat:-36.8509, lon:174.7645, plugs:['I'], voltage:'230V', freq:'50Hz', trCompat:false, health:[{name:'COVID-19',level:'ok'}], volcano:true, tsunami:true, earthquake:true },
};

// IATA → Ülke kodu mapping
const IATA_TO_COUNTRY = {
  DPS:'ID', CGK:'ID', SUB:'ID',
  BKK:'TH', HKT:'TH', CNX:'TH',
  NRT:'JP', KIX:'JP', CTS:'JP',
  SIN:'SG',
  SGN:'VN', HAN:'VN', DAD:'VN',
  DEL:'IN', BOM:'IN', MAA:'IN',
  DXB:'AE', AUH:'AE',
  CDG:'FR', ORY:'FR', NCE:'FR', LYS:'FR', MRS:'FR',
  MAD:'ES', BCN:'ES', AGP:'ES', VLC:'ES', SVQ:'ES',
  FCO:'IT', MXP:'IT', VCE:'IT', NAP:'IT',
  FRA:'DE', MUC:'DE', TXL:'DE', BER:'DE', DUS:'DE',
  LHR:'GB', LGW:'GB', MAN:'GB', EDI:'GB',
  ATH:'GR', SKG:'GR', HER:'GR', RHO:'GR',
  LIS:'PT', OPO:'PT', FAO:'PT',
  AMS:'NL', RTM:'NL',
  ZRH:'CH', GVA:'CH', BSL:'CH',
  JFK:'US', LAX:'US', ORD:'US', MIA:'US', SFO:'US', LAS:'US',
  MEX:'MX', CUN:'MX', GDL:'MX',
  GRU:'BR', GIG:'BR', SSA:'BR',
  EZE:'AR', AEP:'AR',
  RAK:'MA', CMN:'MA', AGA:'MA',
  CAI:'EG', HRG:'EG', SSH:'EG',
  CPT:'ZA', JNB:'ZA',
  SYD:'AU', MEL:'AU', BNE:'AU', PER:'AU',
  AKL:'NZ', CHC:'NZ',
  IST:'TR_DEST', SAW:'TR_DEST', AYT:'TR_DEST',
};

export function getCountryFromIATA(iata) {
  const countryCode = IATA_TO_COUNTRY[iata?.toUpperCase()];
  return countryCode ? COUNTRY_DATA[countryCode] : null;
}

export default function handler(req, res) {
  const { iata } = req.query;
  const data = getCountryFromIATA(iata);
  if (!data) return res.status(404).json({ error: `${iata} için ülke verisi bulunamadı` });
  return res.status(200).json(data);
}
