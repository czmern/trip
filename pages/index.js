import { useState, useEffect } from 'react';
import Head from 'next/head';

function fmtDate(s){if(!s)return'';return new Date(s).toLocaleDateString('tr-TR',{weekday:'short',day:'numeric',month:'short'});}
function fmtTime(s){if(!s)return'';return new Date(s).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});}
function parseDur(iso){if(!iso)return'';const m=iso.match(/PT(\d+H)?(\d+M)?/);return`${m?.[1]?parseInt(m[1])+'sa':''}${m?.[2]?' '+parseInt(m[2])+'dk':''}`.trim();}

const ALL_AIRPORTS=[
  // TÜRKİYE
  {code:'IST',name:'İstanbul Atatürk',country:'🇹🇷 Türkiye'},
  {code:'SAW',name:'İstanbul Sabiha Gökçen',country:'🇹🇷 Türkiye'},
  {code:'AYT',name:'Antalya',country:'🇹🇷 Türkiye'},
  {code:'ESB',name:'Ankara Esenboğa',country:'🇹🇷 Türkiye'},
  {code:'ADB',name:'İzmir Adnan Menderes',country:'🇹🇷 Türkiye'},
  {code:'ADA',name:'Adana',country:'🇹🇷 Türkiye'},
  {code:'TZX',name:'Trabzon',country:'🇹🇷 Türkiye'},
  // İSVİÇRE / ALMANYA / AVUSTURYA
  {code:'ZRH',name:'Zürih',country:'🇨🇭 İsviçre'},
  {code:'GVA',name:'Cenevre',country:'🇨🇭 İsviçre'},
  {code:'BSL',name:'Basel-Mülhausen',country:'🇨🇭 İsviçre'},
  {code:'FRA',name:'Frankfurt',country:'🇩🇪 Almanya'},
  {code:'MUC',name:'Münih',country:'🇩🇪 Almanya'},
  {code:'BER',name:'Berlin Brandenburg',country:'🇩🇪 Almanya'},
  {code:'DUS',name:'Düsseldorf',country:'🇩🇪 Almanya'},
  {code:'HAM',name:'Hamburg',country:'🇩🇪 Almanya'},
  {code:'STR',name:'Stuttgart',country:'🇩🇪 Almanya'},
  {code:'VIE',name:'Viyana',country:'🇦🇹 Avusturya'},
  // ASYA
  {code:'DPS',name:'Bali Ngurah Rai',country:'🇮🇩 Endonezya'},
  {code:'CGK',name:'Jakarta Soekarno-Hatta',country:'🇮🇩 Endonezya'},
  {code:'SUB',name:'Surabaya',country:'🇮🇩 Endonezya'},
  {code:'BKK',name:'Bangkok Suvarnabhumi',country:'🇹🇭 Tayland'},
  {code:'HKT',name:'Phuket',country:'🇹🇭 Tayland'},
  {code:'CNX',name:'Chiang Mai',country:'🇹🇭 Tayland'},
  {code:'USM',name:'Koh Samui',country:'🇹🇭 Tayland'},
  {code:'NRT',name:'Tokyo Narita',country:'🇯🇵 Japonya'},
  {code:'KIX',name:'Osaka Kansai',country:'🇯🇵 Japonya'},
  {code:'CTS',name:'Sapporo',country:'🇯🇵 Japonya'},
  {code:'FUK',name:'Fukuoka',country:'🇯🇵 Japonya'},
  {code:'OKA',name:'Okinawa',country:'🇯🇵 Japonya'},
  {code:'SIN',name:'Singapur Changi',country:'🇸🇬 Singapur'},
  {code:'HAN',name:'Hanoi Noi Bai',country:'🇻🇳 Vietnam'},
  {code:'SGN',name:'Ho Chi Minh Tân Sơn Nhất',country:'🇻🇳 Vietnam'},
  {code:'DAD',name:'Da Nang',country:'🇻🇳 Vietnam'},
  {code:'KUL',name:'Kuala Lumpur KLIA',country:'🇲🇾 Malezya'},
  {code:'PEN',name:'Penang',country:'🇲🇾 Malezya'},
  {code:'LGK',name:'Langkawi',country:'🇲🇾 Malezya'},
  {code:'DEL',name:'New Delhi IGI',country:'🇮🇳 Hindistan'},
  {code:'BOM',name:'Mumbai Chhatrapati',country:'🇮🇳 Hindistan'},
  {code:'GOI',name:'Goa',country:'🇮🇳 Hindistan'},
  {code:'MAA',name:'Chennai',country:'🇮🇳 Hindistan'},
  {code:'MNL',name:'Manila Ninoy Aquino',country:'🇵🇭 Filipinler'},
  {code:'CEB',name:'Cebu',country:'🇵🇭 Filipinler'},
  {code:'PNH',name:'Phnom Penh',country:'🇰🇭 Kamboçya'},
  {code:'REP',name:'Siem Reap (Angkor)',country:'🇰🇭 Kamboçya'},
  {code:'CMB',name:'Colombo',country:'🇱🇰 Sri Lanka'},
  {code:'MLE',name:'Malé',country:'🇲🇻 Maldivler'},
  {code:'KTM',name:'Katmandu',country:'🇳🇵 Nepal'},
  {code:'DXB',name:'Dubai',country:'🇦🇪 BAE'},
  {code:'AUH',name:'Abu Dhabi',country:'🇦🇪 BAE'},
  {code:'DOH',name:'Doha Hamad',country:'🇶🇦 Katar'},
  {code:'AMM',name:'Amman Queen Alia',country:'🇯🇴 Ürdün'},
  {code:'AQJ',name:'Akabe (Aqaba)',country:'🇯🇴 Ürdün'},
  {code:'TBS',name:'Tiflis',country:'🇬🇪 Gürcistan'},
  {code:'EVN',name:'Erivan',country:'🇦🇲 Ermenistan'},
  {code:'GYD',name:'Bakü Haydar Aliyev',country:'🇦🇿 Azerbaycan'},
  {code:'TAS',name:'Taşkent',country:'🇺🇿 Özbekistan'},
  // AVRUPA
  {code:'CDG',name:'Paris Charles de Gaulle',country:'🇫🇷 Fransa'},
  {code:'ORY',name:'Paris Orly',country:'🇫🇷 Fransa'},
  {code:'NCE',name:'Nice Cote d Azur',country:'🇫🇷 Fransa'},
  {code:'LYS',name:'Lyon Saint-Exupery',country:'🇫🇷 Fransa'},
  {code:'MRS',name:'Marsilya',country:'🇫🇷 Fransa'},
  {code:'MAD',name:'Madrid Barajas',country:'🇪🇸 İspanya'},
  {code:'BCN',name:'Barselona El Prat',country:'🇪🇸 İspanya'},
  {code:'AGP',name:'Malaga Costa del Sol',country:'🇪🇸 İspanya'},
  {code:'PMI',name:'Palma de Mallorca',country:'🇪🇸 İspanya'},
  {code:'TFS',name:'Tenerife Güney',country:'🇪🇸 İspanya'},
  {code:'LPA',name:'Gran Canaria',country:'🇪🇸 İspanya'},
  {code:'IBZ',name:'Ibiza',country:'🇪🇸 İspanya'},
  {code:'SVQ',name:'Sevilla',country:'🇪🇸 İspanya'},
  {code:'FCO',name:'Roma Fiumicino',country:'🇮🇹 İtalya'},
  {code:'MXP',name:'Milano Malpensa',country:'🇮🇹 İtalya'},
  {code:'VCE',name:'Venedik Marco Polo',country:'🇮🇹 İtalya'},
  {code:'NAP',name:'Napoli',country:'🇮🇹 İtalya'},
  {code:'CTA',name:'Catania (Sicilya)',country:'🇮🇹 İtalya'},
  {code:'PMO',name:'Palermo',country:'🇮🇹 İtalya'},
  {code:'BLQ',name:'Bologna',country:'🇮🇹 İtalya'},
  {code:'LHR',name:'Londra Heathrow',country:'🇬🇧 İngiltere'},
  {code:'LGW',name:'Londra Gatwick',country:'🇬🇧 İngiltere'},
  {code:'STN',name:'Londra Stansted',country:'🇬🇧 İngiltere'},
  {code:'MAN',name:'Manchester',country:'🇬🇧 İngiltere'},
  {code:'EDI',name:'Edinburgh',country:'🇬🇧 İngiltere'},
  {code:'ATH',name:'Atina Eleftherios Venizelos',country:'🇬🇷 Yunanistan'},
  {code:'HER',name:'Girit Iraklio',country:'🇬🇷 Yunanistan'},
  {code:'RHO',name:'Rodos',country:'🇬🇷 Yunanistan'},
  {code:'SKG',name:'Selanik',country:'🇬🇷 Yunanistan'},
  {code:'CFU',name:'Korfu',country:'🇬🇷 Yunanistan'},
  {code:'KGS',name:'Kos',country:'🇬🇷 Yunanistan'},
  {code:'JMK',name:'Mykonos',country:'🇬🇷 Yunanistan'},
  {code:'JTR',name:'Santorini',country:'🇬🇷 Yunanistan'},
  {code:'CHQ',name:'Hanya (Girit)',country:'🇬🇷 Yunanistan'},
  {code:'LIS',name:'Lizbon Humberto Delgado',country:'🇵🇹 Portekiz'},
  {code:'OPO',name:'Porto',country:'🇵🇹 Portekiz'},
  {code:'FAO',name:'Faro (Algarve)',country:'🇵🇹 Portekiz'},
  {code:'FNC',name:'Funchal (Madeira)',country:'🇵🇹 Portekiz'},
  {code:'AMS',name:'Amsterdam Schiphol',country:'🇳🇱 Hollanda'},
  {code:'BRU',name:'Brüksel Zaventem',country:'🇧🇪 Belçika'},
  {code:'OSL',name:'Oslo Gardermoen',country:'🇳🇴 Norveç'},
  {code:'ARN',name:'Stockholm Arlanda',country:'🇸🇪 İsveç'},
  {code:'GOT',name:'Göteborg',country:'🇸🇪 İsveç'},
  {code:'CPH',name:'Kopenhag',country:'🇩🇰 Danimarka'},
  {code:'HEL',name:'Helsinki Vantaa',country:'🇫🇮 Finlandiya'},
  {code:'PRG',name:'Prag Václav Havel',country:'🇨🇿 Çek Cumh.'},
  {code:'WAW',name:'Varşova Chopin',country:'🇵🇱 Polonya'},
  {code:'KRK',name:'Kraków',country:'🇵🇱 Polonya'},
  {code:'BUD',name:'Budapeşte Ferenc Liszt',country:'🇭🇺 Macaristan'},
  {code:'ZAG',name:'Zagreb',country:'🇭🇷 Hırvatistan'},
  {code:'SPU',name:'Split',country:'🇭🇷 Hırvatistan'},
  {code:'DBV',name:'Dubrovnik',country:'🇭🇷 Hırvatistan'},
  // AMERİKA
  {code:'JFK',name:'New York JFK',country:'🇺🇸 ABD'},
  {code:'LAX',name:'Los Angeles',country:'🇺🇸 ABD'},
  {code:'MIA',name:'Miami',country:'🇺🇸 ABD'},
  {code:'ORD',name:'Chicago OHare',country:'🇺🇸 ABD'},
  {code:'SFO',name:'San Francisco',country:'🇺🇸 ABD'},
  {code:'LAS',name:'Las Vegas McCarran',country:'🇺🇸 ABD'},
  {code:'MCO',name:'Orlando',country:'🇺🇸 ABD'},
  {code:'BOS',name:'Boston Logan',country:'🇺🇸 ABD'},
  {code:'YYZ',name:'Toronto Pearson',country:'🇨🇦 Kanada'},
  {code:'YVR',name:'Vancouver',country:'🇨🇦 Kanada'},
  {code:'YUL',name:'Montreal',country:'🇨🇦 Kanada'},
  {code:'CUN',name:'Cancun',country:'🇲🇽 Meksika'},
  {code:'MEX',name:'Mexico City',country:'🇲🇽 Meksika'},
  {code:'SJD',name:'Los Cabos',country:'🇲🇽 Meksika'},
  {code:'GRU',name:'São Paulo Guarulhos',country:'🇧🇷 Brezilya'},
  {code:'GIG',name:'Rio de Janeiro Galeão',country:'🇧🇷 Brezilya'},
  {code:'REC',name:'Recife',country:'🇧🇷 Brezilya'},
  {code:'EZE',name:'Buenos Aires Ezeiza',country:'🇦🇷 Arjantin'},
  {code:'HAV',name:'Havana José Martí',country:'🇨🇺 Küba'},
  // AFRİKA
  {code:'RAK',name:'Marakeş Menara',country:'🇲🇦 Fas'},
  {code:'CMN',name:'Kazablanka Mohammed V',country:'🇲🇦 Fas'},
  {code:'AGA',name:'Agadir',country:'🇲🇦 Fas'},
  {code:'TNG',name:'Tanca',country:'🇲🇦 Fas'},
  {code:'CAI',name:'Kahire',country:'🇪🇬 Mısır'},
  {code:'HRG',name:'Hurghada',country:'🇪🇬 Mısır'},
  {code:'SSH',name:'Şarm el-Şeyh',country:'🇪🇬 Mısır'},
  {code:'LXR',name:'Luxor',country:'🇪🇬 Mısır'},
  {code:'TUN',name:'Tunus Carthage',country:'🇹🇳 Tunus'},
  {code:'CPT',name:'Cape Town',country:'🇿🇦 Güney Afrika'},
  {code:'JNB',name:'Johannesburg OR Tambo',country:'🇿🇦 Güney Afrika'},
  {code:'NBO',name:'Nairobi Jomo Kenyatta',country:'🇰🇪 Kenya'},
  {code:'MBA',name:'Mombasa',country:'🇰🇪 Kenya'},
  {code:'ADD',name:'Addis Ababa Bole',country:'🇪🇹 Etiyopya'},
  // OKYANUSYA
  {code:'SYD',name:'Sydney Kingsford Smith',country:'🇦🇺 Avustralya'},
  {code:'MEL',name:'Melbourne Tullamarine',country:'🇦🇺 Avustralya'},
  {code:'BNE',name:'Brisbane',country:'🇦🇺 Avustralya'},
  {code:'PER',name:'Perth',country:'🇦🇺 Avustralya'},
  {code:'CNS',name:'Cairns',country:'🇦🇺 Avustralya'},
  {code:'AKL',name:'Auckland',country:'🇳🇿 Yeni Zelanda'},
  {code:'CHC',name:'Christchurch',country:'🇳🇿 Yeni Zelanda'},
  {code:'ZQN',name:'Queenstown',country:'🇳🇿 Yeni Zelanda'},
  {code:'NAN',name:'Nadi (Fiji)',country:'🇫🇯 Fiji'},
];

const PLUG_INFO={A:{name:'Tip A',desc:'2 düz pim (Amerikan)',trCompat:false},B:{name:'Tip B',desc:'2 düz + 1 yuvarlak',trCompat:false},C:{name:'Tip C',desc:'Europlug (2 yuvarlak pim)',trCompat:true},D:{name:'Tip D',desc:'Hindistan (3 yuvarlak)',trCompat:false},E:{name:'Tip E',desc:'Fransız topraklı',trCompat:true},F:{name:'Tip F',desc:'Schuko (topraklı)',trCompat:true},G:{name:'Tip G',desc:'İngiliz (3 dikdörtgen)',trCompat:false},I:{name:'Tip I',desc:'Avustralya/Çin',trCompat:false},J:{name:'Tip J',desc:'İsviçre (3 yuvarlak)',trCompat:false},K:{name:'Tip K',desc:'Danimarka (2+toprak)',trCompat:false},L:{name:'Tip L',desc:'İtalya (3 sıralı)',trCompat:false},M:{name:'Tip M',desc:'G.Afrika (3 büyük)',trCompat:false},N:{name:'Tip N',desc:'Brezilya IEC',trCompat:false}};
const HL={required:'Zorunlu',recommended:'Önerilen',regional:'Bölgesel Risk',warning:'⚠️ Uyarı',ok:'Gereksinim Yok'};
const HD={required:'dot-r',recommended:'dot-y',regional:'dot-y',warning:'dot-r',ok:'dot-g'};
const HS={required:'stat-req',recommended:'stat-rec',regional:'stat-rec',warning:'stat-req',ok:'stat-ok'};
const STEPS=['✈️ Uçuşlar taranıyor...','⛈️ Hava durumu alınıyor...','🌋 Afet riski kontrol ediliyor...','💱 Döviz kurları güncelleniyor...','🛂 Vize & sağlık bilgileri hazırlanıyor...'];

function AirportSearch({label, value, onChange, placeholder}){
  const [q,setQ]=useState('');
  const [open,setOpen]=useState(false);
  const filtered=q.length>=1?ALL_AIRPORTS.filter(a=>a.code.toLowerCase().includes(q.toLowerCase())||a.name.toLowerCase().includes(q.toLowerCase())||a.country.toLowerCase().includes(q.toLowerCase())).slice(0,10):ALL_AIRPORTS.slice(0,10);
  return(
    <div className="sf">
      <label>{label}</label>
      <input value={value?`${value.code} — ${value.name} ${value.country}`:q} onChange={e=>{setQ(e.target.value);onChange(null);setOpen(true);}} onFocus={()=>setOpen(true)} onBlur={()=>setTimeout(()=>setOpen(false),200)} placeholder={placeholder}/>
      {open&&filtered.length>0&&(<div className="dd">{filtered.map(a=>(<div key={a.code} className="dd-item" onMouseDown={()=>{onChange(a);setQ('');setOpen(false);}}><span className="dd-code">{a.code}</span><span className="dd-name">{a.name}</span><div className="dd-cnt">{a.country}</div></div>))}</div>)}
    </div>
  );
}

export default function Home(){
  const [origin,setOrigin]=useState(null);
  const [dest,setDest]=useState(null);
  const [form,setForm]=useState({passport:'TR',depart:'',returnDate:'',adults:1,hasPet:false});
  const [mode,setMode]=useState('manual');
  const [aiQ,setAiQ]=useState('');
  const [loading,setLoading]=useState(false);
  const [step,setStep]=useState(0);
  const [res,setRes]=useState(null);
  const [rental,setRental]=useState('car');

  useEffect(()=>{const d=new Date();d.setDate(d.getDate()+30);const dep=d.toISOString().split('T')[0];d.setDate(d.getDate()+10);setForm(f=>({...f,depart:dep,returnDate:d.toISOString().split('T')[0]}));
    setOrigin(ALL_AIRPORTS.find(a=>a.code==='IST'));
  },[]);

  async function go(){
    if(!dest&&mode==='manual'){alert('Lütfen varış noktası seçin');return;}
    setLoading(true);setStep(0);setRes(null);
    try{
      const d=dest?.code||'DPS';
      setStep(1);
      const [wR,cR,coR]=await Promise.allSettled([
        fetch(`/api/weather?city=${dest?.name.split(' ')[0]||d}&days=7`).then(r=>r.json()),
        fetch(`/api/currency?base=EUR&originIATA=${origin?.code||'IST'}&destIATA=${d}`).then(r=>r.json()),
        fetch(`/api/countrydata?iata=${d}`).then(r=>r.json()),
      ]);
      setStep(2);
      const country=coR.value;
      let alerts=null;
      if(country?.lat){alerts=await fetch(`/api/alerts?lat=${country.lat}&lon=${country.lon}`).then(r=>r.json()).catch(()=>null);}
      setStep(3);
      const [fR,vR]=await Promise.allSettled([
        fetch(`/api/flights?origin=${origin?.code||'IST'}&destination=${d}&departureDate=${form.depart}&returnDate=${form.returnDate}&adults=${form.adults}&currencyCode=EUR`).then(r=>r.json()),
        fetch(`/api/visa?passport=${form.passport}&destination=${d}`).then(r=>r.json()),
      ]);
      setStep(4);await new Promise(r=>setTimeout(r,300));
      setRes({weather:wR.value||null,currency:cR.value||null,country,alerts,flights:fR.value||null,visa:vR.value||null,dest,origin,form:{...form}});
    }catch(e){console.error(e);}finally{setLoading(false);}
  }

  return(<>
    <Head><title>WANDR — Akıllı Gezi Planlayıcı</title><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,400&family=DM+Sans:wght@300;400;500;600&family=Space+Mono&display=swap" rel="stylesheet"/></Head>
    <style>{`
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      :root{--ink:#0D1117;--paper:#F7F4EE;--gold:#C9A84C;--gold-l:#F0D98A;--teal:#2A7F7F;--teal-l:#3AAFA9;--mist:#E8E4DB;--smoke:#B8B2A7;--danger:#DC3545;--warn:#FF8C00;--ok:#2D8653}
      body{font-family:'DM Sans',sans-serif;background:var(--paper);color:var(--ink)}
      button{cursor:pointer;font-family:'DM Sans',sans-serif}
      .nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:16px 40px;background:rgba(13,17,23,.93);backdrop-filter:blur(12px);border-bottom:1px solid rgba(201,168,76,.2)}
      .logo{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:300;color:var(--gold);letter-spacing:5px}
      .logo em{font-style:italic;color:#fff}
      .nav-links{display:flex;gap:28px}
      .nav-links a{color:var(--smoke);font-size:12px;letter-spacing:1px;text-transform:uppercase;text-decoration:none}
      .nav-btn{background:var(--gold);color:var(--ink);padding:9px 20px;border:none;border-radius:2px;font-size:12px;font-weight:600}
      .hero{min-height:100vh;background:var(--ink);display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:100px 40px 60px}
      .hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 30% 50%,rgba(42,127,127,.15),transparent 60%),radial-gradient(ellipse at 70% 20%,rgba(201,168,76,.1),transparent 50%)}
      .hero-grid{position:absolute;inset:0;opacity:.04;background-image:linear-gradient(var(--smoke) 1px,transparent 1px),linear-gradient(90deg,var(--smoke) 1px,transparent 1px);background-size:40px 40px}
      .hi{position:relative;text-align:center;width:100%}
      .ey{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:3px;color:var(--teal-l);text-transform:uppercase;margin-bottom:18px}
      .ht{font-family:'Cormorant Garamond',serif;font-size:clamp(48px,7vw,88px);font-weight:300;color:#fff;line-height:1;margin-bottom:14px}
      .ht em{font-style:italic;color:var(--gold)}
      .hs{color:var(--smoke);font-size:15px;font-weight:300;max-width:520px;margin:0 auto 40px;line-height:1.7}
      .mw{display:flex;justify-content:center;margin-bottom:28px}
      .mt{display:flex;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:4px;overflow:hidden}
      .mb{padding:11px 26px;background:none;border:none;color:var(--smoke);font-size:13px;font-weight:500;transition:all .2s}
      .mb.active{background:var(--gold);color:var(--ink)}
      .sb{width:100%;max-width:860px;margin:0 auto;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);border-radius:6px;padding:26px 30px}
      .sr2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
      .sr3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-top:14px}
      .sf{display:flex;flex-direction:column;gap:5px;position:relative}
      .sf label{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--smoke)}
      .sf input,.sf select{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);color:#fff;padding:11px 14px;border-radius:4px;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s;width:100%}
      .sf input:focus,.sf select:focus{border-color:var(--gold)}
      .sf select option{background:var(--ink)}
      .opts{display:flex;gap:18px;margin-top:14px;flex-wrap:wrap;align-items:center}
      .ck{display:flex;align-items:center;gap:7px;color:var(--smoke);font-size:13px}
      .ck input{accent-color:var(--gold);width:14px;height:14px}
      .go{background:var(--gold);color:var(--ink);border:none;padding:12px 28px;border-radius:4px;font-weight:600;font-size:14px;white-space:nowrap;transition:all .2s;margin-left:auto}
      .go:hover{background:var(--gold-l)}
      .go:disabled{opacity:.6}
      .dd{position:absolute;top:100%;left:0;right:0;z-index:50;background:#1a2030;border:1px solid rgba(255,255,255,.15);border-radius:4px;max-height:280px;overflow-y:auto;margin-top:4px;box-shadow:0 8px 32px rgba(0,0,0,.4)}
      .dd-item{padding:10px 14px;cursor:pointer;transition:background .15s;border-bottom:1px solid rgba(255,255,255,.05)}
      .dd-item:hover{background:rgba(201,168,76,.15)}
      .dd-item:last-child{border:none}
      .dd-code{font-family:'Space Mono',monospace;font-size:12px;color:var(--gold);margin-right:8px}
      .dd-name{font-size:13px;color:#fff}
      .dd-cnt{font-size:11px;color:var(--smoke);margin-top:2px}
      .ai-wrap{display:flex;gap:10px}
      .ai-ta{flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);color:#fff;padding:13px 16px;border-radius:4px;font-size:14px;font-family:'DM Sans',sans-serif;resize:none;height:52px;outline:none}
      .chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
      .chip{background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.3);color:var(--gold-l);padding:5px 13px;border-radius:20px;font-size:12px;cursor:pointer}
      .lov{position:fixed;inset:0;background:rgba(13,17,23,.96);z-index:200;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px}
      .lt{font-family:'Cormorant Garamond',serif;font-size:30px;color:#fff}
      .ls{color:var(--smoke);font-size:13px}
      .lb2{width:280px;height:2px;background:rgba(255,255,255,.1);border-radius:2px;overflow:hidden}
      .lf{height:100%;background:var(--gold);border-radius:2px;transition:width .5s ease}
      .lsteps{display:flex;flex-direction:column;gap:8px;margin-top:10px}
      .lstep{color:var(--smoke);font-size:12px;opacity:.4;transition:opacity .3s}
      .lstep.active{opacity:1;color:var(--teal-l)}
      .results{max-width:1080px;margin:0 auto;padding:50px 32px}
      .dh{text-align:center;padding:30px 0;border-bottom:1px solid var(--mist);margin-bottom:36px}
      .dh-ey{font-size:11px;letter-spacing:3px;color:var(--smoke);text-transform:uppercase;margin-bottom:6px}
      .dh-t{font-family:'Cormorant Garamond',serif;font-size:44px;font-weight:300}
      .dh-t em{font-style:italic;color:var(--teal)}
      .dh-m{font-size:13px;color:var(--smoke);margin-top:4px}
      .ad{background:linear-gradient(135deg,#1a0a0a,#2d1010);border:1px solid rgba(220,53,69,.4);border-left:4px solid var(--danger);border-radius:6px;padding:18px 22px;margin-bottom:20px;display:flex;align-items:flex-start;gap:14px}
      .aw{background:linear-gradient(135deg,#1a1200,#2d2000);border:1px solid rgba(255,140,0,.4);border-left:4px solid var(--warn);border-radius:6px;padding:16px 22px;margin-bottom:16px;display:flex;align-items:flex-start;gap:12px}
      .ao{background:rgba(45,134,83,.08);border:1px solid rgba(45,134,83,.3);border-radius:6px;padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;gap:12px;font-size:13px;color:var(--ok)}
      .ai2{background:rgba(42,127,127,.08);border:1px solid rgba(42,127,127,.3);border-radius:6px;padding:12px 16px;margin-bottom:14px;font-size:12px;color:var(--teal-l)}
      .aico{font-size:26px;flex-shrink:0}
      .at{font-size:14px;font-weight:600;margin-bottom:4px}
      .ad .at{color:#ff6b6b}.aw .at{color:#ffa040}
      .ab{font-size:12px;line-height:1.6}
      .ad .ab{color:#cc9999}.aw .ab{color:#cc9966}
      .sec{margin-bottom:44px}
      .sec-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;padding-bottom:10px;border-bottom:1px solid var(--mist)}
      .sec-t{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:400;display:flex;align-items:center;gap:10px}
      .bdg{background:var(--teal);color:#fff;font-size:9px;padding:3px 7px;border-radius:2px;font-family:'Space Mono',monospace;letter-spacing:1px}
      .wall{color:var(--teal);font-size:12px;font-weight:500}
      .ws{display:flex;gap:10px;overflow-x:auto;padding-bottom:6px}
      .wc{background:#fff;border:1px solid var(--mist);border-radius:8px;padding:14px 18px;min-width:95px;text-align:center;flex-shrink:0}
      .wc.today{background:var(--ink);border-color:var(--ink);color:#fff}
      .wc.storm{border-color:var(--danger)!important}
      .wd{font-size:10px;color:var(--smoke);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px}
      .wc.today .wd{color:var(--gold)}
      .wi{font-size:26px;margin-bottom:4px}
      .wt{font-size:18px;font-weight:600}
      .wdsc{font-size:10px;color:var(--smoke);margin-top:3px}
      .wc.today .wdsc{color:#aaa}
      .fc{background:#fff;border:1px solid var(--mist);border-radius:8px;padding:18px 22px;margin-bottom:10px;display:grid;grid-template-columns:auto 1fr auto auto;gap:20px;align-items:center;transition:box-shadow .2s}
      .fc:hover{box-shadow:0 4px 20px rgba(0,0,0,.08)}
      .fc.best{border-color:var(--gold);background:linear-gradient(to right,#fffdf5,#fff)}
      .fal{font-weight:600;font-size:13px;min-width:110px}
      .fco{font-size:11px;color:var(--smoke)}
      .fr{display:flex;align-items:center;gap:14px}
      .fcy{font-weight:600;font-size:17px}
      .ftm{font-size:12px;color:var(--smoke)}
      .fa{display:flex;flex-direction:column;align-items:center;gap:3px}
      .fl{width:70px;height:1px;background:var(--mist);position:relative}
      .fl::after{content:'▶';position:absolute;right:-6px;top:-6px;font-size:9px;color:var(--smoke)}
      .fdr{font-size:10px;color:var(--smoke)}
      .fst{font-size:11px;color:var(--teal);margin-bottom:3px}
      .fp{font-size:24px;font-weight:700}
      .bst{background:var(--gold);color:var(--ink);font-size:9px;font-weight:700;padding:2px 7px;border-radius:3px;font-family:'Space Mono',monospace}
      .bkb{background:var(--teal);color:#fff;border:none;padding:9px 18px;border-radius:4px;font-size:12px;font-weight:600}
      .femp{background:#fff;border:1px solid var(--mist);border-radius:8px;padding:32px;text-align:center;color:var(--smoke);font-size:14px}
      .cs{background:#fff;border:1px solid var(--mist);border-radius:10px;padding:22px}
      .ch{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
      .lbg{background:rgba(45,134,83,.1);color:var(--ok);padding:4px 10px;border-radius:20px;font-size:11px;display:flex;align-items:center;gap:5px}
      .ldot{width:6px;height:6px;background:var(--ok);border-radius:50%;animation:pulse 1.5s infinite}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
      .cg{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
      .cc{padding:14px;border:1px solid var(--mist);border-radius:8px}
      .cc-dest{border-color:var(--teal)!important;background:rgba(42,127,127,.05)!important}
      .cc-origin{border-color:var(--gold)!important;background:rgba(201,168,76,.05)!important}
      .cc-dest{border-color:var(--teal)!important;background:rgba(42,127,127,.04)!important}
      .cc-origin{border-color:var(--gold)!important;background:rgba(201,168,76,.04)!important}
      .cp{font-size:11px;color:var(--smoke);margin-bottom:3px}
      .cr{font-size:20px;font-weight:700;margin-bottom:3px}
      .ct{background:var(--mist);border-radius:6px;padding:12px 16px;margin-top:14px;font-size:12px;color:var(--smoke)}
      .tc{display:grid;grid-template-columns:1fr 1fr;gap:22px}
      .ic{background:#fff;border:1px solid var(--mist);border-radius:10px;padding:22px}
      .ic h4{font-size:14px;font-weight:600;margin-bottom:14px}
      .vb{display:inline-block;padding:8px 14px;border-radius:6px;font-size:13px;margin-bottom:12px}
      .vf{background:rgba(45,134,83,.1);border:1px solid rgba(45,134,83,.3);color:var(--ok)}
      .vv{background:rgba(255,140,0,.1);border:1px solid rgba(255,140,0,.3);color:var(--warn)}
      .vn{background:rgba(220,53,69,.1);border:1px solid rgba(220,53,69,.3);color:var(--danger)}
      .vdr{display:flex;justify-content:space-between;font-size:12px;padding:6px 0;border-bottom:1px solid var(--mist);color:var(--smoke)}
      .vdr span:last-child{color:var(--ink);font-weight:500}
      .vnt{background:rgba(58,175,169,.08);border:1px solid rgba(58,175,169,.3);border-radius:6px;padding:10px 14px;margin-top:12px;font-size:12px;color:var(--teal)}
      .hitem{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--mist)}
      .hitem:last-child{border:none}
      .hdot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
      .dot-r{background:var(--danger)}.dot-y{background:var(--warn)}.dot-g{background:var(--ok)}
      .hn{font-size:13px;font-weight:500;flex:1}
      .hstat{font-size:10px;padding:3px 7px;border-radius:3px}
      .stat-req{background:rgba(220,53,69,.1);color:var(--danger)}
      .stat-rec{background:rgba(255,140,0,.1);color:var(--warn)}
      .stat-ok{background:rgba(45,134,83,.1);color:var(--ok)}
      .ps{background:#fff;border:1px solid var(--mist);border-radius:10px;padding:22px}
      .pg{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:14px}
      .pc{text-align:center;padding:14px;border:1px solid var(--mist);border-radius:8px}
      .pv{font-size:42px;margin-bottom:8px}
      .pt{font-size:14px;font-weight:700;color:var(--teal);margin-bottom:3px}
      .pn{font-size:11px;color:var(--smoke);margin-bottom:5px}
      .pvt{font-size:10px;font-family:'Space Mono',monospace;background:var(--mist);padding:2px 7px;border-radius:3px;display:inline-block}
      .pcy{font-size:10px;margin-top:6px;padding:3px 7px;border-radius:3px;display:inline-block}
      .py{background:rgba(45,134,83,.1);color:var(--ok)}
      .pa{background:rgba(255,140,0,.1);color:var(--warn)}
      .rt{display:flex;gap:0;margin-bottom:18px;border:1px solid var(--mist);border-radius:6px;overflow:hidden;background:#fff;width:fit-content}
      .rtb{padding:9px 22px;font-size:13px;font-weight:500;border:none;background:none;transition:all .2s}
      .rtb.active{background:var(--ink);color:#fff}
      .rg{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
      .rc{background:#fff;border:1px solid var(--mist);border-radius:8px;padding:18px;display:flex;flex-direction:column;gap:10px}
      .ricon{font-size:38px;text-align:center;padding:8px 0}
      .rn{font-weight:600;font-size:14px}
      .rsp{font-size:11px;color:var(--smoke)}
      .rp{font-size:20px;font-weight:700;color:var(--teal)}
      .rfs{display:flex;gap:6px;flex-wrap:wrap}
      .rft{background:var(--mist);padding:3px 7px;border-radius:3px;font-size:10px}
      .rb{background:var(--teal);color:#fff;border:none;padding:9px;border-radius:4px;font-size:12px;font-weight:600;width:100%}
      footer{background:var(--ink);color:var(--smoke);padding:36px 40px;display:flex;align-items:center;justify-content:space-between}
      .flogo{font-family:'Cormorant Garamond',serif;font-size:22px;color:var(--gold);letter-spacing:4px;margin-bottom:4px}
      .fcopy{font-size:11px;color:rgba(255,255,255,.3)}
      .flinks{display:flex;gap:22px}
      .flinks a{color:var(--smoke);font-size:11px;text-decoration:none}
      @media(max-width:768px){.sr2,.sr3,.tc,.rg,.pg,.cg{grid-template-columns:1fr 1fr}.nav-links{display:none}}
    `}</style>

    <nav className="nav">
      <div className="logo">W<em>ANDR</em></div>
      <div className="nav-links"><a href="#">Uçuşlar</a><a href="#">Oteller</a><a href="#">Aktiviteler</a><a href="#">Kiralık</a></div>
      <button className="nav-btn">Hesap Aç</button>
    </nav>

    <section className="hero">
      <div className="hero-bg"/><div className="hero-grid"/>
      <div className="hi">
        <div className="ey">✦ Canlı Veri · Akıllı Gezi Planlayıcı</div>
        <h1 className="ht">Dünyayı <em>Akıllıca</em><br/>Keşfet</h1>
        <p className="hs">100+ destinasyon · Canlı uçuş, hava, afet uyarısı, vize, priz ve döviz — ülkeye özel.</p>
        <div className="mw">
          <div className="mt">
            <button className={`mb ${mode==='manual'?'active':''}`} onClick={()=>setMode('manual')}>✏️ Manuel Rota</button>
            <button className={`mb ${mode==='ai'?'active':''}`} onClick={()=>setMode('ai')}>✨ YZ ile Ucuz Gezi</button>
          </div>
        </div>
        <div className="sb">
          {mode==='manual'?(
            <>
              <div className="sr2">
                <AirportSearch label="Nereden — şehir, ülke veya IATA kodu" value={origin} onChange={setOrigin} placeholder="İstanbul, Zürih, IST..."/>
                <AirportSearch label="Nereye — şehir, ülke veya IATA kodu" value={dest} onChange={setDest} placeholder="Bali, Paris, Tokyo, DPS..."/>
              </div>
              <div className="sr3">
                <div className="sf"><label>Gidiş</label><input type="date" value={form.depart} onChange={e=>setForm(f=>({...f,depart:e.target.value}))}/></div>
                <div className="sf"><label>Dönüş</label><input type="date" value={form.returnDate} onChange={e=>setForm(f=>({...f,returnDate:e.target.value}))}/></div>
                <div className="sf"><label>Pasaport</label>
                  <select value={form.passport} onChange={e=>setForm(f=>({...f,passport:e.target.value}))}>
                    <option value="TR">🇹🇷 Türk</option>
                    <option value="CH">🇨🇭 İsviçre</option>
                    <option value="DE">🇩🇪 Alman</option>
                  </select>
                </div>
              </div>
              <div className="opts">
                <label className="ck"><input type="checkbox" checked={form.hasPet} onChange={e=>setForm(f=>({...f,hasPet:e.target.checked}))}/> 🐾 Evcil Hayvan</label>
                <select style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.15)',color:'#fff',padding:'8px 12px',borderRadius:'4px',fontFamily:'DM Sans,sans-serif',fontSize:'13px'}} value={form.adults} onChange={e=>setForm(f=>({...f,adults:e.target.value}))}>
                  {[1,2,3,4,5].map(n=><option key={n} value={n}>{n} Yetişkin</option>)}
                </select>
                <button className="go" onClick={go} disabled={loading||!dest}>{loading?"⏳ Yükleniyor...":"🔍 Planı Oluştur"}</button>
              </div>
            </>
          ):(
            <>
              <div style={{color:'var(--smoke)',fontSize:'12px',marginBottom:'10px',textAlign:'left'}}>💡 Bütçe ve tercihini yaz, YZ rotayı bulsun:</div>
              <div className="ai-wrap">
                <textarea className="ai-ta" value={aiQ} onChange={e=>setAiQ(e.target.value)} placeholder="Örn: Eylülde 2 hafta, 1500€ bütçeyle deniz ve kültür gezisi, evcil hayvanım var..."/>
                <button className="go" onClick={go} disabled={loading}>✨ Öner</button>
              </div>
              <div className="chips">
                {['🏖️ Ucuz deniz tatili','🏔️ Dağ & doğa','🏛️ Kültür turu','🌏 Uzak doğu macerası','❄️ Kış kaçamağı'].map(c=>(
                  <span key={c} className="chip" onClick={()=>setAiQ(c)}>{c}</span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>

    {loading&&(
      <div className="lov">
        <div style={{fontSize:'44px'}}>🌍</div>
        <div className="lt">Plan Hazırlanıyor</div>
        <div className="ls">{origin?.code||'...'} → {dest?.name||'...'}</div>
        <div className="lb2"><div className="lf" style={{width:`${(step/STEPS.length)*100}%`}}/></div>
        <div className="lsteps">{STEPS.map((s,i)=><div key={i} className={`lstep ${i<=step?'active':''}`}>{s}</div>)}</div>
      </div>
    )}

    {res&&(
      <div style={{background:'var(--paper)'}}>
        <div className="results">
          <div className="dh">
            <div className="dh-ey">Gezi Planı · Canlı Verilerle</div>
            <h2 className="dh-t">{res.origin?.country} {res.origin?.code} → <em>{res.country?.flag} {res.dest?.name.split(' ')[0]}</em></h2>
            <div className="dh-m">{fmtDate(res.form.depart)} – {fmtDate(res.form.returnDate)} · {res.form.adults} Yetişkin{res.form.hasPet?' · 🐾':''} · {res.country?.name}</div>
          </div>

          {/* ALERTS */}
          {(()=>{
            const a=res.alerts;const c=res.country;
            const hq=a?.earthquakes?.filter(e=>e.severity==='high')||[];
            const mq=a?.earthquakes?.filter(e=>e.severity==='medium')||[];
            return(<>
              {hq.length>0&&<div className="ad"><div className="aico">🌍</div><div><div className="at">⚠️ Güçlü Deprem Aktivitesi — {c?.name}</div><div className="ab">Son 30 günde M{hq[0].magnitude} büyüklüğünde deprem: {hq[0].place} ({hq[0].time}). Yerel acil durum planlarını takip edin.</div></div></div>}
              {mq.length>0&&!hq.length&&<div className="aw"><div className="aico">🌍</div><div><div className="at">Orta Sismik Aktivite — {c?.name}</div><div className="ab">M{mq[0].magnitude} — {mq[0].place}. Düşük risk, bilginiz olsun.</div></div></div>}
              {c?.volcano&&<div className="aw"><div className="aico">🌋</div><div><div className="at">Yanardağ Bölgesi — {c?.name}</div><div className="ab">{c?.name} aktif yanardağ kuşağındadır. Yerel uyarıları gezi öncesi kontrol edin.</div></div></div>}
              {c?.tsunami&&<div className="aw"><div className="aico">🌊</div><div><div className="at">Tsunami Risk Bölgesi — {c?.name}</div><div className="ab">Bu bölge tsunami riski taşıyan kıyı hattındadır. Tahliye güzergahlarını öğrenin.</div></div></div>}
              {!hq.length&&!mq.length&&!c?.volcano&&!c?.tsunami&&<div className="ao">✅ {c?.name} için şu an aktif afet uyarısı bulunmuyor.</div>}
            </>);
          })()}

          {/* WEATHER */}
          {res.weather?.forecast&&(
            <div className="sec">
              <div className="sec-h"><div className="sec-t">🌤️ Hava Durumu <span className="bdg">CANLI</span></div><span className="wall">{res.weather.city}, {res.weather.country}</span></div>
              <div className="ws">
                {res.weather.forecast.map((d,i)=>(
                  <div key={d.date} className={`wc ${i===0?'today':''} ${d.is_storm?'storm':''}`}>
                    <div className="wd">{i===0?'Bugün':fmtDate(d.date)}</div>
                    <div className="wi">{d.emoji}{d.is_storm?' ⚠️':''}</div>
                    <div className="wt">{d.temp_max}°C</div>
                    <div className="wdsc">{d.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FLIGHTS */}
          <div className="sec">
            <div className="sec-h"><div className="sec-t">✈️ Uçuşlar <span className="bdg">CANLI</span></div><span className="wall">{res.flights?.total_found||0} seçenek · {res.origin?.code} → {res.dest?.code}</span></div>
            {res.flights?.offers?.length>0?(
              res.flights.offers.map((o,i)=>(
                <div key={o.id} className={`fc ${i===0?'best':''}`}>
                  <div><div className="fal">{o.airline_name}</div><div className="fco">{o.airline} · {o.cabin}</div>{i===0&&<div style={{marginTop:'4px'}}><span className="bst">EN UCUZ</span></div>}</div>
                  <div className="fr">
                    <div><div className="fcy">{o.departure.airport}</div><div className="ftm">{fmtTime(o.departure.time)}</div></div>
                    <div className="fa"><div className="fl"/><div className="fdr">{parseDur(o.duration)}</div></div>
                    <div><div className="fcy">{o.arrival.airport}</div><div className="ftm">{fmtTime(o.arrival.time)}</div></div>
                  </div>
                  <div><div className="fst">{o.stops===0?"✅ Direkt":`${o.stops} aktarma · ${o.stop_airports.join(', ')}`}</div>{o.seats_left<=5&&<div style={{color:'var(--danger)',fontSize:'11px'}}>⚠️ Son {o.seats_left} koltuk!</div>}</div>
                  <div style={{textAlign:'right'}}><div className="fp">{o.price.currency} {parseFloat(o.price.total).toLocaleString('tr-TR')}</div><div style={{fontSize:'10px',color:'var(--smoke)'}}>toplam</div><button className="bkb" style={{marginTop:'8px'}}>Rezerve Et</button></div>
                </div>
              ))
            ):<div className="femp">{res.flights?.error?`❌ ${res.flights.error}`:"✈️ Amadeus API key Vercel eklenince canlı uçuşlar burada görünecek."}</div>}
          </div>

          {/* CURRENCY */}
          {res.currency?.rates&&(
            <div className="sec">
              <div className="sec-h"><div className="sec-t">💱 Döviz Kurları <span className="bdg">CANLI</span></div></div>
              <div className="cs">
                <div className="ch"><div style={{fontSize:'13px',color:'var(--smoke)'}}>Son güncelleme: {new Date(res.currency.last_updated).toLocaleString('tr-TR')}</div><div className="lbg"><div className="ldot"/> CANLI</div></div>
                <div className="cg" style={{gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))'}}>
                  {Object.entries(res.currency.rates).map(([code,data])=>(
                    <div key={code} className={`cc ${data.isDest?'cc-dest':data.isOrigin?'cc-origin':''}`}>
                      <div className="cp">{data.isDest?"🏁 Varış Para Birimi":data.isOrigin?"🛫 Kalkış Para Birimi":code==='USD'?'💵 Dolar':'💶 Euro'}</div>
                      <div className="cp" style={{fontSize:'12px',marginBottom:'4px',fontFamily:'Space Mono,monospace'}}>EUR / {code}</div>
                      <div className="cr">{data.formatted}</div>
                      <div style={{fontSize:'11px',color:'var(--ok)'}}>↑ Anlık kur</div>
                    </div>
                  ))}
                </div>
                <div className="ct">💡 Havalimanı büfelerinden kaçının — kur %10–20 düşük olabilir. Şehir merkezindeki yetkili büroları tercih edin. Kart ödemede daima yerel para birimi seçin.</div>
              </div>
            </div>
          )}

          {/* VISA + HEALTH */}
          <div className="sec">
            <div className="sec-h"><div className="sec-t">🛂 Vize & 💉 Sağlık — {res.country?.flag} {res.country?.name}</div></div>
            <div className="tc">
              <div className="ic">
                <h4>🛂 Vize — {res.form.passport==='TR'?'🇹🇷 Türk':res.form.passport==='CH'?'🇨🇭 İsviçre':'🇩🇪 Alman'} Pasaportu → {res.country?.flag} {res.country?.name}</h4>
                {res.visa?.found?(
                  <>
                    <div className={`vb ${res.visa.type==='free'?'vf':res.visa.type==='voa'||res.visa.type==='eta'||res.visa.type==='evisa'||res.visa.type==='nzeta'?'vv':'vn'}`}>
                      {res.visa.type==='free'?'✅ Vizesiz Giriş':res.visa.type==='voa'?'🟡 '+res.visa.name:res.visa.type==='eta'?'🔵 '+res.visa.name:res.visa.type==='evisa'?'🔵 '+res.visa.name:res.visa.type==='schengen'?'🔴 '+res.visa.name:res.visa.type==='nzeta'?'🔵 '+res.visa.name:'🔴 '+res.visa.name}
                    </div>
                    {res.visa.duration<9000&&<div className="vdr"><span>Kalış Süresi</span><span>{res.visa.duration} gün</span></div>}
                    {res.visa.fee&&<div className="vdr"><span>Ücret</span><span>{res.visa.fee}</span></div>}
                    {res.visa.extendable&&<div className="vdr"><span>Uzatılabilir</span><span>✅ Evet</span></div>}
                    {res.visa.notes&&<div className="vnt">💡 {res.visa.notes}</div>}
                    {res.visa.link&&<div style={{marginTop:'8px',fontSize:'12px'}}><a href={res.visa.link} target="_blank" style={{color:'var(--teal)'}}>🔗 Online başvuru →</a></div>}
                  </>
                ):<div style={{fontSize:'13px',color:'var(--smoke)',padding:'10px',background:'var(--mist)',borderRadius:'6px'}}>{res.visa?.message||"Bu rota için konsolosluğun web sitesini kontrol edin."}</div>}
              </div>
              <div className="ic">
                <h4>💉 Aşı & Sağlık — {res.country?.flag} {res.country?.name}</h4>
                {res.country?.health?.map(h=>(
                  <div key={h.name} className="hitem">
                    <div className={`hdot ${HD[h.level]}`}/>
                    <div className="hn">{h.name}</div>
                    <div className={`hstat ${HS[h.level]}`}>{HL[h.level]}</div>
                  </div>
                ))||<div style={{fontSize:'13px',color:'var(--smoke)'}}>Seyahat doktorunuza danışın.</div>}
              </div>
            </div>
          </div>

          {/* PLUGS */}
          {res.country?.plugs&&(
            <div className="sec">
              <div className="sec-h"><div className="sec-t">🔌 Priz & Voltaj</div><span className="wall">{res.country.flag} {res.country.name}: {res.country.voltage} / {res.country.freq}</span></div>
              <div className="ps">
                <div style={{fontSize:'13px',color:'var(--smoke)',lineHeight:'1.7',marginBottom:'4px'}}>
                  <strong>{res.country.voltage} / {res.country.freq}</strong> —
                  {res.country.trCompat?' ✅ Türkiye ile aynı voltaj, çoğu cihaz adaptörsüz çalışabilir.'
                  :' ⚠️ Türkiyeden farklı voltaj veya priz tipi — üniversal adaptör veya dönüştürücü gerekli.'}
                </div>
                <div className="pg">
                  {res.country.plugs.map(p=>{const info=PLUG_INFO[p];if(!info)return null;return(
                    <div key={p} className="pc">
                      <div className="pv">🔌</div>
                      <div className="pt">{info.name}</div>
                      <div className="pn">{info.desc}</div>
                      <div className="pvt">{res.country.voltage} · {res.country.freq}</div>
                      <div className={`pcy ${info.trCompat?'py':'pa'}`}>{info.trCompat?"✅ TR Uyumlu":"⚡ Adaptör Gerek"}</div>
                    </div>
                  );})}
                  <div className="pc" style={{background:'rgba(45,134,83,.05)',borderColor:'rgba(45,134,83,.3)'}}>
                    <div className="pv">💡</div>
                    <div className="pt" style={{color:'var(--ok)'}}>Öneri</div>
                    <div className="pn">Universal Adaptör</div>
                    <div className="pvt">Tüm tipler</div>
                    <div className="pcy py">✅ Her yerde çalışır</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RENTALS */}
          <div className="sec">
            <div className="sec-h"><div className="sec-t">🚗 Araç Kiralama</div><span className="wall">{res.country?.flag} {res.country?.name} için canlı fiyatlar</span></div>
            <div className="rt">
              {[['car','🚗 Araba'],['moto','🏍️ Motor'],['bike','🚲 Bisiklet']].map(([k,l])=>(
                <button key={k} className={`rtb ${rental===k?'active':''}`} onClick={()=>setRental(k)}>{l}</button>
              ))}
            </div>
            {rental==='car'&&(
              <div className="rg">
                {[
                  {icon:'🏷️',platform:'Rentalcars.com',desc:'Dünya geneli en geniş filoya sahip platform. Sigorta seçenekleri, ücretsiz iptal.',badge:'En Çok Kullanılan',color:'var(--teal)',
                    url:`https://www.rentalcars.com/SearchResults.do?dropOffAirport=${res.dest?.code}&collectAirport=${res.dest?.code}&adultAge=30`},
                  {icon:'🔍',platform:'Kayak',desc:'100+ araç kiralama şirketini karşılaştırır. Fiyat takvimi ile en ucuz günü bulun.',badge:'En İyi Karşılaştırma',color:'#FF690F',
                    url:`https://www.kayak.com.tr/cars/${res.dest?.code}/${res.form.depart}/${res.form.returnDate||res.form.depart}`},
                  {icon:'🌐',platform:'Google Arabalar',desc:'Google'ın araç kiralama motoru. Tüm büyük firmalar tek sayfada.',badge:'Ücretsiz & Hızlı',color:'#4285F4',
                    url:`https://www.google.com/travel/cars?q=rent+a+car+${res.dest?.name?.split(' ')[0]}`},
                ].map(p=>(
                  <div key={p.platform} className="rc">
                    <div style={{fontSize:'36px',textAlign:'center',padding:'8px 0'}}>{p.icon}</div>
                    <div>
                      <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
                        <div className="rn">{p.platform}</div>
                        <span style={{background:p.color,color:'#fff',fontSize:'9px',padding:'2px 6px',borderRadius:'3px',fontWeight:'600'}}>{p.badge}</span>
                      </div>
                      <div className="rsp">{p.desc}</div>
                    </div>
                    {res.form.hasPet&&<div style={{background:'rgba(45,134,83,.1)',border:'1px solid rgba(45,134,83,.3)',borderRadius:'4px',padding:'6px 10px',fontSize:'11px',color:'var(--ok)'}}>🐾 Filtrede "evcil hayvan dostu" seçeneğini işaretleyin</div>}
                    <a href={p.url} target="_blank" rel="noopener noreferrer" style={{background:'var(--teal)',color:'#fff',borderRadius:'4px',padding:'10px',fontSize:'12px',fontWeight:'600',textAlign:'center',display:'block',textDecoration:'none',transition:'background .2s'}}>
                      {p.platform}'da Ara →
                    </a>
                  </div>
                ))}
              </div>
            )}
            {rental==='moto'&&(
              <div className="rg">
                {[
                  {icon:'🏍️',platform:'Bikesbooking.com',desc:'Motor ve scooter kiralama için uzman platform. 50+ ülkede geçerli.',badge:'Motor Uzmanı',color:'var(--teal)',
                    url:`https://www.bikesbooking.com/en/search?destination=${res.dest?.name?.split(' ')[0]}`},
                  {icon:'🛵',platform:'Rentalcars.com',desc:'Scooter ve motosiklet seçenekleri de mevcut. Sigorta dahil paketler.',badge:'Geniş Seçim',color:'#FF690F',
                    url:`https://www.rentalcars.com/SearchResults.do?collectAirport=${res.dest?.code}`},
                  {icon:'🔍',platform:'Kayak',desc:'Motor kiralama karşılaştırması. Günlük fiyatları karşılaştırın.',badge:'Fiyat Karşılaştırma',color:'#4285F4',
                    url:`https://www.kayak.com.tr/cars/${res.dest?.code}/${res.form.depart}/${res.form.returnDate||res.form.depart}`},
                ].map(p=>(
                  <div key={p.platform} className="rc">
                    <div style={{fontSize:'36px',textAlign:'center',padding:'8px 0'}}>{p.icon}</div>
                    <div>
                      <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
                        <div className="rn">{p.platform}</div>
                        <span style={{background:p.color,color:'#fff',fontSize:'9px',padding:'2px 6px',borderRadius:'3px',fontWeight:'600'}}>{p.badge}</span>
                      </div>
                      <div className="rsp">{p.desc}</div>
                    </div>
                    <a href={p.url} target="_blank" rel="noopener noreferrer" style={{background:'var(--teal)',color:'#fff',borderRadius:'4px',padding:'10px',fontSize:'12px',fontWeight:'600',textAlign:'center',display:'block',textDecoration:'none'}}>
                      {p.platform}'da Ara →
                    </a>
                  </div>
                ))}
              </div>
            )}
            {rental==='bike'&&(
              <div className="rg">
                {[
                  {icon:'🚲',platform:'Spinlister',desc:'Yerel bisiklet sahiplerinden kiralama. Şehir bisikleti, MTB, e-bisiklet seçenekleri.',badge:'Yerel & Uygun Fiyat',color:'var(--ok)',
                    url:`https://www.spinlister.com/en/search?place=${res.dest?.name?.split(' ')[0]}`},
                  {icon:'⚡',platform:'Lime / Bird',desc:'Elektrikli scooter ve bisiklet paylaşım uygulamaları. Büyük şehirlerde mevcut.',badge:'Anlık Kiralama',color:'#00C851',
                    url:`https://www.li.me`},
                  {icon:'🗺️',platform:'Google Maps',desc:'Yakındaki bisiklet kiralama noktalarını haritada görün. En pratik yöntem.',badge:'Ücretsiz',color:'#4285F4',
                    url:`https://www.google.com/maps/search/bicycle+rental+near+${res.dest?.name?.split(' ')[0]}`},
                ].map(p=>(
                  <div key={p.platform} className="rc">
                    <div style={{fontSize:'36px',textAlign:'center',padding:'8px 0'}}>{p.icon}</div>
                    <div>
                      <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
                        <div className="rn">{p.platform}</div>
                        <span style={{background:p.color,color:'#fff',fontSize:'9px',padding:'2px 6px',borderRadius:'3px',fontWeight:'600'}}>{p.badge}</span>
                      </div>
                      <div className="rsp">{p.desc}</div>
                    </div>
                    <a href={p.url} target="_blank" rel="noopener noreferrer" style={{background:'var(--teal)',color:'#fff',borderRadius:'4px',padding:'10px',fontSize:'12px',fontWeight:'600',textAlign:'center',display:'block',textDecoration:'none'}}>
                      {p.platform}'da Ara →
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    )}

    <footer>
      <div><div className="flogo">WANDR</div><div className="fcopy">OpenWeatherMap · USGS · ExchangeRate-API · Amadeus · © 2025</div></div>
      <div className="flinks"><a href="#">Gizlilik</a><a href="#">API</a><a href="#">İletişim</a></div>
    </footer>
  </>);
}

function RC({icon,name,spec,price,feats}){
  return(<div className="rc"><div className="ricon">{icon}</div><div><div className="rn">{name}</div><div className="rsp">{spec}</div></div><div className="rp">{price} <span style={{fontSize:'11px',color:'var(--smoke)',fontWeight:'400'}}>/gün</span></div><div className="rfs">{feats.map(f=><span key={f} className="rft">{f}</span>)}</div><button className="rb">Kirala</button></div>);
}
