// pages/api/currency.js - Akıllı kur seçimi: kalkış+varış para birimi + USD + EUR

const COUNTRY_CURRENCY = {
  TR:'TRY', CH:'CHF', DE:'EUR', FR:'EUR', IT:'EUR', ES:'EUR', PT:'EUR', NL:'EUR', AT:'EUR',
  BE:'EUR', FI:'EUR', GR:'EUR', IE:'EUR', IS:'EUR', NO:'NOK', SE:'SEK', DK:'DKK',
  GB:'GBP', US:'USD', CA:'CAD', AU:'AUD', NZ:'NZD', JP:'JPY', CN:'CNY', KR:'KRW',
  TH:'THB', ID:'IDR', MY:'MYR', SG:'SGD', VN:'VND', PH:'PHP', IN:'INR', LK:'LKR',
  NP:'NPR', AE:'AED', QA:'QAR', SA:'SAR', JO:'JOD', IL:'ILS', EG:'EGP', MA:'MAD',
  TN:'TND', ZA:'ZAR', KE:'KES', ET:'ETB', MX:'MXN', BR:'BRL', AR:'ARS', CU:'CUP',
  CZ:'CZK', PL:'PLN', HU:'HUF', HR:'HRK', RO:'RON', GE:'GEL', AM:'AMD', AZ:'AZN',
  UZ:'UZS', MV:'MVR', FJ:'FJD',
};

const IATA_TO_COUNTRY = {
  IST:'TR',SAW:'TR',AYT:'TR',ESB:'TR',ADB:'TR',
  ZRH:'CH',GVA:'CH',BSL:'CH',
  FRA:'DE',MUC:'DE',BER:'DE',DUS:'DE',HAM:'DE',STR:'DE',
  CDG:'FR',ORY:'FR',NCE:'FR',LYS:'FR',MRS:'FR',BOD:'FR',TLS:'FR',NTE:'FR',
  MAD:'ES',BCN:'ES',AGP:'ES',PMI:'ES',TFS:'ES',LPA:'ES',IBZ:'ES',SVQ:'ES',
  FCO:'IT',MXP:'IT',VCE:'IT',NAP:'IT',CTA:'IT',PMO:'IT',BLQ:'IT',
  LHR:'GB',LGW:'GB',STN:'GB',MAN:'GB',EDI:'GB',BHX:'GB',GLA:'GB',
  ATH:'GR',HER:'GR',RHO:'GR',SKG:'GR',CFU:'GR',KGS:'GR',JMK:'GR',JTR:'GR',CHQ:'GR',
  LIS:'PT',OPO:'PT',FAO:'PT',FNC:'PT',
  AMS:'NL',RTM:'NL',EIN:'NL',
  VIE:'AT',GRZ:'AT',SZG:'AT',
  BRU:'BE',CRL:'BE',
  OSL:'NO',BGO:'NO',
  ARN:'SE',GOT:'SE',MMX:'SE',
  CPH:'DK',BLL:'DK',
  HEL:'FI',TMP:'FI',
  PRG:'CZ',WAW:'PL',KRK:'PL',BUD:'HU',ZAG:'HR',SPU:'HR',DBV:'HR',
  DPS:'ID',CGK:'ID',SUB:'ID',
  BKK:'TH',HKT:'TH',CNX:'TH',USM:'TH',
  NRT:'JP',KIX:'JP',CTS:'JP',FUK:'JP',OKA:'JP',
  SIN:'SG',
  SGN:'VN',HAN:'VN',DAD:'VN',
  KUL:'MY',PEN:'MY',LGK:'MY',
  DEL:'IN',BOM:'IN',MAA:'IN',BLR:'IN',GOI:'IN',
  MNL:'PH',CEB:'PH',
  PNH:'KH',REP:'KH',
  CMB:'LK',MLE:'MV',KTM:'NP',
  DXB:'AE',AUH:'AE',SHJ:'AE',
  DOH:'QA',AMM:'JO',AQJ:'JO',
  TBS:'GE',EVN:'AM',GYD:'AZ',TAS:'UZ',
  JFK:'US',LAX:'US',MIA:'US',ORD:'US',SFO:'US',LAS:'US',MCO:'US',BOS:'US',ATL:'US',
  YYZ:'CA',YVR:'CA',YUL:'CA',
  CUN:'MX',MEX:'MX',SJD:'MX',
  GRU:'BR',GIG:'BR',REC:'BR',
  EZE:'AR',AEP:'AR',
  HAV:'CU',
  RAK:'MA',CMN:'MA',AGA:'MA',TNG:'MA',
  CAI:'EG',HRG:'EG',SSH:'EG',LXR:'EG',
  TUN:'TN',CPT:'ZA',JNB:'ZA',NBO:'KE',MBA:'KE',ADD:'ET',
  SYD:'AU',MEL:'AU',BNE:'AU',PER:'AU',CNS:'AU',
  AKL:'NZ',CHC:'NZ',WLG:'NZ',NAN:'FJ',
};

export default async function handler(req, res) {
  const { base = 'EUR', originIATA, destIATA } = req.query;

  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/EUR`);
    if (!response.ok) throw new Error('Döviz API bağlantı hatası');
    const data = await response.json();

    // Kalkış ve varış para birimlerini belirle
    const originCountry = IATA_TO_COUNTRY[originIATA?.toUpperCase()] || 'TR';
    const destCountry = IATA_TO_COUNTRY[destIATA?.toUpperCase()] || 'ID';
    const originCurrency = COUNTRY_CURRENCY[originCountry] || 'TRY';
    const destCurrency = COUNTRY_CURRENCY[destCountry] || 'IDR';

    // Her zaman gösterilecekler: kalkış, varış, USD, EUR (tekrar etmeyenler)
    const needed = [...new Set([originCurrency, destCurrency, 'USD', 'EUR'])];

    const rates = {};
    needed.forEach(currency => {
      if (data.rates[currency]) {
        const rate = data.rates[currency];
        rates[currency] = {
          rate,
          formatted: formatRate(currency, rate),
          isOrigin: currency === originCurrency,
          isDest: currency === destCurrency,
        };
      }
    });

    return res.status(200).json({
      base: 'EUR',
      rates,
      originCurrency,
      destCurrency,
      last_updated: data.time_last_update_utc,
      next_update: data.time_next_update_utc,
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

function formatRate(currency, rate) {
  if (['IDR','VND','KRW','UZS','CLP'].includes(currency)) return Math.round(rate).toLocaleString('tr-TR');
  if (['JPY','THB','INR','NPR','EGP','MAD','TND','KES'].includes(currency)) return rate.toFixed(1);
  return rate.toFixed(4);
}
