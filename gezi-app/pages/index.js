// pages/index.js
import { useState, useEffect } from 'react';
import Head from 'next/head';

// ── Yardımcı: Tarih formatı ──
function fmtDate(str) {
  return new Date(str).toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' });
}
function fmtTime(str) {
  return new Date(str).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}
function parseDuration(iso) {
  const m = iso.match(/PT(\d+H)?(\d+M)?/);
  const h = m[1] ? parseInt(m[1]) : 0;
  const min = m[2] ? parseInt(m[2]) : 0;
  return `${h}sa ${min}dk`;
}

export default function Home() {
  const [mode, setMode] = useState('manual');
  const [form, setForm] = useState({
    origin: 'IST', destination: 'DPS',
    passport: 'TR', depart: '', returnDate: '',
    adults: 1, hasPet: false,
  });
  const [aiQuery, setAiQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [results, setResults] = useState(null);
  const [activeRental, setActiveRental] = useState('car');

  const LOAD_STEPS = [
    '✈️ Uçuşlar karşılaştırılıyor...',
    '⛈️ Hava durumu ve afet riski analiz ediliyor...',
    '🛂 Vize gereksinimleri kontrol ediliyor...',
    '💱 Döviz kurları güncelleniyor...',
    '✅ Plan hazır!',
  ];

  async function fetchAll() {
    setLoading(true);
    setLoadStep(0);
    setResults(null);

    try {
      const dest = form.destination;
      const destCities = {
        DPS: { city: 'Bali', lat: -8.3405, lon: 115.092 },
        BKK: { city: 'Bangkok', lat: 13.7563, lon: 100.5018 },
        NRT: { city: 'Tokyo', lat: 35.6762, lon: 139.6503 },
        LHR: { city: 'London', lat: 51.5074, lon: -0.1278 },
        CDG: { city: 'Paris', lat: 48.8566, lon: 2.3522 },
        JFK: { city: 'New York', lat: 40.7128, lon: -74.006 },
      };
      const destInfo = destCities[dest] || { city: dest, lat: 0, lon: 0 };

      // Paralel API çağrıları
      setLoadStep(1);
      const [weatherRes, alertsRes, currencyRes, flightsRes, visaRes] = await Promise.allSettled([
        fetch(`/api/weather?city=${destInfo.city}&days=7`).then(r => r.json()),
        fetch(`/api/alerts?lat=${destInfo.lat}&lon=${destInfo.lon}`).then(r => r.json()),
        fetch(`/api/currency?base=EUR&targets=IDR,TRY,USD,CHF`).then(r => r.json()),
        fetch(`/api/flights?origin=${form.origin}&destination=${dest}&departureDate=${form.depart}&returnDate=${form.returnDate}&adults=${form.adults}&currencyCode=EUR`).then(r => r.json()),
        fetch(`/api/visa?passport=${form.passport}&destination=${dest.slice(0,2)}`).then(r => r.json()),
      ]);

      setLoadStep(2); await sleep(400);
      setLoadStep(3); await sleep(400);
      setLoadStep(4); await sleep(300);

      setResults({
        weather: weatherRes.value || null,
        alerts: alertsRes.value || null,
        currency: currencyRes.value || null,
        flights: flightsRes.value || null,
        visa: visaRes.value || null,
        destInfo,
        form: { ...form },
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  // Varsayılan tarihler
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    const depart = d.toISOString().split('T')[0];
    d.setDate(d.getDate() + 10);
    const ret = d.toISOString().split('T')[0];
    setForm(f => ({ ...f, depart, returnDate: ret }));
  }, []);

  return (
    <>
      <Head>
        <title>WANDR — Akıllı Gezi Planlayıcı</title>
        <meta name="description" content="Canlı uçuş fiyatları, hava durumu, afet uyarıları, vize ve döviz bilgisi" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@300;400;500;600&family=Space+Mono&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --ink: #0D1117; --paper: #F7F4EE; --gold: #C9A84C; --gold-l: #F0D98A;
          --teal: #2A7F7F; --teal-l: #3AAFA9; --mist: #E8E4DB; --smoke: #B8B2A7;
          --danger: #DC3545; --warn: #FF8C00; --ok: #2D8653; --white: #fff;
        }
        body { font-family:'DM Sans',sans-serif; background:var(--paper); color:var(--ink); }
        a { color:inherit; text-decoration:none; }
        button { cursor:pointer; font-family:'DM Sans',sans-serif; }

        /* NAV */
        .nav { position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:16px 40px;background:rgba(13,17,23,.93);backdrop-filter:blur(12px);border-bottom:1px solid rgba(201,168,76,.2); }
        .logo { font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:300;color:var(--gold);letter-spacing:5px; }
        .logo em { font-style:italic;color:#fff; }
        .nav-links { display:flex;gap:28px; }
        .nav-links a { color:var(--smoke);font-size:12px;letter-spacing:1px;text-transform:uppercase;transition:color .2s; }
        .nav-links a:hover { color:var(--gold); }
        .nav-btn { background:var(--gold);color:var(--ink);padding:9px 20px;border:none;border-radius:2px;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;transition:background .2s; }
        .nav-btn:hover { background:var(--gold-l); }

        /* HERO */
        .hero { min-height:100vh;background:var(--ink);display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:100px 40px 60px; }
        .hero-bg { position:absolute;inset:0;background:radial-gradient(ellipse at 30% 50%,rgba(42,127,127,.15),transparent 60%),radial-gradient(ellipse at 70% 20%,rgba(201,168,76,.1),transparent 50%); }
        .hero-grid { position:absolute;inset:0;opacity:.04;background-image:linear-gradient(var(--smoke) 1px,transparent 1px),linear-gradient(90deg,var(--smoke) 1px,transparent 1px);background-size:40px 40px; }
        .hero-inner { position:relative;text-align:center;width:100%; }
        .eyebrow { font-family:'Space Mono',monospace;font-size:11px;letter-spacing:3px;color:var(--teal-l);text-transform:uppercase;margin-bottom:18px; }
        .hero-title { font-family:'Cormorant Garamond',serif;font-size:clamp(48px,7vw,88px);font-weight:300;color:#fff;line-height:1;margin-bottom:14px; }
        .hero-title em { font-style:italic;color:var(--gold); }
        .hero-sub { color:var(--smoke);font-size:15px;font-weight:300;max-width:520px;margin:0 auto 40px;line-height:1.7; }

        /* MODE TOGGLE */
        .mode-wrap { display:flex;justify-content:center;margin-bottom:28px; }
        .mode-toggle { display:flex;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:4px;overflow:hidden; }
        .mode-btn { padding:11px 26px;background:none;border:none;color:var(--smoke);font-size:13px;font-weight:500;transition:all .2s; }
        .mode-btn.active { background:var(--gold);color:var(--ink); }

        /* SEARCH BOX */
        .sbox { width:100%;max-width:780px;margin:0 auto;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);border-radius:6px;padding:26px 30px; }
        .srow { display:grid;grid-template-columns:1fr 1fr auto;gap:14px;align-items:end; }
        .drow { display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-top:14px; }
        .sf { display:flex;flex-direction:column;gap:5px; }
        .sf label { font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--smoke); }
        .sf input,.sf select { background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);color:#fff;padding:11px 14px;border-radius:4px;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s;width:100%; }
        .sf input:focus,.sf select:focus { border-color:var(--gold); }
        .sf select option { background:var(--ink); }
        .opts { display:flex;gap:18px;margin-top:14px;flex-wrap:wrap;align-items:center; }
        .ck { display:flex;align-items:center;gap:7px;color:var(--smoke);font-size:13px; }
        .ck input { accent-color:var(--gold);width:14px;height:14px; }
        .sbtn { background:var(--gold);color:var(--ink);border:none;padding:12px 28px;border-radius:4px;font-weight:600;font-size:14px;white-space:nowrap;transition:all .2s;margin-left:auto; }
        .sbtn:hover { background:var(--gold-l);transform:translateY(-1px); }
        .sbtn:disabled { opacity:.6;transform:none; }

        /* AI MODE */
        .ai-wrap { display:flex;gap:10px; }
        .ai-ta { flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);color:#fff;padding:13px 16px;border-radius:4px;font-size:14px;font-family:'DM Sans',sans-serif;resize:none;height:52px;outline:none;transition:border-color .2s; }
        .ai-ta:focus { border-color:var(--gold); }
        .chips { display:flex;gap:8px;flex-wrap:wrap;margin-top:12px; }
        .chip { background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.3);color:var(--gold-l);padding:5px 13px;border-radius:20px;font-size:12px;cursor:pointer;transition:all .2s; }
        .chip:hover { background:rgba(201,168,76,.2); }

        /* LOADING */
        .loading-overlay { position:fixed;inset:0;background:rgba(13,17,23,.96);z-index:200;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px; }
        .l-title { font-family:'Cormorant Garamond',serif;font-size:30px;color:#fff; }
        .l-sub { color:var(--smoke);font-size:13px; }
        .l-bar { width:280px;height:2px;background:rgba(255,255,255,.1);border-radius:2px;overflow:hidden; }
        .l-fill { height:100%;background:var(--gold);border-radius:2px;transition:width .5s ease; }
        .l-steps { display:flex;flex-direction:column;gap:8px;margin-top:10px; }
        .l-step { color:var(--smoke);font-size:12px;opacity:.4;transition:opacity .3s; }
        .l-step.active { opacity:1;color:var(--teal-l); }

        /* RESULTS */
        .results { max-width:1080px;margin:0 auto;padding:50px 32px; }
        .dest-header { text-align:center;padding:30px 0;border-bottom:1px solid var(--mist);margin-bottom:36px; }
        .dest-eyebrow { font-size:11px;letter-spacing:3px;color:var(--smoke);text-transform:uppercase;margin-bottom:6px; }
        .dest-title { font-family:'Cormorant Garamond',serif;font-size:44px;font-weight:300; }
        .dest-title em { font-style:italic;color:var(--teal); }
        .dest-meta { font-size:13px;color:var(--smoke);margin-top:4px; }

        /* ALERTS */
        .alert-danger { background:linear-gradient(135deg,#1a0a0a,#2d1010);border:1px solid rgba(220,53,69,.4);border-left:4px solid var(--danger);border-radius:6px;padding:18px 22px;margin-bottom:20px;display:flex;align-items:flex-start;gap:14px; }
        .alert-warn { background:linear-gradient(135deg,#1a1200,#2d2000);border:1px solid rgba(255,140,0,.4);border-left:4px solid var(--warn);border-radius:6px;padding:16px 22px;margin-bottom:16px;display:flex;align-items:flex-start;gap:12px; }
        .alert-icon { font-size:26px;flex-shrink:0; }
        .alert-title { font-size:14px;font-weight:600;margin-bottom:4px; }
        .alert-danger .alert-title { color:#ff6b6b; }
        .alert-warn .alert-title { color:#ffa040; }
        .alert-body { font-size:12px;line-height:1.6; }
        .alert-danger .alert-body { color:#cc9999; }
        .alert-warn .alert-body { color:#cc9966; }
        .alert-ok { background:rgba(45,134,83,.08);border:1px solid rgba(45,134,83,.3);border-radius:6px;padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;gap:12px;font-size:13px;color:var(--ok); }

        /* SECTION */
        .section { margin-bottom:44px; }
        .sec-hdr { display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;padding-bottom:10px;border-bottom:1px solid var(--mist); }
        .sec-title { font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:400;display:flex;align-items:center;gap:10px; }
        .badge { background:var(--teal);color:#fff;font-size:9px;padding:3px 7px;border-radius:2px;font-family:'Space Mono',monospace;letter-spacing:1px; }
        .view-all { color:var(--teal);font-size:12px;font-weight:500; }

        /* WEATHER */
        .w-strip { display:flex;gap:10px;overflow-x:auto;padding-bottom:6px; }
        .w-card { background:#fff;border:1px solid var(--mist);border-radius:8px;padding:14px 18px;min-width:95px;text-align:center;flex-shrink:0; }
        .w-card.today { background:var(--ink);border-color:var(--ink);color:#fff; }
        .w-day { font-size:10px;color:var(--smoke);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px; }
        .w-card.today .w-day { color:var(--gold); }
        .w-ico { font-size:26px;margin-bottom:4px; }
        .w-temp { font-size:18px;font-weight:600; }
        .w-desc { font-size:10px;color:var(--smoke);margin-top:3px; }
        .w-card.today .w-desc { color:#aaa; }
        .w-storm { border-color:var(--danger)!important;background:rgba(220,53,69,.05)!important; }

        /* FLIGHTS */
        .f-filters { display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap; }
        .f-pill { padding:6px 14px;border-radius:20px;border:1px solid var(--mist);background:#fff;font-size:12px;transition:all .2s; }
        .f-pill.active,.f-pill:hover { background:var(--ink);color:#fff;border-color:var(--ink); }
        .f-card { background:#fff;border:1px solid var(--mist);border-radius:8px;padding:18px 22px;margin-bottom:10px;display:grid;grid-template-columns:auto 1fr auto auto;gap:20px;align-items:center;transition:box-shadow .2s; }
        .f-card:hover { box-shadow:0 4px 20px rgba(0,0,0,.08); }
        .f-card.best { border-color:var(--gold);background:linear-gradient(to right,#fffdf5,#fff); }
        .f-airline { font-size:13px;font-weight:600;min-width:100px; }
        .f-code { font-size:11px;color:var(--smoke); }
        .f-route { display:flex;align-items:center;gap:14px; }
        .f-city { font-weight:600;font-size:17px; }
        .f-time { font-size:12px;color:var(--smoke); }
        .f-arrow { display:flex;flex-direction:column;align-items:center;gap:3px; }
        .f-line { width:70px;height:1px;background:var(--mist);position:relative; }
        .f-line::after { content:'▶';position:absolute;right:-6px;top:-6px;font-size:9px;color:var(--smoke); }
        .f-dur { font-size:10px;color:var(--smoke); }
        .f-meta { text-align:right; }
        .f-stops { font-size:11px;color:var(--teal);margin-bottom:3px; }
        .f-price { font-size:24px;font-weight:700; }
        .f-pp { font-size:10px;color:var(--smoke); }
        .bk-btn { background:var(--teal);color:#fff;border:none;padding:9px 18px;border-radius:4px;font-size:12px;font-weight:600;transition:all .2s; }
        .bk-btn:hover { background:var(--teal-l); }
        .best-badge { background:var(--gold);color:var(--ink);font-size:9px;font-weight:700;padding:2px 7px;border-radius:3px;font-family:'Space Mono',monospace; }
        .f-empty { background:#fff;border:1px solid var(--mist);border-radius:8px;padding:32px;text-align:center;color:var(--smoke);font-size:14px; }

        /* CURRENCY */
        .curr-section { background:#fff;border:1px solid var(--mist);border-radius:10px;padding:22px; }
        .curr-hdr { display:flex;align-items:center;justify-content:space-between;margin-bottom:18px; }
        .live-badge { background:rgba(45,134,83,.1);color:var(--ok);padding:4px 10px;border-radius:20px;font-size:11px;display:flex;align-items:center;gap:5px; }
        .live-dot { width:6px;height:6px;background:var(--ok);border-radius:50%;animation:pulse 1.5s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .curr-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:14px; }
        .curr-card { padding:14px;border:1px solid var(--mist);border-radius:8px; }
        .curr-pair { font-size:11px;color:var(--smoke);margin-bottom:3px; }
        .curr-rate { font-size:22px;font-weight:700;margin-bottom:3px; }
        .curr-change { font-size:11px;font-family:'Space Mono',monospace; }
        .up { color:var(--ok); }
        .dn { color:var(--danger); }
        .curr-tip { background:var(--mist);border-radius:6px;padding:12px 16px;margin-top:14px;font-size:12px;color:var(--smoke); }

        /* VISA */
        .two-col { display:grid;grid-template-columns:1fr 1fr;gap:22px; }
        .info-card { background:#fff;border:1px solid var(--mist);border-radius:10px;padding:22px; }
        .info-card h4 { font-size:14px;font-weight:600;margin-bottom:14px;display:flex;align-items:center;gap:8px; }
        .visa-badge { display:inline-block;padding:8px 14px;border-radius:6px;font-size:13px;margin-bottom:12px; }
        .visa-free { background:rgba(45,134,83,.1);border:1px solid rgba(45,134,83,.3);color:var(--ok); }
        .visa-voa { background:rgba(255,140,0,.1);border:1px solid rgba(255,140,0,.3);color:var(--warn); }
        .visa-need { background:rgba(220,53,69,.1);border:1px solid rgba(220,53,69,.3);color:var(--danger); }
        .vd-row { display:flex;justify-content:space-between;font-size:12px;padding:6px 0;border-bottom:1px solid var(--mist);color:var(--smoke); }
        .vd-row span:last-child { color:var(--ink);font-weight:500; }
        .vd-note { background:rgba(58,175,169,.08);border:1px solid rgba(58,175,169,.3);border-radius:6px;padding:10px 14px;margin-top:12px;font-size:12px;color:var(--teal); }

        /* HEALTH */
        .h-item { display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--mist); }
        .h-item:last-child { border:none; }
        .h-dot { width:8px;height:8px;border-radius:50%;flex-shrink:0; }
        .dot-r { background:var(--danger); }
        .dot-y { background:var(--warn); }
        .dot-g { background:var(--ok); }
        .h-name { font-size:13px;font-weight:500;flex:1; }
        .h-stat { font-size:10px;padding:3px 7px;border-radius:3px; }
        .stat-req { background:rgba(220,53,69,.1);color:var(--danger); }
        .stat-rec { background:rgba(255,140,0,.1);color:var(--warn); }
        .stat-ok { background:rgba(45,134,83,.1);color:var(--ok); }

        /* RENTAL */
        .r-tabs { display:flex;gap:0;margin-bottom:18px;border:1px solid var(--mist);border-radius:6px;overflow:hidden;background:#fff;width:fit-content; }
        .r-tab { padding:9px 22px;font-size:13px;font-weight:500;border:none;background:none;transition:all .2s; }
        .r-tab.active { background:var(--ink);color:#fff; }
        .r-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:14px; }
        .r-card { background:#fff;border:1px solid var(--mist);border-radius:8px;padding:18px;display:flex;flex-direction:column;gap:10px; }
        .r-icon { font-size:38px;text-align:center;padding:8px 0; }
        .r-name { font-weight:600;font-size:14px; }
        .r-spec { font-size:11px;color:var(--smoke); }
        .r-price { font-size:20px;font-weight:700;color:var(--teal); }
        .r-feats { display:flex;gap:6px;flex-wrap:wrap; }
        .r-feat { background:var(--mist);padding:3px 7px;border-radius:3px;font-size:10px; }
        .r-btn { background:var(--teal);color:#fff;border:none;padding:9px;border-radius:4px;font-size:12px;font-weight:600;width:100%;transition:background .2s; }
        .r-btn:hover { background:var(--teal-l); }

        /* PLUG */
        .plug-section { background:#fff;border:1px solid var(--mist);border-radius:10px;padding:22px; }
        .plug-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:14px; }
        .plug-card { text-align:center;padding:14px;border:1px solid var(--mist);border-radius:8px; }
        .plug-visual { font-size:42px;margin-bottom:8px; }
        .plug-type { font-size:14px;font-weight:700;color:var(--teal);margin-bottom:3px; }
        .plug-name { font-size:11px;color:var(--smoke);margin-bottom:5px; }
        .plug-volt { font-size:10px;font-family:'Space Mono',monospace;background:var(--mist);padding:2px 7px;border-radius:3px; }
        .p-compat { font-size:10px;margin-top:6px;padding:3px 7px;border-radius:3px; }
        .p-yes { background:rgba(45,134,83,.1);color:var(--ok); }
        .p-adp { background:rgba(255,140,0,.1);color:var(--warn); }

        /* FOOD */
        .food-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:14px; }
        .food-card { background:#fff;border:1px solid var(--mist);border-radius:10px;padding:16px; }
        .food-emoji { font-size:30px;margin-bottom:7px; }
        .food-name { font-weight:600;font-size:14px;margin-bottom:3px; }
        .food-type { font-size:10px;color:var(--smoke);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px; }
        .food-desc { font-size:12px;color:var(--smoke);line-height:1.6; }
        .food-price { font-size:12px;font-weight:600;color:var(--teal);margin-top:6px; }
        .food-dist { font-size:11px;color:var(--smoke);margin-top:3px; }

        /* ERROR STATE */
        .err-box { background:rgba(220,53,69,.06);border:1px solid rgba(220,53,69,.2);border-radius:6px;padding:14px;color:var(--danger);font-size:13px; }

        /* FOOTER */
        footer { background:var(--ink);color:var(--smoke);padding:36px 40px;display:flex;align-items:center;justify-content:space-between; }
        .f-logo { font-family:'Cormorant Garamond',serif;font-size:22px;color:var(--gold);letter-spacing:4px;margin-bottom:4px; }
        .f-copy { font-size:11px;color:rgba(255,255,255,.3); }
        .f-links { display:flex;gap:22px; }
        .f-links a { color:var(--smoke);font-size:11px; }

        @media (max-width:768px) {
          .srow { grid-template-columns:1fr 1fr; }
          .curr-grid { grid-template-columns:1fr 1fr; }
          .two-col { grid-template-columns:1fr; }
          .r-grid,.food-grid,.plug-grid { grid-template-columns:1fr 1fr; }
          .nav-links { display:none; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="nav">
        <div className="logo">W<em>ANDR</em></div>
        <div className="nav-links">
          <a href="#">Uçuşlar</a>
          <a href="#">Oteller</a>
          <a href="#">Aktiviteler</a>
          <a href="#">Kiralık</a>
        </div>
        <button className="nav-btn">Hesap Aç</button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-inner">
          <div className="eyebrow">✦ Canlı Veri · Akıllı Gezi Planlayıcı</div>
          <h1 className="hero-title">Dünyayı <em>Akıllıca</em><br />Keşfet</h1>
          <p className="hero-sub">Gerçek zamanlı uçuş fiyatları, hava durumu, afet uyarıları, vize ve döviz — hepsi canlı verilerle.</p>

          <div className="mode-wrap">
            <div className="mode-toggle">
              <button className={`mode-btn ${mode === 'manual' ? 'active' : ''}`} onClick={() => setMode('manual')}>✏️ Manuel Rota</button>
              <button className={`mode-btn ${mode === 'ai' ? 'active' : ''}`} onClick={() => setMode('ai')}>✨ YZ ile Ucuz Gezi</button>
            </div>
          </div>

          <div className="sbox">
            {mode === 'manual' ? (
              <>
                <div className="srow">
                  <div className="sf">
                    <label>Nereden</label>
                    <input value={form.origin} onChange={e => setForm(f => ({...f, origin: e.target.value.toUpperCase()}))} placeholder="IST" maxLength={3} />
                  </div>
                  <div className="sf">
                    <label>Nereye</label>
                    <select value={form.destination} onChange={e => setForm(f => ({...f, destination: e.target.value}))}>
                      <option value="DPS">🇮🇩 Bali (DPS)</option>
                      <option value="BKK">🇹🇭 Bangkok (BKK)</option>
                      <option value="NRT">🇯🇵 Tokyo (NRT)</option>
                      <option value="LHR">🇬🇧 Londra (LHR)</option>
                      <option value="CDG">🇫🇷 Paris (CDG)</option>
                      <option value="JFK">🇺🇸 New York (JFK)</option>
                    </select>
                  </div>
                  <div className="sf">
                    <label>Pasaport</label>
                    <select value={form.passport} onChange={e => setForm(f => ({...f, passport: e.target.value}))}>
                      <option value="TR">🇹🇷 Türk</option>
                      <option value="CH">🇨🇭 İsviçre</option>
                      <option value="DE">🇩🇪 Alman</option>
                    </select>
                  </div>
                </div>
                <div className="drow">
                  <div className="sf">
                    <label>Gidiş</label>
                    <input type="date" value={form.depart} onChange={e => setForm(f => ({...f, depart: e.target.value}))} />
                  </div>
                  <div className="sf">
                    <label>Dönüş</label>
                    <input type="date" value={form.returnDate} onChange={e => setForm(f => ({...f, returnDate: e.target.value}))} />
                  </div>
                  <div className="sf">
                    <label>Yolcu</label>
                    <select value={form.adults} onChange={e => setForm(f => ({...f, adults: e.target.value}))}>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Yetişkin</option>)}
                    </select>
                  </div>
                </div>
                <div className="opts">
                  <label className="ck"><input type="checkbox" checked={form.hasPet} onChange={e => setForm(f => ({...f, hasPet: e.target.checked}))} /> 🐾 Evcil Hayvan</label>
                  <button className="sbtn" onClick={fetchAll} disabled={loading}>
                    {loading ? '⏳ Yükleniyor...' : '🔍 Planı Oluştur'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{color:'var(--smoke)',fontSize:'12px',marginBottom:'10px',textAlign:'left'}}>
                  💡 Bütçe ve tercihini yaz, YZ en ucuz rotayı bulsun:
                </div>
                <div className="ai-wrap">
                  <textarea className="ai-ta" value={aiQuery} onChange={e => setAiQuery(e.target.value)}
                    placeholder="Örn: Eylülde 2 hafta, 1500€ bütçeyle deniz ve kültür gezisi..." />
                  <button className="sbtn" onClick={fetchAll} disabled={loading}>✨ Öner</button>
                </div>
                <div className="chips">
                  {['🏖️ Ucuz deniz tatili','🏔️ Dağ & doğa','🏛️ Kültür turu','🌏 Uzak doğu','❄️ Kış kaçamağı'].map(c => (
                    <span key={c} className="chip" onClick={() => setAiQuery(c)}>{c}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* LOADING OVERLAY */}
      {loading && (
        <div className="loading-overlay">
          <div style={{fontSize:'44px'}}>🌍</div>
          <div className="l-title">Plan Hazırlanıyor</div>
          <div className="l-sub">{form.origin} → {form.destination} için veriler toplanıyor</div>
          <div className="l-bar">
            <div className="l-fill" style={{width:`${(loadStep / LOAD_STEPS.length) * 100}%`}} />
          </div>
          <div className="l-steps">
            {LOAD_STEPS.map((s, i) => (
              <div key={i} className={`l-step ${i <= loadStep ? 'active' : ''}`}>{s}</div>
            ))}
          </div>
        </div>
      )}

      {/* RESULTS */}
      {results && (
        <div style={{background:'var(--paper)'}}>
          <div className="results">

            {/* DESTINATION HEADER */}
            <div className="dest-header">
              <div className="dest-eyebrow">Gezi Planı · Canlı Verilerle</div>
              <h2 className="dest-title">{results.form.origin} → <em>{results.destInfo.name || results.form.destination}</em></h2>
              <div className="dest-meta">{fmtDate(results.form.depart)} – {fmtDate(results.form.returnDate)} · {results.form.adults} Yetişkin{results.form.hasPet ? ' · 🐾 Evcil Hayvan' : ''}</div>
            </div>

            {/* ALERTS */}
            {results.alerts && (() => {
              const a = results.alerts;
              return (
                <>
                  {a.earthquakes?.length > 0 && (
                    <div className="alert-danger">
                      <div className="alert-icon">🌍</div>
                      <div>
                        <div className="alert-title">⚠️ Deprem Aktivitesi — Bölge İzlemede</div>
                        <div className="alert-body">
                          Son 7 günde bölgede {a.earthquakes.length} kayda değer sismik aktivite tespit edildi.
                          En güçlüsü: <strong>M{a.earthquakes[0]?.magnitude}</strong> — {a.earthquakes[0]?.place}
                          {a.earthquakes[0]?.severity === 'high' && ' ⚠️ Yüksek risk!'}
                        </div>
                      </div>
                    </div>
                  )}
                  {a.volcanic?.length > 0 && (
                    <div className="alert-danger">
                      <div className="alert-icon">🌋</div>
                      <div>
                        <div className="alert-title">Yanardağ Uyarısı</div>
                        <div className="alert-body">{a.volcanic[0]?.title} — {a.volcanic[0]?.country}. Yerel otoritelerin güncellemelerini takip edin.</div>
                      </div>
                    </div>
                  )}
                  {a.weather_alerts?.length > 0 && (
                    <div className="alert-warn">
                      <div className="alert-icon">🌀</div>
                      <div>
                        <div className="alert-title">Hava Uyarısı: {a.weather_alerts[0]?.title}</div>
                        <div className="alert-body">{a.weather_alerts[0]?.country} — Seyahat öncesi kontrol edin.</div>
                      </div>
                    </div>
                  )}
                  {a.summary?.risk_level === 'low' && (
                    <div className="alert-ok">✅ Bölgede şu an aktif bir afet uyarısı bulunmuyor. Normal koşullar geçerli.</div>
                  )}
                </>
              );
            })()}

            {/* WEATHER */}
            {results.weather && (
              <div className="section">
                <div className="sec-hdr">
                  <div className="sec-title">🌤️ Hava Durumu <span className="badge">CANLI</span></div>
                  <span className="view-all">{results.weather.city}, {results.weather.country}</span>
                </div>
                <div className="w-strip">
                  {(results.weather.forecast || []).map((day, i) => (
                    <div key={day.date} className={`w-card ${i === 0 ? 'today' : ''} ${day.is_storm ? 'w-storm' : ''}`}>
                      <div className="w-day">{i === 0 ? 'Bugün' : fmtDate(day.date).replace(/\d{4}/,'').trim()}</div>
                      <div className="w-ico">{day.emoji}{day.is_storm ? '⚠️' : ''}</div>
                      <div className="w-temp">{day.temp_max}°</div>
                      <div className="w-desc">{day.description}</div>
                    </div>
                  ))}
                  {!results.weather.forecast?.length && (
                    <div className="err-box">Hava durumu verisi alınamadı. OpenWeatherMap API key kontrol edin.</div>
                  )}
                </div>
              </div>
            )}

            {/* FLIGHTS */}
            <div className="section">
              <div className="sec-hdr">
                <div className="sec-title">✈️ Uçuşlar <span className="badge">CANLI</span></div>
                <span className="view-all">{results.flights?.total_found || 0} seçenek bulundu</span>
              </div>

              {results.flights?.offers?.length > 0 ? (
                <>
                  <div className="f-filters">
                    <div className="f-pill active">Tümü</div>
                    {[...new Set(results.flights.offers.map(o => o.airline_name))].slice(0,5).map(a => (
                      <div key={a} className="f-pill">{a}</div>
                    ))}
                  </div>
                  {results.flights.offers.map((offer, i) => (
                    <div key={offer.id} className={`f-card ${i === 0 ? 'best' : ''}`}>
                      <div>
                        <div className="f-airline">{offer.airline_name}</div>
                        <div className="f-code">{offer.airline} · {offer.cabin}</div>
                        {i === 0 && <div style={{marginTop:'4px'}}><span className="best-badge">EN UCUZ</span></div>}
                      </div>
                      <div className="f-route">
                        <div>
                          <div className="f-city">{offer.departure.airport}</div>
                          <div className="f-time">{fmtTime(offer.departure.time)}</div>
                        </div>
                        <div className="f-arrow">
                          <div className="f-line" />
                          <div className="f-dur">{parseDuration(offer.duration)}</div>
                        </div>
                        <div>
                          <div className="f-city">{offer.arrival.airport}</div>
                          <div className="f-time">{fmtTime(offer.arrival.time)}</div>
                        </div>
                      </div>
                      <div className="f-meta">
                        <div className="f-stops">{offer.stops === 0 ? 'Direkt' : `${offer.stops} aktarma · ${offer.stop_airports.join(', ')}`}</div>
                        {offer.seats_left <= 5 && <div style={{color:'var(--danger)',fontSize:'11px'}}>⚠️ Son {offer.seats_left} koltuk!</div>}
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div className="f-price">{offer.price.currency} {parseFloat(offer.price.total).toLocaleString('tr-TR')}</div>
                        <div className="f-pp">toplam</div>
                        <button className="bk-btn" style={{marginTop:'8px'}}>Rezerve Et</button>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="f-empty">
                  {results.flights?.error
                    ? `❌ ${results.flights.error}`
                    : 'Bu tarihler için uçuş bulunamadı. Amadeus API key kontrol edin veya tarihleri değiştirin.'}
                </div>
              )}
            </div>

            {/* CURRENCY */}
            {results.currency && (
              <div className="section">
                <div className="sec-hdr">
                  <div className="sec-title">💱 Döviz Kurları <span className="badge">CANLI</span></div>
                </div>
                <div className="curr-section">
                  <div className="curr-hdr">
                    <div style={{fontSize:'13px',color:'var(--smoke)'}}>
                      Son güncelleme: {new Date(results.currency.last_updated).toLocaleString('tr-TR')}
                    </div>
                    <div className="live-badge"><div className="live-dot" /> CANLI</div>
                  </div>
                  <div className="curr-grid">
                    {Object.entries(results.currency.rates || {}).map(([code, data]) => (
                      <div key={code} className="curr-card">
                        <div className="curr-pair">EUR / {code}</div>
                        <div className="curr-rate">{data.formatted}</div>
                        <div className="curr-change up">↑ Canlı kur</div>
                      </div>
                    ))}
                  </div>
                  <div className="curr-tip">
                    💡 Endonezya'da en iyi kuru merkezi bölge büfelerinden alın. Havalimanını tercih etmeyin — kur %10–20 düşük olabilir. ATM'de "yerel para birimi" seçin.
                  </div>
                </div>
              </div>
            )}

            {/* VISA + HEALTH */}
            <div className="section">
              <div className="sec-hdr">
                <div className="sec-title">🛂 Vize & 💉 Sağlık</div>
              </div>
              <div className="two-col">
                {/* VISA */}
                <div className="info-card">
                  <h4>🛂 Vize Bilgisi — {results.form.passport} Pasaportu</h4>
                  {results.visa?.found ? (
                    <>
                      <div className={`visa-badge ${results.visa.type === 'free' ? 'visa-free' : results.visa.type === 'voa' || results.visa.type === 'eta' ? 'visa-voa' : 'visa-need'}`}>
                        {results.visa.type === 'free' ? '✅ Vizesiz Giriş' :
                         results.visa.type === 'voa' ? '🟡 ' + results.visa.name :
                         results.visa.type === 'eta' ? '🔵 ' + results.visa.name :
                         '🔴 ' + results.visa.name}
                      </div>
                      <div className="vd-row"><span>Kalış Süresi</span><span>{results.visa.duration} gün</span></div>
                      {results.visa.fee && <div className="vd-row"><span>Ücret</span><span>{results.visa.fee}</span></div>}
                      {results.visa.extendable && <div className="vd-row"><span>Uzatılabilir mi?</span><span>✅ Evet</span></div>}
                      {results.visa.notes && <div className="vd-note">💡 {results.visa.notes}</div>}
                      {results.visa.link && <div style={{marginTop:'8px',fontSize:'12px'}}><a href={results.visa.link} target="_blank" style={{color:'var(--teal)'}}>🔗 Online başvuru →</a></div>}
                    </>
                  ) : (
                    <div className="err-box">{results.visa?.message || 'Vize bilgisi bulunamadı.'}</div>
                  )}
                </div>

                {/* HEALTH */}
                <div className="info-card">
                  <h4>💉 Aşı & Sağlık Uyarıları</h4>
                  {[
                    { dot:'dot-r', name:'Tifo', status:'stat-req', label:'Zorunlu' },
                    { dot:'dot-y', name:'Hepatit A & B', status:'stat-rec', label:'Önerilen' },
                    { dot:'dot-y', name:'Sıtma Profilaksisi', status:'stat-rec', label:'Bazı bölgeler' },
                    { dot:'dot-y', name:'Kuduz', status:'stat-rec', label:'Uzun seyahat' },
                    { dot:'dot-y', name:'Dengue Humması', status:'stat-rec', label:'Sivrisinek önlemi' },
                    { dot:'dot-g', name:'COVID-19', status:'stat-ok', label:'Gereksinim yok' },
                  ].map(h => (
                    <div key={h.name} className="h-item">
                      <div className={`h-dot ${h.dot}`} />
                      <div className="h-name">{h.name}</div>
                      <div className={`h-stat ${h.status}`}>{h.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RENTALS */}
            <div className="section">
              <div className="sec-hdr">
                <div className="sec-title">🚗 Araç Kiralama</div>
              </div>
              <div className="r-tabs">
                {[['car','🚗 Araba'],['moto','🏍️ Motor'],['bike','🚲 Bisiklet']].map(([k,l]) => (
                  <button key={k} className={`r-tab ${activeRental === k ? 'active' : ''}`} onClick={() => setActiveRental(k)}>{l}</button>
                ))}
              </div>
              <div className="r-grid">
                {activeRental === 'car' && [
                  {icon:'🚙',name:'Toyota Avanza',spec:'Otomatik · 7 kişilik · A/C',price:'€18',feats:['🐾 Evcil hayvan OK','📱 GPS','Sigorta dahil']},
                  {icon:'🚗',name:'Honda Jazz',spec:'Otomatik · 5 kişilik · Ekonomik',price:'€12',feats:['⛽ Yakıt verimli']},
                  {icon:'🚐',name:'Minibüs + Şoför',spec:'12 kişilik · Şoförlü',price:'€55',feats:['🗣️ İngilizce şoför','🐾 Evcil hayvan OK']},
                ].map(r => <RentalCard key={r.name} {...r} />)}
                {activeRental === 'moto' && [
                  {icon:'🛵',name:'Honda Scoopy',spec:'125cc · Otomatik scooter',price:'€5',feats:['⛑️ Kask dahil']},
                  {icon:'🏍️',name:'Yamaha NMAX',spec:'155cc · Premium',price:'€8',feats:['USB şarj','Depolama']},
                  {icon:'🏍️',name:'Royal Enfield 350',spec:'350cc · Kıyı turu',price:'€18',feats:['Ehliyet gerekli']},
                ].map(r => <RentalCard key={r.name} {...r} />)}
                {activeRental === 'bike' && [
                  {icon:'🚲',name:'City Bisiklet',spec:'3 vites · Rahat',price:'€3',feats:['Kilit dahil']},
                  {icon:'🚵',name:'MTB Bisiklet',spec:'21 vites · Ubud rotaları',price:'€8',feats:['Kask dahil','Harita dahil']},
                  {icon:'⚡',name:'E-Bisiklet',spec:'Elektrikli · 60km menzil',price:'€14',feats:['Şarj dahil','GPS']},
                ].map(r => <RentalCard key={r.name} {...r} />)}
              </div>
            </div>

            {/* PLUG */}
            <div className="section">
              <div className="sec-hdr">
                <div className="sec-title">🔌 Priz & Voltaj</div>
                <span className="view-all">Endonezya: 220V / 50Hz</span>
              </div>
              <div className="plug-section">
                <div style={{fontSize:'13px',color:'var(--smoke)',lineHeight:'1.6'}}>Endonezya voltajı Türkiye ile aynı (220V). Tip C ve F priizleri yaygındır — Türk fişiniz direkt çalışır.</div>
                <div className="plug-grid">
                  {[
                    {visual:'🔌',type:'Tip C',name:'Europlug (2 yuvarlak)',volt:'220V · 50Hz',compat:'p-yes',ctext:'✅ TR Uyumlu'},
                    {visual:'🔌',type:'Tip F',name:'Schuko (topraklı)',volt:'220V · 50Hz',compat:'p-yes',ctext:'✅ TR Uyumlu'},
                    {visual:'🔌',type:'Tip G',name:'İngiliz priz (3 pim)',volt:'220V · 50Hz',compat:'p-adp',ctext:'⚡ Adaptör Gerek'},
                    {visual:'💡',type:'Öneri',name:'Universal Travel Adapter',volt:'Tüm tipler',compat:'p-yes',ctext:'✅ Her yerde'},
                  ].map(p => (
                    <div key={p.type} className="plug-card">
                      <div className="plug-visual">{p.visual}</div>
                      <div className="plug-type">{p.type}</div>
                      <div className="plug-name">{p.name}</div>
                      <div className="plug-volt">{p.volt}</div>
                      <div className={`p-compat ${p.compat}`}>{p.ctext}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FOOD */}
            <div className="section">
              <div className="sec-hdr">
                <div className="sec-title">🍜 Yerel Yemek Önerileri</div>
              </div>
              <div className="food-grid">
                {[
                  {emoji:'🍛',name:'Nasi Goreng',type:'Endonezya Klasiği',desc:'Kızarmış pirinç, baharat ve yumurtayla. Her warungda bulunur.',price:'~€1.5–3',dist:'📍 Warung Eny — 200m'},
                  {emoji:'🥜',name:'Satay Lilit',type:'Sokak Yemeği',desc:'Bambu şişe sarılı baharat harmanı balık köftesi. Fıstık sosuyla.',price:'~€2–4',dist:'📍 Night Market — 600m'},
                  {emoji:'🌴',name:'Jamu İçeceği',type:'Geleneksel',desc:'Zerdeçal, zencefil ve kurkuma ile hazırlanan Bali şifalı içeceği.',price:'~€0.5–1',dist:'📍 Pasar Seminyak — 300m'},
                  {emoji:'🦞',name:'Jimbaran BBQ',type:'Romantik Akşam',desc:'Sahil kenarında taze deniz ürünleri. Gün batımı manzarasıyla.',price:'~€15–30',dist:'📍 Jimbaran Beach — 8km'},
                  {emoji:'🍵',name:'Kopi Luwak',type:'Prestij Kahve',desc:'Dünyaca ünlü Bali luwak kahvesi. Ubud plantasyonlarında üretilir.',price:'~€3–6 / fincan',dist:'📍 Ubud — 25km'},
                  {emoji:'🍌',name:'Pisang Goreng',type:'Sokak Atıştırması',desc:'Kızarmış muz — Bali sokaklarının vazgeçilmezi. Tatlı & çıtır.',price:'~€0.5',dist:'📍 Her köşede'},
                ].map(f => (
                  <div key={f.name} className="food-card">
                    <div className="food-emoji">{f.emoji}</div>
                    <div className="food-name">{f.name}</div>
                    <div className="food-type">{f.type}</div>
                    <div className="food-desc">{f.desc}</div>
                    <div className="food-price">{f.price}</div>
                    <div className="food-dist">{f.dist}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      <footer>
        <div>
          <div className="f-logo">WANDR</div>
          <div className="f-copy">Veriler canlı API'lardan çekilmektedir. © 2025</div>
        </div>
        <div className="f-links">
          <a href="#">Gizlilik</a>
          <a href="#">API Kaynakları</a>
          <a href="#">İletişim</a>
        </div>
      </footer>
    </>
  );
}

function RentalCard({ icon, name, spec, price, feats }) {
  return (
    <div className="r-card">
      <div className="r-icon">{icon}</div>
      <div>
        <div className="r-name">{name}</div>
        <div className="r-spec">{spec}</div>
      </div>
      <div className="r-price">{price} <span style={{fontSize:'11px',color:'var(--smoke)',fontWeight:'400'}}>/gün</span></div>
      <div className="r-feats">{feats.map(f => <span key={f} className="r-feat">{f}</span>)}</div>
      <button className="r-btn">Kirala</button>
    </div>
  );
}
