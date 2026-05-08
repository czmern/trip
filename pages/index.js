import { useState, useEffect } from 'react';
import Head from 'next/head';

function fmtDate(str){if(!str)return'';return new Date(str).toLocaleDateString('tr-TR',{weekday:'short',day:'numeric',month:'short'});}
function fmtTime(str){if(!str)return'';return new Date(str).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});}
function parseDuration(iso){if(!iso)return'';const m=iso.match(/PT(\d+H)?(\d+M)?/);const h=m?.[1]?parseInt(m[1]):0;const min=m?.[2]?parseInt(m[2]):0;return `${h}sa${min>0?' '+min+'dk':''}`.trim();}

const AIRPORTS=[
  {code:'DPS',name:'Bali (Ngurah Rai)',country:'🇮🇩 Endonezya'},{code:'CGK',name:'Jakarta',country:'🇮🇩 Endonezya'},
  {code:'BKK',name:'Bangkok (Suvarnabhumi)',country:'🇹🇭 Tayland'},{code:'HKT',name:'Phuket',country:'🇹🇭 Tayland'},{code:'CNX',name:'Chiang Mai',country:'🇹🇭 Tayland'},
  {code:'NRT',name:'Tokyo (Narita)',country:'🇯🇵 Japonya'},{code:'KIX',name:'Osaka (Kansai)',country:'🇯🇵 Japonya'},
  {code:'SIN',name:'Singapur (Changi)',country:'🇸🇬 Singapur'},
  {code:'SGN',name:'Ho Chi Minh City',country:'🇻🇳 Vietnam'},{code:'HAN',name:'Hanoi',country:'🇻🇳 Vietnam'},{code:'DAD',name:'Da Nang',country:'🇻🇳 Vietnam'},
  {code:'DEL',name:'New Delhi',country:'🇮🇳 Hindistan'},{code:'BOM',name:'Mumbai',country:'🇮🇳 Hindistan'},
  {code:'DXB',name:'Dubai',country:'🇦🇪 BAE'},{code:'AUH',name:'Abu Dhabi',country:'🇦🇪 BAE'},
  {code:'CDG',name:'Paris (Charles de Gaulle)',country:'🇫🇷 Fransa'},{code:'NCE',name:'Nice',country:'🇫🇷 Fransa'},{code:'LYS',name:'Lyon',country:'🇫🇷 Fransa'},
  {code:'MAD',name:'Madrid',country:'🇪🇸 İspanya'},{code:'BCN',name:'Barselona',country:'🇪🇸 İspanya'},{code:'AGP',name:'Malaga',country:'🇪🇸 İspanya'},{code:'PMI',name:'Mallorca',country:'🇪🇸 İspanya'},
  {code:'FCO',name:'Roma (Fiumicino)',country:'🇮🇹 İtalya'},{code:'MXP',name:'Milano (Malpensa)',country:'🇮🇹 İtalya'},{code:'VCE',name:'Venedik',country:'🇮🇹 İtalya'},{code:'NAP',name:'Napoli',country:'🇮🇹 İtalya'},
  {code:'FRA',name:'Frankfurt',country:'🇩🇪 Almanya'},{code:'MUC',name:'Münih',country:'🇩🇪 Almanya'},{code:'BER',name:'Berlin',country:'🇩🇪 Almanya'},{code:'DUS',name:'Düsseldorf',country:'🇩🇪 Almanya'},
  {code:'LHR',name:'Londra (Heathrow)',country:'🇬🇧 İngiltere'},{code:'LGW',name:'Londra (Gatwick)',country:'🇬🇧 İngiltere'},{code:'EDI',name:'Edinburgh',country:'🇬🇧 İngiltere'},
  {code:'ATH',name:'Atina',country:'🇬🇷 Yunanistan'},{code:'HER',name:'Girit (Iraklio)',country:'🇬🇷 Yunanistan'},{code:'RHO',name:'Rodos',country:'🇬🇷 Yunanistan'},{code:'SKG',name:'Selanik',country:'🇬🇷 Yunanistan'},{code:'CFU',name:'Korfu',country:'🇬🇷 Yunanistan'},
  {code:'LIS',name:'Lizbon',country:'🇵🇹 Portekiz'},{code:'FAO',name:'Faro (Algarve)',country:'🇵🇹 Portekiz'},{code:'OPO',name:'Porto',country:'🇵🇹 Portekiz'},
  {code:'AMS',name:'Amsterdam (Schiphol)',country:'🇳🇱 Hollanda'},
  {code:'ZRH',name:'Zürih',country:'🇨🇭 İsviçre'},{code:'GVA',name:'Cenevre',country:'🇨🇭 İsviçre'},
  {code:'JFK',name:'New York (JFK)',country:'🇺🇸 ABD'},{code:'LAX',name:'Los Angeles',country:'🇺🇸 ABD'},{code:'MIA',name:'Miami',country:'🇺🇸 ABD'},{code:'SFO',name:'San Francisco',country:'🇺🇸 ABD'},{code:'LAS',name:'Las Vegas',country:'🇺🇸 ABD'},
  {code:'CUN',name:'Cancun',country:'🇲🇽 Meksika'},{code:'MEX',name:'Mexico City',country:'🇲🇽 Meksika'},
  {code:'GRU',name:'São Paulo',country:'🇧🇷 Brezilya'},{code:'GIG',name:'Rio de Janeiro',country:'🇧🇷 Brezilya'},
  {code:'EZE',name:'Buenos Aires',country:'🇦🇷 Arjantin'},
  {code:'RAK',name:'Marakeş',country:'🇲🇦 Fas'},{code:'CMN',name:'Kazablanka',country:'🇲🇦 Fas'},{code:'AGA',name:'Agadir',country:'🇲🇦 Fas'},
  {code:'CAI',name:'Kahire',country:'🇪🇬 Mısır'},{code:'HRG',name:'Hurghada',country:'🇪🇬 Mısır'},{code:'SSH',name:'Şarm el-Şeyh',country:'🇪🇬 Mısır'},
  {code:'CPT',name:'Cape Town',country:'🇿🇦 Güney Afrika'},{code:'JNB',name:'Johannesburg',country:'🇿🇦 Güney Afrika'},
  {code:'SYD',name:'Sydney',country:'🇦🇺 Avustralya'},{code:'MEL',name:'Melbourne',country:'🇦🇺 Avustralya'},{code:'BNE',name:'Brisbane',country:'🇦🇺 Avustralya'},
  {code:'AKL',name:'Auckland',country:'🇳🇿 Yeni Zelanda'},
];

const ORIGINS=[
  {code:'IST',name:'İstanbul (Atatürk)'},{code:'SAW',name:'İstanbul (Sabiha Gökçen)'},{code:'AYT',name:'Antalya'},{code:'ESB',name:'Ankara'},{code:'ADB',name:'İzmir'},
  {code:'ZRH',name:'Zürih'},{code:'GVA',name:'Cenevre'},{code:'FRA',name:'Frankfurt'},{code:'MUC',name:'Münih'},{code:'VIE',name:'Viyana'},
];

const PLUG_INFO={
  A:{name:'Tip A',desc:'2 düz pim (Amerikan)',trCompat:false},
  B:{name:'Tip B',desc:'2 düz + 1 yuvarlak pim',trCompat:false},
  C:{name:'Tip C',desc:'Europlug (2 yuvarlak pim)',trCompat:true},
  D:{name:'Tip D',desc:'Hindistan (3 yuvarlak)',trCompat:false},
  E:{name:'Tip E',desc:'Fransız topraklı',trCompat:true},
  F:{name:'Tip F',desc:'Schuko (topraklı)',trCompat:true},
  G:{name:'Tip G',desc:'İngiliz (3 dikdörtgen pim)',trCompat:false},
  I:{name:'Tip I',desc:'Avustralya/Çin (çapraz)',trCompat:false},
  J:{name:'Tip J',desc:'İsviçre (3 yuvarlak)',trCompat:false},
  L:{name:'Tip L',desc:'İtalya (3 sıralı yuvarlak)',trCompat:false},
  M:{name:'Tip M',desc:'G.Afrika (3 büyük yuvarlak)',trCompat:false},
  N:{name:'Tip N',desc:'Brezilya IEC standard',trCompat:false},
};

const H_LABELS={required:'Zorunlu',recommended:'Önerilen',regional:'Bölgesel',warning:'Uyarı',ok:'Gereksinim Yok'};
const H_DOT={required:'dot-r',recommended:'dot-y',regional:'dot-y',warning:'dot-r',ok:'dot-g'};
const H_STAT={required:'stat-req',recommended:'stat-rec',regional:'stat-rec',warning:'stat-req',ok:'stat-ok'};

const LOAD_STEPS=['✈️ Uçuşlar taranıyor...','⛈️ Hava durumu alınıyor...','🌋 Afet riski kontrol ediliyor...','💱 Döviz kurları güncelleniyor...','🛂 Vize & sağlık bilgileri hazırlanıyor...'];

export default function Home(){
  const [destQuery,setDestQuery]=useState('');
  const [destOpen,setDestOpen]=useState(false);
  const [selectedDest,setSelectedDest]=useState(null);
  const [form,setForm]=useState({origin:'IST',passport:'TR',depart:'',returnDate:'',adults:1,hasPet:false});
  const [mode,setMode]=useState('manual');
  const [aiQuery,setAiQuery]=useState('');
  const [loading,setLoading]=useState(false);
  const [loadStep,setLoadStep]=useState(0);
  const [results,setResults]=useState(null);
  const [activeRental,setActiveRental]=useState('car');

  const filtered=destQuery.length>=1
    ?AIRPORTS.filter(a=>a.code.toLowerCase().includes(destQuery.toLowerCase())||a.name.toLowerCase().includes(destQuery.toLowerCase())||a.country.toLowerCase().includes(destQuery.toLowerCase())).slice(0,8)
    :AIRPORTS.slice(0,8);

  useEffect(()=>{
    const d=new Date();d.setDate(d.getDate()+30);
    const dep=d.toISOString().split('T')[0];
    d.setDate(d.getDate()+10);
    const ret=d.toISOString().split('T')[0];
    setForm(f=>({...f,depart:dep,returnDate:ret}));
  },[]);

  async function fetchAll(){
    if(!selectedDest&&mode==='manual'){alert('Lütfen bir destinasyon seçin');return;}
    setLoading(true);setLoadStep(0);setResults(null);
    try{
      const dest=selectedDest?.code||'DPS';
      setLoadStep(1);
      const [weatherR,currR,countryR]=await Promise.allSettled([
        fetch(`/api/weather?city=${selectedDest?.name.split('(')[0].trim()||dest}&days=7`).then(r=>r.json()),
        fetch(`/api/currency?base=EUR&targets=IDR,TRY,USD,CHF,GBP,JPY,THB,AED`).then(r=>r.json()),
        fetch(`/api/countrydata?iata=${dest}`).then(r=>r.json()),
      ]);
      setLoadStep(2);
      const country=countryR.value;
      let alerts=null;
      if(country?.lat){alerts=await fetch(`/api/alerts?lat=${country.lat}&lon=${country.lon}`).then(r=>r.json()).catch(()=>null);}
      setLoadStep(3);
      const [flightsR,visaR]=await Promise.allSettled([
        fetch(`/api/flights?origin=${form.origin}&destination=${dest}&departureDate=${form.depart}&returnDate=${form.returnDate}&adults=${form.adults}&currencyCode=EUR`).then(r=>r.json()),
        fetch(`/api/visa?passport=${form.passport}&destination=${dest.slice(0,2)}`).then(r=>r.json()),
      ]);
      setLoadStep(4);await sleep(300);
      setResults({weather:weatherR.value||null,currency:currR.value||null,country,alerts,flights:flightsR.value||null,visa:visaR.value||null,dest:selectedDest,form:{...form}});
    }catch(e){console.error(e);}finally{setLoading(false);}
  }
  function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

  return(
    <>
    <Head>
      <title>WANDR — Akıllı Gezi Planlayıcı</title>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@300;400;500;600&family=Space+Mono&display=swap" rel="stylesheet"/>
    </Head>
    <style>{`
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      :root{--ink:#0D1117;--paper:#F7F4EE;--gold:#C9A84C;--gold-l:#F0D98A;--teal:#2A7F7F;--teal-l:#3AAFA9;--mist:#E8E4DB;--smoke:#B8B2A7;--danger:#DC3545;--warn:#FF8C00;--ok:#2D8653;--white:#fff}
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
      .hero-inner{position:relative;text-align:center;width:100%}
      .eyebrow{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:3px;color:var(--teal-l);text-transform:uppercase;margin-bottom:18px}
      .hero-title{font-family:'Cormorant Garamond',serif;font-size:clamp(48px,7vw,88px);font-weight:300;color:#fff;line-height:1;margin-bottom:14px}
      .hero-title em{font-style:italic;color:var(--gold)}
      .hero-sub{color:var(--smoke);font-size:15px;font-weight:300;max-width:520px;margin:0 auto 40px;line-height:1.7}
      .mode-wrap{display:flex;justify-content:center;margin-bottom:28px}
      .mode-toggle{display:flex;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:4px;overflow:hidden}
      .mode-btn{padding:11px 26px;background:none;border:none;color:var(--smoke);font-size:13px;font-weight:500;transition:all .2s}
      .mode-btn.active{background:var(--gold);color:var(--ink)}
      .sbox{width:100%;max-width:820px;margin:0 auto;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);border-radius:6px;padding:26px 30px}
      .srow{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:end}
      .srow3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-top:14px}
      .sf{display:flex;flex-direction:column;gap:5px;position:relative}
      .sf label{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--smoke)}
      .sf input,.sf select{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);color:#fff;padding:11px 14px;border-radius:4px;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s;width:100%}
      .sf input:focus,.sf select:focus{border-color:var(--gold)}
      .sf select option{background:var(--ink)}
      .opts{display:flex;gap:18px;margin-top:14px;flex-wrap:wrap;align-items:center}
      .ck{display:flex;align-items:center;gap:7px;color:var(--smoke);font-size:13px}
      .ck input{accent-color:var(--gold);width:14px;height:14px}
      .sbtn{background:var(--gold);color:var(--ink);border:none;padding:12px 28px;border-radius:4px;font-weight:600;font-size:14px;white-space:nowrap;transition:all .2s;margin-left:auto}
      .sbtn:hover{background:var(--gold-l)}
      .sbtn:disabled{opacity:.6}
      .dd{position:absolute;top:100%;left:0;right:0;z-index:50;background:#1a2030;border:1px solid rgba(255,255,255,.15);border-radius:4px;max-height:260px;overflow-y:auto;margin-top:4px}
      .dd-item{padding:10px 14px;cursor:pointer;transition:background .15s;border-bottom:1px solid rgba(255,255,255,.05)}
      .dd-item:hover{background:rgba(201,168,76,.15)}
      .dd-item:last-child{border:none}
      .dd-code{font-family:'Space Mono',monospace;font-size:12px;color:var(--gold);margin-right:8px}
      .dd-name{font-size:13px;color:#fff}
      .dd-country{font-size:11px;color:var(--smoke);margin-top:2px}
      .ai-wrap{display:flex;gap:10px}
      .ai-ta{flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);color:#fff;padding:13px 16px;border-radius:4px;font-size:14px;font-family:'DM Sans',sans-serif;resize:none;height:52px;outline:none}
      .chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
      .chip{background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.3);color:var(--gold-l);padding:5px 13px;border-radius:20px;font-size:12px;cursor:pointer}
      .lov{position:fixed;inset:0;background:rgba(13,17,23,.96);z-index:200;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px}
      .l-title{font-family:'Cormorant Garamond',serif;font-size:30px;color:#fff}
      .l-sub{color:var(--smoke);font-size:13px}
      .l-bar{width:280px;height:2px;background:rgba(255,255,255,.1);border-radius:2px;overflow:hidden}
      .l-fill{height:100%;background:var(--gold);border-radius:2px;transition:width .5s ease}
      .l-steps{display:flex;flex-direction:column;gap:8px;margin-top:10px}
      .l-step{color:var(--smoke);font-size:12px;opacity:.4;transition:opacity .3s}
      .l-step.active{opacity:1;color:var(--teal-l)}
      .res{max-width:1080px;margin:0 auto;padding:50px 32px}
      .dh{text-align:center;padding:30px 0;border-bottom:1px solid var(--mist);margin-bottom:36px}
      .dh-ey{font-size:11px;letter-spacing:3px;color:var(--smoke);text-transform:uppercase;margin-bottom:6px}
      .dh-t{font-family:'Cormorant Garamond',serif;font-size:44px;font-weight:300}
      .dh-t em{font-style:italic;color:var(--teal)}
      .dh-m{font-size:13px;color:var(--smoke);margin-top:4px}
      .a-danger{background:linear-gradient(135deg,#1a0a0a,#2d1010);border:1px solid rgba(220,53,69,.4);border-left:4px solid var(--danger);border-radius:6px;padding:18px 22px;margin-bottom:20px;display:flex;align-items:flex-start;gap:14px}
      .a-warn{background:linear-gradient(135deg,#1a1200,#2d2000);border:1px solid rgba(255,140,0,.4);border-left:4px solid var(--warn);border-radius:6px;padding:16px 22px;margin-bottom:16px;display:flex;align-items:flex-start;gap:12px}
      .a-ok{background:rgba(45,134,83,.08);border:1px solid rgba(45,134,83,.3);border-radius:6px;padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;gap:12px;font-size:13px;color:var(--ok)}
      .a-info{background:rgba(42,127,127,.08);border:1px solid rgba(42,127,127,.3);border-radius:6px;padding:12px 16px;margin-bottom:14px;font-size:12px;color:var(--teal-l)}
      .a-ico{font-size:26px;flex-shrink:0}
      .a-t{font-size:14px;font-weight:600;margin-bottom:4px}
      .a-danger .a-t{color:#ff6b6b}.a-warn .a-t{color:#ffa040}
      .a-b{font-size:12px;line-height:1.6}
      .a-danger .a-b{color:#cc9999}.a-warn .a-b{color:#cc9966}
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
      .fal{font-weight:600;font-size:13px;min-width:100px}
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
      .bst-b{background:var(--gold);color:var(--ink);font-size:9px;font-weight:700;padding:2px 7px;border-radius:3px;font-family:'Space Mono',monospace}
      .bk-b{background:var(--teal);color:#fff;border:none;padding:9px 18px;border-radius:4px;font-size:12px;font-weight:600}
      .f-emp{background:#fff;border:1px solid var(--mist);border-radius:8px;padding:32px;text-align:center;color:var(--smoke);font-size:14px}
      .cs{background:#fff;border:1px solid var(--mist);border-radius:10px;padding:22px}
      .ch{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
      .lb{background:rgba(45,134,83,.1);color:var(--ok);padding:4px 10px;border-radius:20px;font-size:11px;display:flex;align-items:center;gap:5px}
      .ld{width:6px;height:6px;background:var(--ok);border-radius:50%;animation:pulse 1.5s infinite}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
      .cg{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
      .cc{padding:14px;border:1px solid var(--mist);border-radius:8px}
      .cp{font-size:11px;color:var(--smoke);margin-bottom:3px}
      .cr{font-size:22px;font-weight:700;margin-bottom:3px}
      .ct{background:var(--mist);border-radius:6px;padding:12px 16px;margin-top:14px;font-size:12px;color:var(--smoke)}
      .tc{display:grid;grid-template-columns:1fr 1fr;gap:22px}
      .ic{background:#fff;border:1px solid var(--mist);border-radius:10px;padding:22px}
      .ic h4{font-size:14px;font-weight:600;margin-bottom:14px;display:flex;align-items:center;gap:8px}
      .vb{display:inline-block;padding:8px 14px;border-radius:6px;font-size:13px;margin-bottom:12px}
      .vf{background:rgba(45,134,83,.1);border:1px solid rgba(45,134,83,.3);color:var(--ok)}
      .vv{background:rgba(255,140,0,.1);border:1px solid rgba(255,140,0,.3);color:var(--warn)}
      .vn{background:rgba(220,53,69,.1);border:1px solid rgba(220,53,69,.3);color:var(--danger)}
      .vdr{display:flex;justify-content:space-between;font-size:12px;padding:6px 0;border-bottom:1px solid var(--mist);color:var(--smoke)}
      .vdr span:last-child{color:var(--ink);font-weight:500}
      .vnt{background:rgba(58,175,169,.08);border:1px solid rgba(58,175,169,.3);border-radius:6px;padding:10px 14px;margin-top:12px;font-size:12px;color:var(--teal)}
      .hi{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--mist)}
      .hi:last-child{border:none}
      .hdot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
      .dot-r{background:var(--danger)}.dot-y{background:var(--warn)}.dot-g{background:var(--ok)}
      .hn{font-size:13px;font-weight:500;flex:1}
      .hs{font-size:10px;padding:3px 7px;border-radius:3px}
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
      .ri{font-size:38px;text-align:center;padding:8px 0}
      .rn{font-weight:600;font-size:14px}
      .rsp{font-size:11px;color:var(--smoke)}
      .rp{font-size:20px;font-weight:700;color:var(--teal)}
      .rfs{display:flex;gap:6px;flex-wrap:wrap}
      .rft{background:var(--mist);padding:3px 7px;border-radius:3px;font-size:10px}
      .rb{background:var(--teal);color:#fff;border:none;padding:9px;border-radius:4px;font-size:12px;font-weight:600;width:100%}
      footer{background:var(--ink);color:var(--smoke);padding:36px 40px;display:flex;align-items:center;justify-content:space-between}
      .fl-logo{font-family:'Cormorant Garamond',serif;font-size:22px;color:var(--gold);letter-spacing:4px;margin-bottom:4px}
      .fl-copy{font-size:11px;color:rgba(255,255,255,.3)}
      .fl-links{display:flex;gap:22px}
      .fl-links a{color:var(--smoke);font-size:11px;text-decoration:none}
      @media(max-width:768px){.srow,.srow3,.cg,.tc,.rg,.pg{grid-template-columns:1fr 1fr}.nav-links{display:none}}
    `}</style>

    <nav className="nav">
      <div className="logo">W<em>ANDR</em></div>
      <div className="nav-links"><a href="#">Uçuşlar</a><a href="#">Oteller</a><a href="#">Aktiviteler</a><a href="#">Kiralık</a></div>
      <button className="nav-btn">Hesap Aç</button>
    </nav>

    <section className="hero">
      <div className="hero-bg"/><div className="hero-grid"/>
      <div className="hero-inner">
        <div className="eyebrow">✦ Canlı Veri · Akıllı Gezi Planlayıcı</div>
        <h1 className="hero-title">Dünyayı <em>Akıllıca</em><br/>Keşfet</h1>
        <p className="hero-sub">Gerçek zamanlı uçuş, hava, afet, vize ve döviz — hedef ülkeye özel, canlı verilerle.</p>
        <div className="mode-wrap">
          <div className="mode-toggle">
            <button className={`mode-btn ${mode==='manual'?'active':''}`} onClick={()=>setMode('manual')}>✏️ Manuel Rota</button>
            <button className={`mode-btn ${mode==='ai'?'active':''}`} onClick={()=>setMode('ai')}>✨ YZ ile Ucuz Gezi</button>
          </div>
        </div>
        <div className="sbox">
          {mode==='manual'?(
            <>
              <div className="srow">
                <div className="sf">
                  <label>Nereden</label>
                  <select value={form.origin} onChange={e=>setForm(f=>({...f,origin:e.target.value}))}>
                    {ORIGINS.map(o=><option key={o.code} value={o.code}>{o.code} — {o.name}</option>)}
                  </select>
                </div>
                <div className="sf">
                  <label>Nereye — şehir, ülke veya havalimanı kodu yazın</label>
                  <input
                    value={selectedDest?`${selectedDest.code} — ${selectedDest.name}`:destQuery}
                    onChange={e=>{setDestQuery(e.target.value);setSelectedDest(null);setDestOpen(true);}}
                    onFocus={()=>setDestOpen(true)}
                    onBlur={()=>setTimeout(()=>setDestOpen(false),200)}
                    placeholder="Örn: Bali, Paris, Tokyo, DPS..."
                  />
                  {destOpen&&filtered.length>0&&(
                    <div className="dd">
                      {filtered.map(a=>(
                        <div key={a.code} className="dd-item" onMouseDown={()=>{setSelectedDest(a);setDestQuery('');setDestOpen(false);}}>
                          <span className="dd-code">{a.code}</span>
                          <span className="dd-name">{a.name}</span>
                          <div className="dd-country">{a.country}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="srow3">
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
                <button className="sbtn" onClick={fetchAll} disabled={loading||!selectedDest}>{loading?'⏳ Yükleniyor...':'🔍 Planı Oluştur'}</button>
              </div>
            </>
          ):(
            <>
              <div style={{color:'var(--smoke)',fontSize:'12px',marginBottom:'10px',textAlign:'left'}}>💡 Bütçe ve tercihini yaz, YZ en ucuz rotayı bulsun:</div>
              <div className="ai-wrap">
                <textarea className="ai-ta" value={aiQuery} onChange={e=>setAiQuery(e.target.value)} placeholder="Örn: Eylülde 2 hafta, 1500€ bütçeyle deniz ve kültür gezisi..."/>
                <button className="sbtn" onClick={fetchAll} disabled={loading}>✨ Öner</button>
              </div>
              <div className="chips">
                {['🏖️ Ucuz deniz tatili','🏔️ Dağ & doğa','🏛️ Kültür turu','🌏 Uzak doğu','❄️ Kış kaçamağı'].map(c=>(
                  <span key={c} className="chip" onClick={()=>setAiQuery(c)}>{c}</span>
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
        <div className="l-title">Plan Hazırlanıyor</div>
        <div className="l-sub">{form.origin} → {selectedDest?.name||'...'}</div>
        <div className="l-bar"><div className="l-fill" style={{width:`${(loadStep/LOAD_STEPS.length)*100}%`}}/></div>
        <div className="l-steps">{LOAD_STEPS.map((s,i)=><div key={i} className={`l-step ${i<=loadStep?'active':''}`}>{s}</div>)}</div>
      </div>
    )}

    {results&&(
      <div style={{background:'var(--paper)'}}>
        <div className="res">
          <div className="dh">
            <div className="dh-ey">Gezi Planı · Canlı Verilerle</div>
            <h2 className="dh-t">{results.form.origin} → <em>{results.dest?.name.split('(')[0].trim()}</em></h2>
            <div className="dh-m">{fmtDate(results.form.depart)} – {fmtDate(results.form.returnDate)} · {results.form.adults} Yetişkin · {results.dest?.country}{results.form.hasPet?' · 🐾':''}</div>
          </div>

          {/* ALERTS */}
          {(()=>{
            const a=results.alerts;const c=results.country;
            const highQ=a?.earthquakes?.filter(e=>e.severity==='high')||[];
            const medQ=a?.earthquakes?.filter(e=>e.severity==='medium')||[];
            return(<>
              {highQ.length>0&&<div className="a-danger"><div className="a-ico">🌍</div><div><div className="a-t">⚠️ Güçlü Deprem — {c?.name}</div><div className="a-b">Son 30 günde M{highQ[0].magnitude}: {highQ[0].place} ({highQ[0].time}). Yerel acil planları takip edin.</div></div></div>}
              {medQ.length>0&&!highQ.length&&<div className="a-warn"><div className="a-ico">🌍</div><div><div className="a-t">Orta Sismik Aktivite — {c?.name}</div><div className="a-b">M{medQ[0].magnitude} — {medQ[0].place}. Düşük risk, bilginiz olsun.</div></div></div>}
              {c?.volcano&&<div className="a-warn"><div className="a-ico">🌋</div><div><div className="a-t">Yanardağ Bölgesi — {c?.name}</div><div className="a-b">{c?.name} aktif yanardağ kuşağındadır. Yerel otoritelerin güncel uyarılarını kontrol edin.</div></div></div>}
              {c?.tsunami&&<div className="a-warn"><div className="a-ico">🌊</div><div><div className="a-t">Tsunami Risk Bölgesi</div><div className="a-b">Kıyı hattında tsunami riski mevcuttur. Tahliye güzergahlarını öğrenin.</div></div></div>}
              {!highQ.length&&!medQ.length&&!c?.volcano&&!c?.tsunami&&<div className="a-ok">✅ {c?.name||''} için şu an aktif afet uyarısı bulunmuyor.</div>}
              {a?.earthquakes?.length===0&&<div className="a-info">ℹ️ Son 30 günde 500km yarıçap içinde M4.5+ deprem kaydedilmedi.</div>}
            </>);
          })()}

          {/* WEATHER */}
          {results.weather?.forecast&&(
            <div className="sec">
              <div className="sec-h"><div className="sec-t">🌤️ Hava Durumu <span className="bdg">CANLI</span></div><span className="wall">{results.weather.city}, {results.weather.country}</span></div>
              <div className="ws">
                {results.weather.forecast.map((d,i)=>(
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
            <div className="sec-h"><div className="sec-t">✈️ Uçuşlar <span className="bdg">CANLI</span></div><span className="wall">{results.flights?.total_found||0} seçenek</span></div>
            {results.flights?.offers?.length>0?(
              results.flights.offers.map((o,i)=>(
                <div key={o.id} className={`fc ${i===0?'best':''}`}>
                  <div><div className="fal">{o.airline_name}</div><div className="fco">{o.airline} · {o.cabin}</div>{i===0&&<div style={{marginTop:'4px'}}><span className="bst-b">EN UCUZ</span></div>}</div>
                  <div className="fr">
                    <div><div className="fcy">{o.departure.airport}</div><div className="ftm">{fmtTime(o.departure.time)}</div></div>
                    <div className="fa"><div className="fl"/><div className="fdr">{parseDuration(o.duration)}</div></div>
                    <div><div className="fcy">{o.arrival.airport}</div><div className="ftm">{fmtTime(o.arrival.time)}</div></div>
                  </div>
                  <div><div className="fst">{o.stops===0?'✅ Direkt':`${o.stops} aktarma · ${o.stop_airports.join(', ')}`}</div>{o.seats_left<=5&&<div style={{color:'var(--danger)',fontSize:'11px'}}>⚠️ Son {o.seats_left} koltuk!</div>}</div>
                  <div style={{textAlign:'right'}}><div className="fp">{o.price.currency} {parseFloat(o.price.total).toLocaleString('tr-TR')}</div><div style={{fontSize:'10px',color:'var(--smoke)'}}>toplam</div><button className="bk-b" style={{marginTop:'8px'}}>Rezerve Et</button></div>
                </div>
              ))
            ):<div className="f-emp">{results.flights?.error?`❌ ${results.flights.error}`:'Amadeus API key eklendikten sonra gerçek uçuşlar burada görünecek.'}</div>}
          </div>

          {/* CURRENCY */}
          {results.currency?.rates&&(
            <div className="sec">
              <div className="sec-h"><div className="sec-t">💱 Döviz Kurları <span className="bdg">CANLI</span></div></div>
              <div className="cs">
                <div className="ch"><div style={{fontSize:'13px',color:'var(--smoke)'}}>Son güncelleme: {new Date(results.currency.last_updated).toLocaleString('tr-TR')}</div><div className="lb"><div className="ld"/> CANLI</div></div>
                <div className="cg">
                  {Object.entries(results.currency.rates).map(([code,data])=>(
                    <div key={code} className="cc"><div className="cp">EUR / {code}</div><div className="cr">{data.formatted}</div><div style={{fontSize:'11px',color:'var(--ok)'}}>↑ Anlık</div></div>
                  ))}
                </div>
                <div className="ct">💡 Havalimanı büfelerinden kaçının. Şehir merkezindeki yetkili büroları tercih edin. Kart ödemede "yerel para birimi" seçin.</div>
              </div>
            </div>
          )}

          {/* VISA + HEALTH */}
          <div className="sec">
            <div className="sec-h"><div className="sec-t">🛂 Vize & 💉 Sağlık — {results.country?.name}</div></div>
            <div className="tc">
              <div className="ic">
                <h4>🛂 Vize — {results.form.passport} Pasaportu</h4>
                {results.visa?.found?(
                  <>
                    <div className={`vb ${results.visa.type==='free'?'vf':results.visa.type==='voa'||results.visa.type==='eta'?'vv':'vn'}`}>
                      {results.visa.type==='free'?'✅ Vizesiz Giriş':results.visa.type==='voa'?'🟡 '+results.visa.name:results.visa.type==='eta'?'🔵 '+results.visa.name:'🔴 '+results.visa.name}
                    </div>
                    <div className="vdr"><span>Geçerlilik</span><span>{results.visa.duration} gün</span></div>
                    {results.visa.fee&&<div className="vdr"><span>Ücret</span><span>{results.visa.fee}</span></div>}
                    {results.visa.extendable&&<div className="vdr"><span>Uzatılabilir</span><span>✅ Evet</span></div>}
                    {results.visa.notes&&<div className="vnt">💡 {results.visa.notes}</div>}
                    {results.visa.link&&<div style={{marginTop:'8px',fontSize:'12px'}}><a href={results.visa.link} target="_blank" style={{color:'var(--teal)'}}>🔗 Online başvuru →</a></div>}
                  </>
                ):<div style={{fontSize:'13px',color:'var(--smoke)',padding:'10px',background:'var(--mist)',borderRadius:'6px'}}>{results.visa?.message||'Bu rota için ilgili konsolosluğun sitesini kontrol edin.'}</div>}
              </div>
              <div className="ic">
                <h4>💉 Aşı & Sağlık — {results.country?.name}</h4>
                {results.country?.health?.map(h=>(
                  <div key={h.name} className="hi">
                    <div className={`hdot ${H_DOT[h.level]}`}/>
                    <div className="hn">{h.name}</div>
                    <div className={`hs ${H_STAT[h.level]}`}>{H_LABELS[h.level]}</div>
                  </div>
                ))||<div style={{fontSize:'13px',color:'var(--smoke)'}}>Seyahat doktorunuza danışın.</div>}
              </div>
            </div>
          </div>

          {/* PLUGS */}
          {results.country&&(
            <div className="sec">
              <div className="sec-h"><div className="sec-t">🔌 Priz & Voltaj</div><span className="wall">{results.country.name}: {results.country.voltage} / {results.country.freq}</span></div>
              <div className="ps">
                <div style={{fontSize:'13px',color:'var(--smoke)',lineHeight:'1.7',marginBottom:'4px'}}>
                  <strong>{results.country.voltage} / {results.country.freq}</strong> —
                  {results.country.trCompat?' ✅ Türkiye ile aynı voltaj, adaptörsüz çalışabilir.'
                  :' ⚠️ Türkiye\'den farklı voltaj — dönüştürücü veya üniversal adaptör gerekebilir.'}
                </div>
                <div className="pg">
                  {results.country.plugs?.map(p=>{const info=PLUG_INFO[p];if(!info)return null;return(
                    <div key={p} className="pc">
                      <div className="pv">🔌</div>
                      <div className="pt">{info.name}</div>
                      <div className="pn">{info.desc}</div>
                      <div className="pvt">{results.country.voltage} · {results.country.freq}</div>
                      <div className={`pcy ${info.trCompat?'py':'pa'}`}>{info.trCompat?'✅ TR Uyumlu':'⚡ Adaptör Gerek'}</div>
                    </div>
                  );})}
                  <div className="pc" style={{background:'rgba(45,134,83,.05)',borderColor:'rgba(45,134,83,.3)'}}>
                    <div className="pv">💡</div>
                    <div className="pt" style={{color:'var(--ok)'}}>Öneri</div>
                    <div className="pn">Universal Travel Adapter</div>
                    <div className="pvt">Tüm tipler</div>
                    <div className="pcy py">✅ Her yerde çalışır</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RENTALS */}
          <div className="sec">
            <div className="sec-h"><div className="sec-t">🚗 Araç Kiralama</div></div>
            <div className="rt">
              {[['car','🚗 Araba'],['moto','🏍️ Motor'],['bike','🚲 Bisiklet']].map(([k,l])=>(
                <button key={k} className={`rtb ${activeRental===k?'active':''}`} onClick={()=>setActiveRental(k)}>{l}</button>
              ))}
            </div>
            <div className="rg">
              {activeRental==='car'&&[
                {icon:'🚙',name:'Ekonomi Sedan',spec:'Otomatik · 5 kişilik · A/C',price:'€12–18',feats:results.form.hasPet?['🐾 Evcil hayvan OK','Sigorta']:['Sigorta dahil','GPS']},
                {icon:'🚗',name:'SUV / Crossover',spec:'Otomatik · 5 kişilik · Geniş',price:'€22–35',feats:results.form.hasPet?['🐾 Evcil hayvan OK','GPS']:['GPS','USB','Geniş bagaj']},
                {icon:'🚐',name:'Minibüs + Şoför',spec:'7–12 kişilik',price:'€45–80',feats:results.form.hasPet?['🐾 Evcil hayvan OK','Şoförlü']:['İngilizce şoför','Esnek güzergah']},
              ].map(r=><RC key={r.name} {...r}/>)}
              {activeRental==='moto'&&[
                {icon:'🛵',name:'Scooter 125cc',spec:'Otomatik · Şehir içi',price:'€4–7',feats:['⛑️ Kask dahil']},
                {icon:'🏍️',name:'Motor 250–400cc',spec:'Manuel · Uzun yol',price:'€12–20',feats:['Ehliyet zorunlu']},
                {icon:'🏍️',name:'Premium 500cc+',spec:'Tur rotaları',price:'€25–45',feats:['Ulusl. ehliyet']},
              ].map(r=><RC key={r.name} {...r}/>)}
              {activeRental==='bike'&&[
                {icon:'🚲',name:'City Bisiklet',spec:'3 vites · Rahat',price:'€3–5',feats:['Kilit dahil']},
                {icon:'🚵',name:'MTB Bisiklet',spec:'21 vites · Off-road',price:'€8–14',feats:['Kask dahil']},
                {icon:'⚡',name:'E-Bisiklet',spec:'Elektrikli · 40–80km',price:'€14–22',feats:['Şarj dahil']},
              ].map(r=><RC key={r.name} {...r}/>)}
            </div>
          </div>

        </div>
      </div>
    )}

    <footer>
      <div><div className="fl-logo">WANDR</div><div className="fl-copy">Canlı API kaynakları: OpenWeatherMap · USGS · ExchangeRate-API · Amadeus · © 2025</div></div>
      <div className="fl-links"><a href="#">Gizlilik</a><a href="#">API</a><a href="#">İletişim</a></div>
    </footer>
    </>
  );
}

function RC({icon,name,spec,price,feats}){
  return(
    <div className="rc">
      <div className="ri">{icon}</div>
      <div><div className="rn">{name}</div><div className="rsp">{spec}</div></div>
      <div className="rp">{price} <span style={{fontSize:'11px',color:'var(--smoke)',fontWeight:'400'}}>/gün</span></div>
      <div className="rfs">{feats.map(f=><span key={f} className="rft">{f}</span>)}</div>
      <button className="rb">Kirala</button>
    </div>
  );
}
