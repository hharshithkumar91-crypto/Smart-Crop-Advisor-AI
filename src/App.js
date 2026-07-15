import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Auth, { SESSION_KEY } from './Auth';
import { getTotalUsers, getOnlineUsers, setUserOffline } from './firebase';
import {
  COMMODITY_CATEGORIES, ALL_CROPS, BASE_PRICES,
  MANDI_DB, MANDI_MULTIPLIERS, INTL_PRICES,
  INPUT_STATE_MULTIPLIER, INDIA_LOCATIONS, ALL_STATES,
  WEATHER_DATA, GOVT_SCHEMES, MCX_COMMODITIES, FUEL_BASE_PRICES
} from './data';

/* ══════════════════════════════════════════════════════════
   SMART CROP ADVISOR AI — PROFESSIONAL FARMING ECOSYSTEM
   Full Featured: Live Prices • Weather • Schemes • MCX
══════════════════════════════════════════════════════════ */

const SCHEME_ELIGIBILITY = (land, sector, aadhaar, bank, isSCST) => {
  const all = land > 0;
  const small = land <= 2;
  const results = [];
  if (all && aadhaar && bank) results.push('PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)');
  if (all && aadhaar) results.push('PM Fasal Bima Yojana (PMFBY)');
  if (all) results.push('Soil Health Card Scheme');
  if (all && bank) results.push('Kisan Credit Card (KCC)');
  if (all && aadhaar && bank) results.push('National Agriculture Market (eNAM)');
  if (small) results.push('PM Krishi Sinchai Yojana (PMKSY)');
  if (all) results.push('National Food Security Mission (NFSM)');
  if (all && aadhaar) results.push('Sub-Mission on Agricultural Mechanization (SMAM)');
  if (land >= 2) results.push('Paramparagat Krishi Vikas Yojana (PKVY)');
  if (all && aadhaar && bank) results.push('PM-AASHA — MSP Price Protection');
  if (sector === 'fisheries') results.push('PM Matsya Sampada Yojana');
  if (isSCST) results.push('SMAM Extra 80% Subsidy (SC/ST/Women Farmers)');
  return results;
};

// ── Utility: get today's day label for weather bar
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const today = new Date().getDay();

export default function App() {
  /* ── Auth state ─────────────────────────────────── */
  const [user, setUser]   = useState(null);

  /* ── Nav ────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState('overview');

  /* ── Live price engine ──────────────────────────── */
  const [livePrices, setLivePrices]   = useState({});
  const [priceTrend, setPriceTrend]   = useState({});
  const [priceFlash, setPriceFlash]   = useState({});
  const [liveMcx, setLiveMcx]         = useState({});
  const [mcxTrend, setMcxTrend]       = useState({});

  /* ── Location state ─────────────────────────────── */
  const [selState,    setSelState]    = useState('Telangana');
  const [selDistrict, setSelDistrict] = useState('Hyderabad');
  const [selMandal,   setSelMandal]   = useState('Secunderabad');

  /* ── Market tab ─────────────────────────────────── */
  const [marketCrop,     setMarketCrop]     = useState('Tomato');
  const [marketCategory, setMarketCategory] = useState('All');
  const [marketSearch,   setMarketSearch]   = useState('');
  const [transportCost,  setTransportCost]  = useState('2');
  const [inputsState,    setInputsState]    = useState('Telangana');

  /* ── Price alert ─────────────────────────────────── */
  const [alertCrop,      setAlertCrop]      = useState('Tomato');
  const [alertThreshold, setAlertThreshold] = useState('');
  const [alertEmail,     setAlertEmail]     = useState('');
  const [alertPhone,     setAlertPhone]     = useState('');
  const [alertSending,   setAlertSending]   = useState(false);
  const [alertSent,      setAlertSent]      = useState(false);

  /* ── Crop advisor ─────────────────────────────────── */
  const [cropInputs,    setCropInputs]    = useState({ soil:'Black', water:'Medium', season:'Kharif', area:'5' });
  const [recommendation, setRecommendation] = useState(null);

  /* ── Leaf scanner ────────────────────────────────── */
  const [scanTarget,  setScanTarget]   = useState('spot');
  const [scanning,    setScanning]     = useState(false);
  const [scanResult,  setScanResult]   = useState(null);

  /* ── Ledger ──────────────────────────────────────── */
  const [ledger,      setLedger]       = useState([
    { id:1, type:'expense', category:'Seeds',      desc:'Bought Tomato Hybrid Seeds',     amount:1200,  date:'2024-06-01' },
    { id:2, type:'expense', category:'Fertilizer', desc:'Purchased Urea 2 bags',          amount:2800,  date:'2024-06-05' },
    { id:3, type:'income',  category:'Sales',      desc:'Sold 200kg Tomato at Mandi',     amount:4400,  date:'2024-06-15' },
  ]);
  const [ledgerInput, setLedgerInput]  = useState({ type:'expense', category:'Fertilizer', desc:'', amount:'' });

  /* ── Chat ────────────────────────────────────────── */
  const [chatMessages, setChatMessages] = useState([
    { sender:'bot', text:'🌾 Namaste! I am your Smart Crop AI. Ask me about weather, fertilizers, crop prices, or disease treatment!' }
  ]);
  const [chatInput,    setChatInput]    = useState('');
  const [isRecording,  setIsRecording]  = useState(false);

  /* ── Govt Schemes ────────────────────────────────── */
  const [schemeLand,   setSchemeLand]   = useState('5');
  const [schemeState,  setSchemeState]  = useState('Telangana');
  const [schemeSector, setSchemeSector] = useState('Agriculture');
  const [schemeAadhaar,setSchemeAadhaar]= useState(true);
  const [schemeBank,   setSchemeBank]   = useState(true);
  const [schemeSCST,   setSchemeSCST]   = useState(false);

  /* ── Language ──────────────────────────────────── */
  const [lang, setLang] = useState('en');

  /* ── User Stats from Firestore ───────────────── */
  const [totalUsers, setTotalUsers] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(0);

  const chatEndRef = useRef(null);

  /* ══ EFFECTS ══════════════════════════════════════ */

  // Load session on mount
  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) try { setUser(JSON.parse(saved)); } catch(e) {}
    // Fetch user stats from Firestore
    async function fetchStats() {
      const total = await getTotalUsers();
      const online = await getOnlineUsers();
      setTotalUsers(total);
      setOnlineUsers(online);
    }
    fetchStats();
    // Refresh stats every 30s
    const statsInterval = setInterval(fetchStats, 30000);
    // Set user offline when page closes
    const handleBeforeUnload = () => {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        try {
          const u = JSON.parse(session);
          if (u.phone) setUserOffline(u.phone);
        } catch(e) {}
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => { clearInterval(statsInterval); window.removeEventListener('beforeunload', handleBeforeUnload); };
  }, []);

  // Initialize live prices from BASE_PRICES
  useEffect(() => {
    const init = {};
    ALL_CROPS.forEach(c => { init[c] = BASE_PRICES[c] || 20; });
    setLivePrices(init);
    const mcxInit = {};
    if (MCX_COMMODITIES) MCX_COMMODITIES.forEach(m => { mcxInit[m.name] = m.price; });
    setLiveMcx(mcxInit);
  }, []);

  // Live price ticker engine — ticks every 3 seconds
  useEffect(() => {
    if (!ALL_CROPS.length) return;
    const interval = setInterval(() => {
      const count = Math.floor(Math.random() * 5) + 3;
      const picked = [...ALL_CROPS].sort(() => Math.random() - 0.5).slice(0, count);
      setLivePrices(prev => {
        const next = { ...prev };
        const trend = {};
        const flash = {};
        picked.forEach(crop => {
          const old = prev[crop] || BASE_PRICES[crop] || 20;
          const change = (Math.random() * 0.04 - 0.02);
          const newP = Math.max(1, +(old * (1 + change)).toFixed(2));
          next[crop] = newP;
          trend[crop] = newP > old ? 'up' : newP < old ? 'down' : 'flat';
          flash[crop] = true;
        });
        setPriceTrend(prev => ({ ...prev, ...trend }));
        setPriceFlash(prev => ({ ...prev, ...flash }));
        setTimeout(() => setPriceFlash(prev => {
          const clr = { ...prev };
          picked.forEach(c => { clr[c] = false; });
          return clr;
        }), 800);
        return next;
      });
      // MCX tick
      if (MCX_COMMODITIES) {
        setLiveMcx(prev => {
          const next = { ...prev };
          const trendUpd = {};
          MCX_COMMODITIES.forEach(m => {
            const old = prev[m.name] || m.price;
            const ch = (Math.random() * 0.02 - 0.01);
            const newP = Math.max(1, +(old * (1 + ch)).toFixed(2));
            next[m.name] = newP;
            trendUpd[m.name] = newP > old ? 'up' : 'down';
          });
          setMcxTrend(prev => ({ ...prev, ...trendUpd }));
          return next;
        });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [chatMessages]);

  /* ══ HELPER FUNCTIONS ════════════════════════════ */

  const getWeather = (state) => {
    if (WEATHER_DATA && WEATHER_DATA[state]) return WEATHER_DATA[state];
    const temps = { Telangana:34, 'Andhra Pradesh':35, Maharashtra:32, Karnataka:30, 'Tamil Nadu':33, Gujarat:36, Punjab:38, 'West Bengal':31, Kerala:29 };
    const t = temps[state] || 32;
    return {
      temp:`${t}°C`, humidity:'68%', rain:'45%', wind:'14 km/h', condition:'Partly Cloudy ⛅',
      advisory:`Monitor soil moisture in ${state}. Ideal conditions for Kharif sowing.`,
      forecast: DAYS.map((d,i) => ({ day: DAYS[(today+i)%7], icon: i===2?'🌧':i===4?'⛈':i===0?'☀️':'⛅', high: t + Math.floor(Math.random()*4)-2, low: t-6 + Math.floor(Math.random()*3) }))
    };
  };

  const handleStateChange = (s) => {
    setSelState(s);
    const dists = Object.keys(INDIA_LOCATIONS[s] || {});
    const d = dists[0] || '';
    setSelDistrict(d);
    const mandals = (INDIA_LOCATIONS[s]?.[d]) || [];
    setSelMandal(mandals[0] || '');
  };
  const handleDistrictChange = (d) => {
    setSelDistrict(d);
    const mandals = (INDIA_LOCATIONS[selState]?.[d]) || [];
    setSelMandal(mandals[0] || '');
  };

  const getBestMandi = () => {
    const base = livePrices[marketCrop] || BASE_PRICES[marketCrop] || 20;
    const trans = parseFloat(transportCost) || 0;
    if (!MANDI_DB || !MANDI_MULTIPLIERS) return { best:'Hyderabad', details:[], maxVal:base };
    const rows = MANDI_DB.map(m => {
      const price = +(base * (MANDI_MULTIPLIERS[m.name] || 1)).toFixed(2);
      const log   = +(trans + m.dist * 0.0015).toFixed(2);
      const net   = +(price - log).toFixed(2);
      return { ...m, price, log, net };
    }).sort((a,b) => b.net - a.net);
    return { best: rows[0]?.name || 'Hyderabad', details: rows, maxVal: rows[0]?.net || base };
  };

  const getFilteredCrops = () => {
    let list = marketCategory === 'All'
      ? Object.entries(COMMODITY_CATEGORIES).flatMap(([cat,items]) => items.map(i => ({ item:i, cat })))
      : (COMMODITY_CATEGORIES[marketCategory]||[]).map(i => ({ item:i, cat:marketCategory }));
    if (marketSearch.trim()) {
      const q = marketSearch.toLowerCase();
      list = list.filter(c => c.item.toLowerCase().includes(q));
    }
    return list;
  };

  const getMatchingSchemes = () => {
    const land = parseFloat(schemeLand) || 0;
    const eligible = SCHEME_ELIGIBILITY(land, schemeSector.toLowerCase(), schemeAadhaar, schemeBank, schemeSCST);
    if (!GOVT_SCHEMES) return [];
    return GOVT_SCHEMES.filter(scheme =>
      eligible.some(name =>
        scheme.name.toLowerCase().includes(name.split(' —')[0].split(' (')[0].toLowerCase()) ||
        name.toLowerCase().includes(scheme.name.split(' —')[0].split(' (')[0].toLowerCase())
      )
    );
  };

  const handleRecommendCrop = (e) => {
    e.preventDefault();
    const { soil, water, season } = cropInputs;
    let crop='Tomato', profit=68000, risk='Medium', demand='High', fertilizer='NPK 19-19-19 (25kg/acre)', yield_='18 Quintals/Acre';
    if (soil==='Black' && water==='Heavy') { crop='Cotton'; profit=92000; risk='Low'; demand='Very High'; fertilizer='NPK 4:2:1 + Urea 50kg/acre'; yield_='32 Quintals/Acre'; }
    else if (soil==='Red' && season==='Kharif') { crop='Groundnut'; profit=72000; risk='Medium'; demand='High'; fertilizer='Gypsum 200kg + DAP 50kg/acre'; yield_='22 Quintals/Acre'; }
    else if (soil==='Sandy') { crop='Watermelon'; profit=85000; risk='High'; demand='High'; fertilizer='Organic Compost 5T + Potash 40kg/acre'; yield_='15 Tons/Acre'; }
    else if (soil==='Clay' && water==='Heavy') { crop='Paddy (Rice)'; profit=91000; risk='Low'; demand='Very High'; fertilizer='Urea 75kg + MOP 30kg + Zinc Sulphate'; yield_='28 Quintals/Acre'; }
    else if (season==='Rabi') { crop='Wheat'; profit=62000; risk='Low'; demand='Very High'; fertilizer='DAP 50kg + Urea 60kg/acre'; yield_='25 Quintals/Acre'; }
    setRecommendation({ crop, profit: profit.toLocaleString('en-IN'), risk, demand, fertilizer, yieldPredict:yield_ });
  };

  const triggerScan = () => {
    setScanning(true); setScanResult(null);
    setTimeout(() => {
      setScanning(false);
      if (scanTarget==='spot') setScanResult({ disease:'Early Leaf Spot (Alternaria)', confidence:'96.4%', danger:'Medium', medicine:'Neem Oil 15ml/L or Copper Oxychloride 2.5g/L fungicide spray.', prevention:'Remove lower affected leaves. Avoid overhead irrigation.' });
      else if (scanTarget==='blast') setScanResult({ disease:'Rice Blast Fungus (Magnaporthe oryzae)', confidence:'93.1%', danger:'High', medicine:'Tricyclazole 75WP at 0.6g/L or Kasugamycin fungicide.', prevention:'Avoid excess Nitrogen. Maintain optimal soil moisture.' });
      else setScanResult({ disease:'Healthy Leaf — No Infection Detected', confidence:'98.9%', danger:'None', medicine:'No treatment needed. Continue normal crop cycle.', prevention:'Regular weeding and soil moisture inspection.' });
    }, 2500);
  };

  const handleAddLedger = (e) => {
    e.preventDefault();
    if (!ledgerInput.desc || !ledgerInput.amount) return;
    setLedger(prev => [...prev, { id:Date.now(), ...ledgerInput, amount:parseFloat(ledgerInput.amount), date:new Date().toISOString().split('T')[0] }]);
    setLedgerInput({ type:'expense', category:'Fertilizer', desc:'', amount:'' });
  };

  const handleChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput; setChatInput('');
    setChatMessages(prev => [...prev, { sender:'user', text }]);
    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = '🤖 I\'m analyzing your query. Try asking about weather, fertilizers, prices, or crop diseases!';
      if (lower.includes('rain') || lower.includes('weather')) reply = `🌦 Current weather in ${selMandal}, ${selState}: ${getWeather(selState).temp}, Humidity: ${getWeather(selState).humidity}. Rain chance: ${getWeather(selState).rain}. ${getWeather(selState).advisory}`;
      else if (lower.includes('price') || lower.includes('mandi')) reply = `💰 Live price for Tomato: ₹${(livePrices['Tomato']||22).toFixed(2)}/kg at Hyderabad Mandi. Best export market: Bengaluru Mandi (₹${((livePrices['Tomato']||22)*1.25).toFixed(2)}/kg).`;
      else if (lower.includes('fertilizer') || lower.includes('urea')) reply = `🌱 For Black Cotton soil: Apply NPK (4:2:1) + Urea 50kg/acre. Current Urea price: ₹${(livePrices['Urea (50kg bag)']||1400).toFixed(0)}/bag at ${selState} mandis.`;
      else if (lower.includes('scheme') || lower.includes('subsidy')) reply = `🎯 Eligible schemes for ${selState} farmers: PM-KISAN (₹6000/yr), PMFBY crop insurance, PMKSY irrigation subsidy. Check Schemes tab for full details!`;
      else if (lower.includes('kisan') || lower.includes('pm')) reply = `✅ PM-KISAN Samman Nidhi: ₹6,000/year in 3 installments for all landholding farmers. Aadhaar + Bank Account required. Apply at pmkisan.gov.in`;
      setChatMessages(prev => [...prev, { sender:'bot', text:reply }]);
    }, 800);
  };

  const handleVoice = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      const sampleQ = 'What is the best fertilizer for my cotton crop?';
      setChatMessages(prev => [...prev, { sender:'user', text:`🎙️ "${sampleQ}"` }]);
      setTimeout(() => setChatMessages(prev => [...prev, { sender:'bot', text:'🌱 For Cotton: Apply NPK 4:2:1 ratio. Add Boron 1kg/acre at flowering. Avoid excess Nitrogen to prevent boll rot. Current DAP price: ₹1,350/bag.' }]), 800);
    }, 2500);
  };

  const handleAlert = (e) => {
    e.preventDefault();
    if (!alertEmail && !alertPhone) return;
    setAlertSending(true);
    setTimeout(() => { setAlertSending(false); setAlertSent(true); setTimeout(() => setAlertSent(false), 5000); }, 1500);
  };

  const totalIncome  = ledger.filter(i=>i.type==='income').reduce((s,i)=>s+i.amount,0);
  const totalExpense = ledger.filter(i=>i.type==='expense').reduce((s,i)=>s+i.amount,0);
  const netReturn    = totalIncome - totalExpense;

  const weather = getWeather(selState);
  const mandiResult = getBestMandi();
  const filteredCrops = getFilteredCrops();
  const matchingSchemes = getMatchingSchemes();

  const districts = Object.keys(INDIA_LOCATIONS[selState] || {});
  const mandals   = (INDIA_LOCATIONS[selState]?.[selDistrict]) || [];


  /* ══ RENDER ══════════════════════════════════════ */

  if (!user) return <Auth onLogin={u => setUser(u)} />;

  const TABS = [
    { id:'overview',  icon:'🏡', label:'Farm Overview' },
    { id:'advisor',   icon:'🌱', label:'AI Crop Advisor' },
    { id:'scanner',   icon:'🔬', label:'Disease Scanner' },
    { id:'market',    icon:'📈', label:'Market & Prices' },
    { id:'expenses',  icon:'💰', label:'Expense Ledger' },
    { id:'chat',      icon:'🤖', label:'AI Chat & Voice' },
    { id:'schemes',   icon:'🏛', label:'Govt Schemes' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:'#101010', fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif", color:'#f1f1f1' }}>

      {/* ═══ Global Styles ═══ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'Inter',sans-serif!important; background:#101010; color:#f1f1f1; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:#1a1a1a; }
        ::-webkit-scrollbar-thumb { background:#333; border-radius:3px; }
        @keyframes priceUp   { 0%{background:rgba(34,197,94,0.25)} 100%{background:transparent} }
        @keyframes priceDown { 0%{background:rgba(239,68,68,0.25)} 100%{background:transparent} }
        @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes ticker    { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes fadeIn    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scanLine  { 0%{top:0} 100%{top:100%} }

        .card { background:#1a1a1a; border:1px solid #2a2a2a; border-radius:12px; padding:1.5rem; animation:fadeIn .3s ease; transition:border-color .2s; }
        .card:hover { border-color:#333; }
        .stat-card { background:#1a1a1a; border:1px solid #2a2a2a; border-radius:12px; padding:1.25rem 1.5rem; display:flex; flex-direction:column; gap:.4rem; transition:border-color .2s; }
        .stat-card:hover { border-color:#3a3a3a; }
        .btn { display:inline-flex; align-items:center; justify-content:center; gap:.4rem; padding:.6rem 1.2rem; border-radius:8px; border:none; cursor:pointer; font-weight:600; font-size:.875rem; transition:all .2s; font-family:'Inter',sans-serif; }
        .btn-primary { background:#2563eb; color:#fff; }
        .btn-primary:hover { background:#1d4ed8; }
        .btn-outline { background:transparent; border:1px solid #333; color:#ccc; }
        .btn-outline:hover { background:#222; border-color:#555; color:#fff; }
        .input { width:100%; padding:.6rem .85rem; background:#1a1a1a; border:1px solid #333; border-radius:8px; color:#f1f1f1; font-size:.875rem; outline:none; font-family:'Inter',sans-serif; transition:border-color .2s; }
        .input:focus { border-color:#2563eb; box-shadow:0 0 0 3px rgba(37,99,235,.15); }
        select.input option { background:#1a1a1a; color:#f1f1f1; }
        label.fld { display:block; font-size:.75rem; font-weight:600; color:#888; margin-bottom:.35rem; text-transform:uppercase; letter-spacing:.06em; }
        .up { color:#22c55e; } .down { color:#ef4444; } .flat { color:#888; }
        .nav-btn { display:flex; align-items:center; gap:.85rem; padding:.75rem 1rem; border-radius:10px; border:none; cursor:pointer; font-size:.9rem; font-weight:500; background:transparent; color:#888; transition:all .18s; width:100%; text-align:left; font-family:'Inter',sans-serif; }
        .nav-btn:hover { background:#1f1f1f; color:#f1f1f1; }
        .nav-btn.active { background:#1f1f1f; color:#f1f1f1; font-weight:700; }
        .nav-icon { font-size:1.15rem; width:24px; text-align:center; }
        .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; }
        .grid3 { display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; }
        .grid4 { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; }
        @media(max-width:1100px){ .grid4{grid-template-columns:repeat(2,1fr)} }
        @media(max-width:900px) { .grid3{grid-template-columns:1fr 1fr} }
        @media(max-width:700px) { .grid2,.grid3,.grid4{grid-template-columns:1fr} }
        .price-row { display:flex; justify-content:space-between; align-items:center; padding:.5rem .7rem; border-radius:7px; font-size:.82rem; transition:background .4s; }
        .price-row.flash-up   { animation:priceUp .8s ease; }
        .price-row.flash-down { animation:priceDown .8s ease; }
        .scheme-card { background:#1a1a1a; border:1px solid #2a2a2a; border-radius:10px; padding:1.1rem; display:flex; flex-direction:column; gap:.65rem; transition:border-color .2s; }
        .scheme-card:hover { border-color:#3a3a3a; }
        .chat-bubble { padding:.7rem 1rem; border-radius:12px; max-width:80%; font-size:.875rem; line-height:1.55; animation:fadeIn .3s ease; }
        .chat-bubble.user { background:#1e3a5f; border:1px solid #1e4080; align-self:flex-end; }
        .chat-bubble.bot  { background:#1f1f1f; border:1px solid #2a2a2a; align-self:flex-start; }
        .scan-btn { border:1px solid #333; border-radius:8px; background:#1a1a1a; color:#ccc; padding:.5rem 1rem; cursor:pointer; font-size:.8rem; font-weight:500; transition:all .2s; font-family:'Inter',sans-serif; }
        .scan-btn:hover { border-color:#555; color:#f1f1f1; }
        .scan-btn.active { background:#1e3a5f; border-color:#2563eb; color:#fff; }
        .ledger-item { display:flex; justify-content:space-between; align-items:center; padding:.65rem .9rem; border-radius:8px; font-size:.82rem; background:#1f1f1f; border:1px solid #2a2a2a; }
        .section-title { font-size:.95rem; font-weight:700; color:#f1f1f1; display:flex; align-items:center; gap:.5rem; margin-bottom:1.1rem; }
        .mcx-ticker-wrap { background:#151515; border-bottom:1px solid #222; padding:.45rem 0; overflow:hidden; flex-shrink:0; }
        .mcx-ticker { display:inline-flex; gap:2rem; animation:ticker 80s linear infinite; white-space:nowrap; }
        .mcx-item { display:inline-flex; align-items:center; gap:.4rem; font-size:.75rem; font-weight:600; font-family:'Inter',sans-serif; }
        .tag { display:inline-flex; align-items:center; padding:.15rem .55rem; border-radius:5px; font-size:.7rem; font-weight:700; }
        .badge { display:inline-flex; align-items:center; padding:.2rem .7rem; border-radius:20px; font-size:.75rem; font-weight:700; }
        .tab-btn { display:flex; align-items:center; gap:.5rem; padding:.45rem .85rem; border-radius:7px; border:1px solid transparent; cursor:pointer; font-size:.78rem; font-weight:500; background:transparent; color:#888; transition:all .18s; white-space:nowrap; font-family:'Inter',sans-serif; }
        .tab-btn.active { background:#1f1f1f; color:#f1f1f1; border-color:#333; font-weight:700; }
        .tab-btn:hover:not(.active) { background:#1a1a1a; color:#ccc; }
      `}</style>

      {/* ═══ Live Market Ticker ═══ */}
      <div className="mcx-ticker-wrap">
        <div className="mcx-ticker">
          {(() => {
            const stateMult = INPUT_STATE_MULTIPLIER[selState] || 1.0;
            const petrol = { name:`Petrol (${selState})`, price: FUEL_BASE_PRICES.PETROL * stateMult, pct:(stateMult-1)*100 };
            const diesel = { name:`Diesel (${selState})`, price: FUEL_BASE_PRICES.DIESEL * stateMult, pct:(stateMult-1)*100 };
            const mega = [petrol, diesel, ...MCX_COMMODITIES];
            Object.entries(BASE_PRICES).slice(0,12).forEach(([crop,price]) => mega.push({ name:crop, price, pct:0 }));
            return [...mega,...mega].map((m,i) => {
              const lp = liveMcx[m.name] || m.price;
              const pct = m.pct !== undefined ? m.pct : (((lp-(m.price||lp))/(m.price||lp))*100);
              const isUp = pct >= 0 && mcxTrend[m.name] !== 'down';
              return (
                <span key={i} className="mcx-item">
                  <span style={{color:'#888'}}>{m.name}</span>
                  <span style={{color:isUp?'#22c55e':'#ef4444',fontWeight:700}}>&#x20B9;{lp.toFixed(m.name.includes('Petrol')||m.name.includes('Diesel')?2:0)}</span>
                  <span style={{color:isUp?'#22c55e':'#ef4444',fontSize:'.7rem'}}>{isUp?'▲':'▼'}</span>
                  <span style={{color:'#333',margin:'0 .5rem'}}>|</span>
                </span>
              );
            });
          })()}
        </div>
      </div>

      {/* ═══ App Shell: Sidebar + Content ═══ */}
      <div style={{ display:'flex', flex:1, overflow:'hidden', minHeight:0 }}>

        {/* ── Left Sidebar ── */}
        <aside style={{
          width:240, background:'#111', borderRight:'1px solid #222',
          display:'flex', flexDirection:'column', flexShrink:0,
          height:'calc(100vh - 36px)', position:'sticky', top:36,
          overflowY:'auto', padding:'1.25rem 1rem'
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:'.7rem', marginBottom:'2rem', padding:'0 .25rem' }}>
            <span style={{ fontSize:'1.6rem' }}>🌾</span>
            <div>
              <div style={{ fontWeight:800, fontSize:'1rem', color:'#fff', letterSpacing:'-.01em' }}>Smart Crop AI</div>
              <div style={{ fontSize:'.7rem', color:'#666', fontWeight:500 }}>Farm Assistant</div>
            </div>
          </div>

          <nav style={{ display:'flex', flexDirection:'column', gap:'.2rem', flex:1 }}>
            {TABS.map(t => (
              <button key={t.id} className={`nav-btn${activeTab===t.id?' active':''}`} onClick={() => setActiveTab(t.id)}>
                <span className="nav-icon">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </nav>

          <div style={{ marginTop:'auto', paddingTop:'1.25rem', borderTop:'1px solid #222' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'.75rem' }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:'#2563eb', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#fff', fontSize:'1rem', flexShrink:0 }}>
                {(user?.name || user?.email || 'F').charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:'.88rem', fontWeight:600, color:'#f1f1f1', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name || 'Farmer'}</div>
                <div style={{ fontSize:'.72rem', color:'#666', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email || user?.phone || ''}</div>
              </div>
            </div>
            <button className="btn btn-outline" style={{ width:'100%', fontSize:'.82rem', padding:'.5rem', justifyContent:'center' }}
              onClick={() => { localStorage.removeItem(SESSION_KEY); setUser(null); }}>
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── Right Content ── */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, height:'calc(100vh - 36px)', overflowY:'auto' }}>

          {/* Top Header Bar */}
          <header style={{ background:'#111', borderBottom:'1px solid #222', padding:'.75rem 1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'.5rem', position:'sticky', top:0, zIndex:10 }}>
            <div style={{ fontWeight:700, fontSize:'1rem', color:'#f1f1f1' }}>
              {TABS.find(t => t.id === activeTab)?.icon} {TABS.find(t => t.id === activeTab)?.label}
            </div>
            <div style={{ display:'flex', gap:'.6rem', alignItems:'center', flexWrap:'wrap' }}>
              <select className="input" style={{width:'auto',padding:'.4rem .7rem',fontSize:'.8rem'}} value={selState} onChange={e=>handleStateChange(e.target.value)}>
                {ALL_STATES && ALL_STATES.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
              <select className="input" style={{width:'auto',padding:'.4rem .7rem',fontSize:'.8rem'}} value={selDistrict} onChange={e=>handleDistrictChange(e.target.value)}>
                {districts.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
              <select className="input" style={{width:'auto',padding:'.4rem .7rem',fontSize:'.8rem'}} value={selMandal} onChange={e=>setSelMandal(e.target.value)}>
                {mandals.map(m=><option key={m} value={m}>{m}</option>)}
              </select>
              <select className="input" style={{width:'auto',padding:'.4rem .7rem',fontSize:'.8rem'}} value={lang} onChange={e=>setLang(e.target.value)}>
                <option value="en">EN</option>
                <option value="hi">HI</option>
                <option value="te">TE</option>
              </select>
            </div>
          </header>

          {/* Main Page Content */}
          <main style={{ padding:'1.5rem', maxWidth:1400, width:'100%', margin:'0 auto', flex:1 }}>

            {/* ════ OVERVIEW ════ */}
            {activeTab==='overview' && (
              <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
                <div>
                  <div className="section-title">⚖️ Macro Economy & Fuel — {selState}</div>
                  <div className="grid4">
                    {[
                      { icon:'🪙', label:'Gold (10g)',    val:(liveMcx['Gold (10g)']||72450).toFixed(0),                                               color:'#fbbf24' },
                      { icon:'☁️', label:'Cotton (Bale)', val:(liveMcx['Cotton (170kg)']||28500).toFixed(0),                                           color:'#94a3b8' },
                      { icon:'⛽', label:'Petrol / Litre',val:(FUEL_BASE_PRICES.PETROL*(INPUT_STATE_MULTIPLIER[selState]||1.0)).toFixed(2),             color:'#f97316' },
                      { icon:'🛢️', label:'Diesel / Litre',val:(FUEL_BASE_PRICES.DIESEL*(INPUT_STATE_MULTIPLIER[selState]||1.0)).toFixed(2),            color:'#3b82f6' },
                    ].map(s=>(
                      <div key={s.label} className="stat-card">
                        <div style={{fontSize:'1.5rem'}}>{s.icon}</div>
                        <div style={{fontSize:'1.4rem',fontWeight:800,color:s.color}}>&#x20B9;{s.val}</div>
                        <div style={{fontSize:'.75rem',color:'#888',fontWeight:600}}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="section-title">🌤 Weather — {selMandal}, {selDistrict}</div>
                  <div className="grid4">
                    {[
                      { icon:'🌡', label:'Temperature', val:weather.temp,     color:'#f97316' },
                      { icon:'💧', label:'Humidity',    val:weather.humidity, color:'#60a5fa' },
                      { icon:'🌧', label:'Rain Chance', val:weather.rain,     color:'#818cf8' },
                      { icon:'💨', label:'Wind Speed',  val:weather.wind,     color:'#34d399' },
                    ].map(s=>(
                      <div key={s.label} className="stat-card">
                        <div style={{fontSize:'1.5rem'}}>{s.icon}</div>
                        <div style={{fontSize:'1.4rem',fontWeight:800,color:s.color}}>{s.val}</div>
                        <div style={{fontSize:'.75rem',color:'#888',fontWeight:600}}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid2">
                  <div className="card">
                    <div className="section-title">📅 7-Day Forecast</div>
                    <div style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.15)',borderRadius:8,padding:'.75rem',fontSize:'.83rem',color:'#fca5a5',marginBottom:'1rem',lineHeight:1.6}}>
                      ⚠️ <strong>Advisory:</strong> {weather.advisory}
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'.4rem'}}>
                      {(weather.forecast||[]).map((f,i)=>(
                        <div key={i} style={{textAlign:'center',background:'#222',borderRadius:8,padding:'.5rem .2rem'}}>
                          <div style={{fontSize:'.65rem',color:'#888',fontWeight:700}}>{f.day}</div>
                          <div style={{fontSize:'1.2rem',margin:'.2rem 0'}}>{f.icon}</div>
                          <div style={{fontSize:'.7rem',fontWeight:700,color:'#f87171'}}>{f.high}°</div>
                          <div style={{fontSize:'.65rem',color:'#60a5fa'}}>{f.low}°</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card">
                    <div className="section-title">👨‍🌾 Farmer Profile</div>
                    <div style={{display:'flex',flexDirection:'column',gap:'.6rem'}}>
                      {[
                        ['Name',        user.name||'Registered Farmer'],
                        ['Contact',     user.email||`+91 ${user.phone||'–'}`],
                        ['Location',    `${selMandal}, ${selDistrict}, ${selState}`],
                        ['Primary Crop','Cotton / Tomato / Paddy'],
                        ['Farm Size',   '5.5 Acres — Black Cotton Soil'],
                        ['Water Source','Borewell + Drip Irrigation'],
                      ].map(([k,v])=>(
                        <div key={k} style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #222',paddingBottom:'.5rem'}}>
                          <span style={{fontSize:'.8rem',color:'#888'}}>{k}</span>
                          <span style={{fontSize:'.83rem',fontWeight:600,color:'#e2e8f0'}}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="section-title">⚡ Live Commodity Prices — {selState} Mandis</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(175px,1fr))',gap:'.7rem'}}>
                    {['Tomato','Onion','Potato','Wheat','Paddy (Rice)','Cotton (Long Staple)','Turmeric (Haldi)','Red Chilli (Dry)','Soybean (Yellow)','Groundnut (in shell)','Toor Dal (Arhar)','Moong Dal (Green)'].map(crop=>{
                      const price=livePrices[crop]||BASE_PRICES[crop]||20;
                      const base=BASE_PRICES[crop]||20;
                      const pct=(((price-base)/base)*100).toFixed(1);
                      const isUp=priceTrend[crop]!=='down';
                      const flash=priceFlash[crop];
                      return (
                        <div key={crop} className={`price-row${flash?(isUp?' flash-up':' flash-down'):''}`} style={{background:'#1f1f1f',borderRadius:8,padding:'.75rem',border:'1px solid #2a2a2a',display:'flex',flexDirection:'column',gap:'.3rem'}}>
                          <div style={{fontSize:'.75rem',color:'#888'}}>{crop}</div>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                            <span style={{fontSize:'1.1rem',fontWeight:800,color:isUp?'#22c55e':'#ef4444'}}>&#x20B9;{price.toFixed(2)}</span>
                            <span style={{fontSize:'.72rem',fontWeight:700,color:isUp?'#22c55e':'#ef4444'}}>{isUp?'▲':'▼'}{Math.abs(pct)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ════ AI CROP ADVISOR ════ */}
            {activeTab==='advisor' && (
              <div className="grid2">
                <div className="card">
                  <div className="section-title">🌱 AI Crop Recommendation Engine</div>
                  <p style={{fontSize:'.85rem',color:'#888',marginBottom:'1.25rem'}}>Enter your farm details. Our AI analyzes soil, water, season, and market demand to suggest the most profitable crop.</p>
                  <form onSubmit={handleRecommendCrop} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                    {[
                      {label:'Soil Type',id:'soil',opts:['Black','Red','Sandy','Clay','Loamy','Alluvial']},
                      {label:'Water Availability',id:'water',opts:['Light','Medium','Heavy','Drip Only']},
                      {label:'Cropping Season',id:'season',opts:['Kharif','Rabi','Zaid','Year Round']},
                    ].map(f=>(
                      <div key={f.id}>
                        <label className="fld">{f.label}</label>
                        <select className="input" value={cropInputs[f.id]} onChange={e=>setCropInputs(p=>({...p,[f.id]:e.target.value}))}>
                          {f.opts.map(o=><option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    ))}
                    <div>
                      <label className="fld">Farm Area (Acres)</label>
                      <input className="input" type="number" value={cropInputs.area} min="0.1" step="0.5" onChange={e=>setCropInputs(p=>({...p,area:e.target.value}))} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{marginTop:'.5rem'}}>🧠 Generate Recommendation</button>
                  </form>
                </div>
                <div className="card">
                  <div className="section-title">📊 Recommendation Result</div>
                  {recommendation ? (
                    <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                      <div style={{background:'rgba(34,197,94,.07)',border:'1px solid rgba(34,197,94,.2)',borderRadius:10,padding:'1.25rem',textAlign:'center'}}>
                        <div style={{fontSize:'2rem',marginBottom:'.5rem'}}>🏆</div>
                        <div style={{fontSize:'1.6rem',fontWeight:800,color:'#22c55e'}}>{recommendation.crop}</div>
                        <div style={{fontSize:'.85rem',color:'#888',marginTop:'.3rem'}}>Best crop for your conditions</div>
                      </div>
                      {[
                        ['💵 Estimated Profit',`&#x20B9;${recommendation.profit}/season`],
                        ['⚠️ Risk Level',recommendation.risk],
                        ['📊 Market Demand',recommendation.demand],
                        ['🧪 Fertilizer Plan',recommendation.fertilizer],
                        ['📦 Expected Yield',recommendation.yieldPredict],
                        ['📈 Live Market Price',`&#x20B9;${(livePrices[recommendation.crop]||20).toFixed(2)}/unit`],
                      ].map(([k,v])=>(
                        <div key={k} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'1rem',padding:'.6rem .8rem',background:'#1f1f1f',borderRadius:8,border:'1px solid #2a2a2a'}}>
                          <span style={{fontSize:'.82rem',color:'#888',flexShrink:0}}>{k}</span>
                          <span style={{fontSize:'.85rem',fontWeight:700,color:'#f1f1f1',textAlign:'right'}} dangerouslySetInnerHTML={{__html:v}} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:300,gap:'1rem',opacity:.5,textAlign:'center'}}>
                      <span style={{fontSize:'3rem'}}>🌱</span>
                      <p style={{color:'#888',fontSize:'.9rem'}}>Fill the form and click Generate to get personalized crop advice.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ════ DISEASE SCANNER ════ */}
            {activeTab==='scanner' && (
              <div className="grid2">
                <div className="card">
                  <div className="section-title">🔬 AI Leaf Disease Scanner</div>
                  <p style={{fontSize:'.85rem',color:'#888',marginBottom:'1rem'}}>Select a sample leaf type and click Scan to simulate AI disease detection.</p>
                  <div style={{display:'flex',gap:'.6rem',flexWrap:'wrap',marginBottom:'1rem'}}>
                    {[{id:'spot',label:'🍅 Tomato Leaf Spot'},{id:'blast',label:'🌾 Rice Blast'},{id:'healthy',label:'🌿 Healthy Cotton'}].map(s=>(
                      <button key={s.id} className={`scan-btn${scanTarget===s.id?' active':''}`} onClick={()=>{setScanTarget(s.id);setScanResult(null);}}>{s.label}</button>
                    ))}
                  </div>
                  <div onClick={triggerScan} style={{background:'#1f1f1f',border:'2px dashed #333',borderRadius:12,height:240,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',position:'relative',overflow:'hidden'}}>
                    {scanning ? (
                      <div style={{textAlign:'center'}}>
                        <div style={{fontSize:'2rem',animation:'pulse 1s infinite'}}>🔬</div>
                        <div style={{color:'#22c55e',fontWeight:700,marginTop:'.5rem'}}>Analyzing Leaf Sample…</div>
                        <div style={{position:'absolute',height:2,background:'linear-gradient(90deg,transparent,#22c55e,transparent)',width:'100%',left:0,animation:'scanLine 1.5s linear infinite'}}></div>
                      </div>
                    ) : (
                      <div style={{textAlign:'center',padding:'1.5rem'}}>
                        <div style={{fontSize:'3rem'}}>📸</div>
                        <div style={{fontWeight:600,color:'#f1f1f1',marginTop:'.7rem'}}>Click to Start AI Scan</div>
                        <div style={{fontSize:'.78rem',color:'#888',marginTop:'.4rem'}}>Mode: {scanTarget==='spot'?'Tomato Leaf Spot':scanTarget==='blast'?'Rice Blast':'Healthy Cotton'}</div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="card">
                  <div className="section-title">📋 Diagnosis Report</div>
                  {scanResult ? (
                    <div style={{display:'flex',flexDirection:'column',gap:'.85rem',animation:'fadeIn .5s ease'}}>
                      <div style={{background:scanResult.danger==='None'?'rgba(34,197,94,.08)':scanResult.danger==='High'?'rgba(239,68,68,.08)':'rgba(251,146,60,.08)',border:`1px solid ${scanResult.danger==='None'?'rgba(34,197,94,.25)':scanResult.danger==='High'?'rgba(239,68,68,.25)':'rgba(251,146,60,.25)'}`,borderRadius:10,padding:'1rem',textAlign:'center'}}>
                        <div style={{fontSize:'1.1rem',fontWeight:800,color:scanResult.danger==='None'?'#22c55e':scanResult.danger==='High'?'#ef4444':'#f97316'}}>{scanResult.disease}</div>
                        <div style={{fontSize:'.82rem',color:'#888',marginTop:'.25rem'}}>Confidence: <strong style={{color:'#f1f1f1'}}>{scanResult.confidence}</strong> | Risk: <strong style={{color:scanResult.danger==='None'?'#22c55e':scanResult.danger==='High'?'#ef4444':'#f97316'}}>{scanResult.danger}</strong></div>
                      </div>
                      {[['🛡️ Treatment',scanResult.medicine],['⚠️ Prevention',scanResult.prevention]].map(([t,v])=>(
                        <div key={t} style={{background:'#1f1f1f',border:'1px solid #2a2a2a',borderRadius:10,padding:'1rem'}}>
                          <div style={{fontWeight:700,color:'#f1f1f1',marginBottom:'.4rem'}}>{t}</div>
                          <p style={{fontSize:'.85rem',color:'#888',lineHeight:1.6}}>{v}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:300,gap:'1rem',opacity:.5,textAlign:'center'}}>
                      <span style={{fontSize:'3rem'}}>🔬</span>
                      <p style={{color:'#888',fontSize:'.9rem'}}>Click on the scanner panel to analyze.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ════ MARKET & PRICES ════ */}
            {activeTab==='market' && (
              <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
                <div className="grid2">
                  <div className="card">
                    <div className="section-title">🚚 Best Mandi — {marketCrop}</div>
                    <div style={{display:'flex',gap:'.7rem',marginBottom:'1rem',flexWrap:'wrap'}}>
                      <div style={{flex:1}}>
                        <label className="fld">Commodity</label>
                        <select className="input" value={marketCrop} onChange={e=>setMarketCrop(e.target.value)}>
                          {ALL_CROPS.slice(0,60).map(c=><option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div style={{width:140}}>
                        <label className="fld">Transport &#x20B9;/kg</label>
                        <input className="input" type="number" step="0.5" value={transportCost} onChange={e=>setTransportCost(e.target.value)} />
                      </div>
                    </div>
                    <div style={{maxHeight:320,overflowY:'auto',display:'flex',flexDirection:'column',gap:'.4rem'}}>
                      {mandiResult.details.slice(0,12).map((m,i)=>(
                        <div key={m.name} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.6rem .9rem',borderRadius:8,background:i===0?'rgba(34,197,94,.06)':'#1f1f1f',border:i===0?'1px solid rgba(34,197,94,.2)':'1px solid #2a2a2a'}}>
                          <div>
                            <div style={{fontWeight:600,fontSize:'.85rem',color:'#f1f1f1'}}>{m.flag} {m.name} {i===0&&<span style={{background:'#16a34a',color:'#fff',fontSize:'.62rem',padding:'.1rem .4rem',borderRadius:4,fontWeight:700,marginLeft:'.3rem'}}>BEST ⭐</span>}</div>
                            <div style={{fontSize:'.72rem',color:'#888'}}>{m.state} · Logistics: &#x20B9;{m.log}/kg</div>
                          </div>
                          <div style={{textAlign:'right'}}>
                            <div style={{fontWeight:800,color:'#22c55e'}}>&#x20B9;{m.net}/kg</div>
                            <div style={{fontSize:'.72rem',color:'#888'}}>Mandi: &#x20B9;{m.price}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card">
                    <div className="section-title">🧪 Farming Inputs — {inputsState}</div>
                    <div style={{marginBottom:'1rem'}}>
                      <label className="fld">State</label>
                      <select className="input" value={inputsState} onChange={e=>setInputsState(e.target.value)}>
                        {INPUT_STATE_MULTIPLIER && Object.keys(INPUT_STATE_MULTIPLIER).map(s=><option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div style={{maxHeight:290,overflowY:'auto',display:'flex',flexDirection:'column',gap:'.3rem'}}>
                      {COMMODITY_CATEGORIES['🧪 Farming Inputs']?.slice(0,14).map(item=>{
                        const base=BASE_PRICES[item]||100;
                        const stateP=+(base*(INPUT_STATE_MULTIPLIER?.[inputsState]||1)).toFixed(0);
                        const diff=stateP-base;
                        return (
                          <div key={item} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.5rem .7rem',borderRadius:7,background:'#1f1f1f',border:'1px solid #2a2a2a'}}>
                            <div>
                              <div style={{fontWeight:600,fontSize:'.8rem',color:'#f1f1f1'}}>{item}</div>
                              <div style={{fontSize:'.7rem',color:'#888'}}>Base: &#x20B9;{base}</div>
                            </div>
                            <div style={{textAlign:'right'}}>
                              <div style={{fontWeight:800,color:'#22c55e'}}>&#x20B9;{stateP}</div>
                              <div style={{fontSize:'.68rem',color:diff>0?'#ef4444':'#22c55e'}}>{diff>0?`+&#x20B9;${diff} costlier`:`&#x20B9;${Math.abs(diff)} cheaper`}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem',flexWrap:'wrap',gap:'1rem'}}>
                    <div className="section-title" style={{marginBottom:0}}>📋 Live Commodity Rate Sheet</div>
                    <input className="input" style={{width:260,margin:0}} placeholder="🔍 Search commodity…" value={marketSearch} onChange={e=>setMarketSearch(e.target.value)} />
                  </div>
                  <div style={{display:'flex',gap:'.4rem',overflowX:'auto',paddingBottom:'.5rem',marginBottom:'1rem'}}>
                    <button className={`tab-btn${marketCategory==='All'?' active':''}`} onClick={()=>setMarketCategory('All')}>All</button>
                    {Object.keys(COMMODITY_CATEGORIES).map(cat=>(
                      <button key={cat} className={`tab-btn${marketCategory===cat?' active':''}`} onClick={()=>setMarketCategory(cat)} style={{fontSize:'.75rem',padding:'.4rem .75rem'}}>{cat}</button>
                    ))}
                  </div>
                  <div style={{maxHeight:440,overflowY:'auto',borderRadius:10,border:'1px solid #222'}}>
                    <table style={{width:'100%',borderCollapse:'collapse',fontSize:'.82rem'}}>
                      <thead style={{position:'sticky',top:0,background:'#111',zIndex:1}}>
                        <tr style={{color:'#888',fontWeight:600,fontSize:'.75rem',textTransform:'uppercase',letterSpacing:'.05em'}}>
                          <th style={{padding:'.7rem 1rem',textAlign:'left'}}>Commodity</th>
                          <th style={{padding:'.7rem',textAlign:'left'}}>Category</th>
                          <th style={{padding:'.7rem',textAlign:'right'}}>Live Price</th>
                          <th style={{padding:'.7rem',textAlign:'right'}}>Change</th>
                          <th style={{padding:'.7rem',textAlign:'right'}}>Base</th>
                          {INTL_PRICES && <th style={{padding:'.7rem',textAlign:'right'}}>Dubai 🇦🇪</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCrops.slice(0,80).map(({item,cat})=>{
                          const lp=livePrices[item]||BASE_PRICES[item]||20;
                          const base=BASE_PRICES[item]||20;
                          const pct=(((lp-base)/base)*100).toFixed(1);
                          const isUp=priceTrend[item]!=='down';
                          const flash=priceFlash[item];
                          const intl=INTL_PRICES?.[item];
                          return (
                            <tr key={item} className={flash?(isUp?'flash-up':'flash-down'):''} style={{borderBottom:'1px solid #1f1f1f',cursor:'pointer'}} onClick={()=>setMarketCrop(item)}>
                              <td style={{padding:'.55rem 1rem',fontWeight:600,color:'#f1f1f1'}}>{item}</td>
                              <td style={{padding:'.55rem .7rem',fontSize:'.72rem',color:'#888'}}>{cat}</td>
                              <td style={{padding:'.55rem .7rem',textAlign:'right',fontWeight:700,color:isUp?'#22c55e':'#ef4444'}}>&#x20B9;{lp.toFixed(2)}</td>
                              <td style={{padding:'.55rem .7rem',textAlign:'right',fontSize:'.75rem',color:isUp?'#22c55e':'#ef4444'}}>{isUp?'▲':'▼'}{Math.abs(pct)}%</td>
                              <td style={{padding:'.55rem .7rem',textAlign:'right',color:'#888'}}>&#x20B9;{base}</td>
                              {INTL_PRICES && <td style={{padding:'.55rem .7rem',textAlign:'right',color:'#fbbf24'}}>{intl?`&#x20B9;${intl.Dubai}`:'–'}</td>}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="card">
                  <div className="section-title">🔔 Price Alert</div>
                  {alertSent && <div style={{background:'rgba(34,197,94,.08)',border:'1px solid rgba(34,197,94,.2)',borderRadius:8,padding:'.75rem 1rem',marginBottom:'1rem',fontSize:'.85rem',color:'#86efac'}}>✅ Alert set for <strong>{alertCrop}</strong> at &#x20B9;{alertThreshold}.</div>}
                  <form onSubmit={handleAlert} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                    <div><label className="fld">Commodity</label><select className="input" value={alertCrop} onChange={e=>setAlertCrop(e.target.value)}>{ALL_CROPS.slice(0,50).map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                    <div><label className="fld">Price Threshold (&#x20B9;)</label><input className="input" type="number" placeholder="e.g. 30" value={alertThreshold} onChange={e=>setAlertThreshold(e.target.value)} required /></div>
                    <div><label className="fld">Email</label><input className="input" type="email" placeholder="farmer@example.com" value={alertEmail} onChange={e=>setAlertEmail(e.target.value)} /></div>
                    <div><label className="fld">Phone</label><input className="input" type="tel" placeholder="9876543210" maxLength={10} value={alertPhone} onChange={e=>setAlertPhone(e.target.value.replace(/\D/g,'').slice(0,10))} /></div>
                    <button type="submit" className="btn btn-primary" style={{gridColumn:'span 2'}} disabled={alertSending||(!alertEmail&&!alertPhone)}>{alertSending?'📡 Sending…':'🔔 Set Alert'}</button>
                  </form>
                </div>
              </div>
            )}

            {/* ════ EXPENSE LEDGER ════ */}
            {activeTab==='expenses' && (
              <div className="grid2">
                <div className="card">
                  <div className="section-title">💰 Farm Expense Ledger</div>
                  <div className="grid2" style={{marginBottom:'1.25rem'}}>
                    <div style={{background:'rgba(34,197,94,.07)',border:'1px solid rgba(34,197,94,.15)',borderRadius:10,padding:'1rem'}}>
                      <div style={{fontSize:'.78rem',color:'#888'}}>Total Income</div>
                      <div style={{fontSize:'1.5rem',fontWeight:800,color:'#22c55e'}}>&#x20B9;{totalIncome.toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{background:'rgba(239,68,68,.07)',border:'1px solid rgba(239,68,68,.15)',borderRadius:10,padding:'1rem'}}>
                      <div style={{fontSize:'.78rem',color:'#888'}}>Total Expenses</div>
                      <div style={{fontSize:'1.5rem',fontWeight:800,color:'#ef4444'}}>&#x20B9;{totalExpense.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                  <div style={{background:netReturn>=0?'rgba(34,197,94,.05)':'rgba(239,68,68,.05)',border:`1px solid ${netReturn>=0?'rgba(34,197,94,.15)':'rgba(239,68,68,.15)'}`,borderRadius:10,padding:'1rem',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
                    <span style={{fontSize:'.9rem',color:'#888'}}>Net Profit / Loss</span>
                    <span style={{fontSize:'1.3rem',fontWeight:800,color:netReturn>=0?'#22c55e':'#ef4444'}}>{netReturn>=0?'+':'–'}&#x20B9;{Math.abs(netReturn).toLocaleString('en-IN')}</span>
                  </div>
                  <form onSubmit={handleAddLedger} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.8rem'}}>
                    <div><label className="fld">Type</label><select className="input" value={ledgerInput.type} onChange={e=>setLedgerInput(p=>({...p,type:e.target.value}))}><option value="expense">Expense (–)</option><option value="income">Income (+)</option></select></div>
                    <div><label className="fld">Category</label><select className="input" value={ledgerInput.category} onChange={e=>setLedgerInput(p=>({...p,category:e.target.value}))}>{['Seeds','Fertilizer','Pesticide','Labor','Fuel','Equipment','Sales','Subsidy'].map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                    <div style={{gridColumn:'span 2'}}><label className="fld">Description</label><input className="input" value={ledgerInput.desc} onChange={e=>setLedgerInput(p=>({...p,desc:e.target.value}))} placeholder="e.g. Bought 2 bags of Urea" /></div>
                    <div><label className="fld">Amount (&#x20B9;)</label><input className="input" type="number" value={ledgerInput.amount} onChange={e=>setLedgerInput(p=>({...p,amount:e.target.value}))} placeholder="Amount" /></div>
                    <div style={{display:'flex',alignItems:'flex-end'}}><button type="submit" className="btn btn-primary" style={{width:'100%'}}>+ Add Entry</button></div>
                  </form>
                </div>
                <div className="card">
                  <div className="section-title">📊 Recent Transactions</div>
                  <div style={{display:'flex',flexDirection:'column',gap:'.5rem',maxHeight:460,overflowY:'auto'}}>
                    {[...ledger].reverse().map(item=>(
                      <div key={item.id} className="ledger-item">
                        <div>
                          <div style={{fontWeight:600,color:'#f1f1f1',fontSize:'.83rem'}}>{item.desc}</div>
                          <div style={{fontSize:'.72rem',color:'#888'}}>{item.category} · {item.date}</div>
                        </div>
                        <div style={{fontWeight:800,fontSize:'1rem',color:item.type==='income'?'#22c55e':'#ef4444'}}>
                          {item.type==='income'?'+':'–'} &#x20B9;{item.amount.toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ════ AI CHAT ════ */}
            {activeTab==='chat' && (
              <div className="card" style={{maxWidth:800,margin:'0 auto'}}>
                <div className="section-title">🤖 AI Farming Assistant</div>
                <div style={{display:'flex',gap:'.5rem',flexWrap:'wrap',marginBottom:'1rem'}}>
                  {['Is rain coming today?','Price of Tomato today?','Best fertilizer for cotton?','Which govt scheme for me?'].map(q=>(
                    <button key={q} className="btn btn-outline" style={{fontSize:'.75rem',padding:'.35rem .75rem'}} onClick={()=>{
                      setChatMessages(p=>[...p,{sender:'user',text:q}]);
                      setChatInput(q);
                      setTimeout(()=>{ const e={preventDefault:()=>{}}; handleChat(e); },50);
                    }}>💬 {q}</button>
                  ))}
                </div>
                <div style={{background:'#161616',borderRadius:12,border:'1px solid #222',padding:'1rem',height:360,overflowY:'auto',display:'flex',flexDirection:'column',gap:'.7rem',marginBottom:'1rem'}}>
                  {chatMessages.map((m,i)=>(
                    <div key={i} className={`chat-bubble ${m.sender}`}>{m.text}</div>
                  ))}
                  <div ref={chatEndRef}></div>
                </div>
                <form onSubmit={handleChat} style={{display:'flex',gap:'.7rem',alignItems:'center'}}>
                  <button type="button" onClick={handleVoice} style={{background:isRecording?'rgba(239,68,68,.15)':'#1f1f1f',border:`1px solid ${isRecording?'rgba(239,68,68,.4)':'#333'}`,borderRadius:10,padding:'.65rem .9rem',cursor:'pointer',fontSize:'1.2rem',animation:isRecording?'pulse 1s infinite':'none',flexShrink:0}}>🎙️</button>
                  <input className="input" style={{flex:1,margin:0}} value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Type in English, हिंदी, or తెలుగు…" />
                  <button type="submit" className="btn btn-primary">Send ↗</button>
                </form>
              </div>
            )}

            {/* ════ GOVT SCHEMES ════ */}
            {activeTab==='schemes' && (
              <div className="grid2">
                <div className="card">
                  <div className="section-title">📋 Eligibility Checker</div>
                  <p style={{fontSize:'.85rem',color:'#888',marginBottom:'1.25rem'}}>Enter your details to instantly match eligible government schemes.</p>
                  <div style={{display:'flex',flexDirection:'column',gap:'.9rem'}}>
                    <div><label className="fld">Total Land Size (Acres)</label><input className="input" type="number" step="0.1" min="0" value={schemeLand} onChange={e=>setSchemeLand(e.target.value)} /></div>
                    <div><label className="fld">State Jurisdiction</label><select className="input" value={schemeState} onChange={e=>setSchemeState(e.target.value)}>{ALL_STATES && ALL_STATES.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                    <div><label className="fld">Farming Sector</label><select className="input" value={schemeSector} onChange={e=>setSchemeSector(e.target.value)}><option value="Agriculture">Agriculture (Crops)</option><option value="Allied">Allied Sectors</option><option value="fisheries">Fisheries</option></select></div>
                    <div><label className="fld">Social Category</label><select className="input" value={schemeSCST?'SC/ST/Women':'General'} onChange={e=>setSchemeSCST(e.target.value==='SC/ST/Women')}><option value="SC/ST/Women">SC / ST / Women Farmer</option><option value="General">General / OBC Farmer</option></select></div>
                    <div style={{borderTop:'1px solid #222',paddingTop:'1rem',display:'flex',flexDirection:'column',gap:'.7rem'}}>
                      <div style={{fontSize:'.75rem',fontWeight:600,color:'#888',textTransform:'uppercase',letterSpacing:'.05em'}}>Document Status</div>
                      {[['schemeAadhaar',schemeAadhaar,setSchemeAadhaar,'🔗 Aadhaar Linked to Mobile'],['schemeBank',schemeBank,setSchemeBank,'🏦 Bank Account DBT Linked']].map(([k,v,set,lbl])=>(
                        <label key={k} style={{display:'flex',alignItems:'center',gap:'.6rem',cursor:'pointer',fontSize:'.875rem',color:'#f1f1f1'}}>
                          <input type="checkbox" checked={v} onChange={e=>set(e.target.checked)} style={{width:'1.1rem',height:'1.1rem',cursor:'pointer',accentColor:'#2563eb'}} />
                          {lbl}
                        </label>
                      ))}
                    </div>
                    <div style={{background:'#1f1f1f',borderRadius:8,padding:'.8rem',fontSize:'.8rem',color:'#888'}}>
                      Showing <strong style={{color:'#22c55e'}}>{matchingSchemes.length}</strong> schemes matching your profile.
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="section-title">🏛 Eligible Schemes ({matchingSchemes.length})</div>
                  <div style={{display:'flex',flexDirection:'column',gap:'.85rem',maxHeight:620,overflowY:'auto',paddingRight:'.25rem'}}>
                    {GOVT_SCHEMES ? GOVT_SCHEMES.slice(0,12).map(scheme=>(
                      <div key={scheme.name} className="scheme-card">
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'1rem'}}>
                          <div>
                            <div style={{fontSize:'.7rem',color:'#22c55e',fontWeight:700,textTransform:'uppercase',letterSpacing:'.04em'}}>{scheme.ministry}</div>
                            <h4 style={{color:'#f1f5f9',fontSize:'.95rem',fontWeight:700,marginTop:'.2rem'}}>{scheme.name}</h4>
                          </div>
                          <span className="tag" style={{background:scheme.color||'#16a34a',color:'#fff',flexShrink:0}}>{scheme.badge}</span>
                        </div>
                        <p style={{fontSize:'.82rem',color:'#888',lineHeight:1.6}}><strong style={{color:'#ccc'}}>Benefit:</strong> {scheme.benefit}</p>
                        <div style={{background:'#111',borderRadius:8,padding:'.75rem'}}>
                          <div style={{fontSize:'.72rem',fontWeight:600,color:'#f1f1f1',marginBottom:'.35rem'}}>📋 Required Documents</div>
                          <div style={{display:'flex',flexWrap:'wrap',gap:'.35rem'}}>
                            {(scheme.docs||[]).map(doc=>{
                              const ok=(doc.toLowerCase().includes('aadhaar')&&schemeAadhaar)||(doc.toLowerCase().includes('bank')&&schemeBank);
                              return <span key={doc} className="tag" style={{background:ok?'rgba(34,197,94,.12)':'rgba(255,255,255,.05)',color:ok?'#22c55e':'#888',border:`1px solid ${ok?'rgba(34,197,94,.2)':'rgba(255,255,255,.08)'}`}}>{ok?'✅ ':'📄 '}{doc}</span>;
                            })}
                          </div>
                        </div>
                        <div style={{display:'flex',justifyContent:'flex-end'}}>
                          <a href={`https://${scheme.apply}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{textDecoration:'none',padding:'.45rem 1rem',fontSize:'.78rem'}}>Apply Online ↗</a>
                        </div>
                      </div>
                    )) : <div style={{color:'#888',textAlign:'center',padding:'2rem'}}>No schemes data available.</div>}
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
