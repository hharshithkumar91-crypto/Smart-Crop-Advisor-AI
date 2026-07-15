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
    <div className="App-container" style={{ display: 'flex', minHeight: '100vh', background: '#080c14', fontFamily:"'Orbitron',monospace", color:'#e0d0ff' }}>
      
      {/* ── Left Sidebar Navigation ── */}
      <aside style={{ width: 280, background: 'rgba(15,22,36,0.98)', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', flexShrink: 0, backdropFilter:'blur(20px)', boxShadow:'5px 0 30px rgba(0,0,0,0.5)' }}>
        {/* Brand Logo inside Sidebar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem', marginBottom: '1rem' }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg,#10b981,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 0 15px rgba(16,185,129,0.4)' }}>🌴</div>
          <div>
            <div style={{ fontWeight: 950, fontSize: '1.1rem', color: '#10b981', letterSpacing: '.05em', fontFamily: "'Orbitron',monospace", textShadow: '0 0 10px rgba(16,185,129,0.3)' }}>SMART CROP AI</div>
            <div style={{ fontSize: '.62rem', color: '#3b82f6', fontWeight: 700, letterSpacing: '.1em', textShadow: 'none' }}>◈ AGRI PORTAL ◈</div>
          </div>
        </div>

        {/* Navigation inside Sidebar */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
          {TABS.map(t => (
            <button key={t.id} className={`tab-btn${activeTab === t.id ? ' active' : ''}`} onClick={() => setActiveTab(t.id)} style={{ width: '100%', justifyContent: 'flex-start' }}>
              <span style={{ marginRight: '8px' }}>{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Right Content Area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      {/* ── Inline keyframe CSS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;800;900&family=Rajdhani:wght@400;500;600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body {
          font-family:'Rajdhani',sans-serif !important;
          background: #080c14;
          background-attachment: fixed;
        }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:rgba(16,185,129,0.05); }
        ::-webkit-scrollbar-thumb { background:linear-gradient(#10b981,#3b82f6); border-radius:3px; }

        @keyframes priceUp   { 0%{background:rgba(0,255,255,0.3)} 100%{background:transparent} }
        @keyframes priceDown { 0%{background:rgba(255,0,128,0.3)}  100%{background:transparent} }
        @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes ticker    { 0%{transform:translateX(100%)} 100%{transform:translateX(-100%)} }
        @keyframes fadeIn    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes neonGlow  { 0%,100%{text-shadow:0 0 10px #ff00ff,0 0 20px #ff00ff,0 0 40px #ff00ff} 50%{text-shadow:0 0 20px #00ffff,0 0 40px #00ffff,0 0 80px #00ffff} }
        @keyframes borderPulse { 0%,100%{border-color:rgba(255,0,255,.3)} 50%{border-color:rgba(0,255,255,.6)} }
        @keyframes scanLine  { 0%{top:0} 100%{top:100%} }
        @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }

        .card {
          background: rgba(17,24,39,0.7);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 1.5rem;
          backdrop-filter: blur(20px);
          animation: fadeIn .4s ease;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.02);
          transition: all 0.25s ease;
        }
        .card:hover {
          border-color: rgba(16,185,129,0.35);
          box-shadow: 0 4px 25px rgba(16,185,129,0.08);
          transform: translateY(-2px);
        }

        .badge { display:inline-flex; align-items:center; padding:.2rem .7rem; border-radius:20px; font-size:.75rem; font-weight:700; }

        .btn {
          display: inline-flex; align-items: center; justify-content: center;
          gap: .4rem; padding: .65rem 1.4rem; border-radius: 8px;
          border: none; cursor: pointer; font-weight: 700;
          font-size: .875rem; transition: all .2s;
          font-family: 'Orbitron', monospace; letter-spacing: 0.05em;
        }
        .btn-primary {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff;
          box-shadow: 0 0 20px rgba(255,0,255,0.4);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16,185,129,0.4);
        }
        .btn-outline {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(0,255,255,.5);
          color: #10b981;
          box-shadow: 0 0 10px rgba(0,255,255,0.2);
        }
        .btn-outline:hover {
          background: rgba(0,255,255,.18);
          box-shadow: 0 0 20px rgba(0,255,255,0.4);
        }

        .input {
          width: 100%; padding: .65rem .9rem;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 8px; color: #e0d0ff;
          font-size: .875rem; outline: none;
          font-family: 'Rajdhani', sans-serif;
          transition: all 0.2s;
        }
        .input:focus { border-color:#00ffff; box-shadow:0 0 0 3px rgba(0,255,255,.15), 0 0 20px rgba(0,255,255,0.1); }
        select.input option { background:#1a0030; color:#e0d0ff; }

        label.fld {
          display: block; font-size: .75rem; font-weight: 700;
          color: #ff80ff; margin-bottom: .4rem;
          letter-spacing: .1em; text-transform: uppercase;
          font-family: 'Orbitron', monospace;
        }

        .up   { color:#00ffff; text-shadow:0 0 8px rgba(0,255,255,0.6); }
        .down { color:#ff4488; text-shadow:0 0 8px rgba(255,68,136,0.6); }
        .flat { color:#aa88cc; }

        .tab-btn {
          display: flex; align-items: center; gap: .5rem;
          padding: .6rem 1rem; border-radius: 8px; border: 1px solid transparent;
          cursor: pointer; font-size: .78rem; font-weight: 700;
          background: transparent; color: #aa88cc;
          transition: all .2s; white-space: nowrap;
          font-family: 'Orbitron', monospace; letter-spacing: 0.03em;
        }
        .tab-btn.active {
          background: rgba(16,185,129,0.08);
          color: #10b981;
          border-color: rgba(16,185,129,0.3);
          box-shadow: inset 0 0 8px rgba(16,185,129,0.15);
        }
        .tab-btn:hover:not(.active) {
          background: rgba(255,255,255,0.02);
          color: #10b981;
          border-color: rgba(0,255,255,.2);
        }

        .stat-card {
          background: rgba(20,0,40,0.9);
          border: 1px solid rgba(255,0,255,.2);
          border-radius: 14px; padding: 1.25rem 1.5rem;
          display: flex; flex-direction: column; gap: .4rem;
          box-shadow: 0 0 15px rgba(255,0,255,0.08);
        }

        .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; }
        .grid3 { display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; }
        .grid4 { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; }
        @media(max-width:900px){ .grid4{grid-template-columns:repeat(2,1fr)} .grid3{grid-template-columns:1fr 1fr} }
        @media(max-width:600px){ .grid2,.grid3,.grid4{grid-template-columns:1fr} }
        .row { display:flex; gap:1.25rem; flex-wrap:wrap; }

        .price-row { display:flex; justify-content:space-between; align-items:center; padding:.45rem .65rem; border-radius:6px; font-size:.82rem; transition:background .4s; }
        .price-row.flash-up   { animation:priceUp .8s ease; }
        .price-row.flash-down { animation:priceDown .8s ease; }

        .scheme-card {
          background: rgba(20,0,40,0.9);
          border: 1px solid rgba(255,255,255,.05);
          border-radius: 12px; padding: 1.25rem;
          display: flex; flex-direction: column; gap: .7rem;
          transition: all .25s;
        }
        .scheme-card:hover { border-color:rgba(16,185,129,.3); transform:translateY(-3px); box-shadow:0 4px 20px rgba(0,0,0,0.25); }

        .chat-bubble { padding:.75rem 1rem; border-radius:12px; max-width:80%; font-size:.875rem; line-height:1.5; animation:fadeIn .3s ease; }
        .chat-bubble.user { background:rgba(255,0,255,.15); border:1px solid rgba(255,0,255,.35); align-self:flex-end; }
        .chat-bubble.bot  { background:rgba(0,255,255,.08); border:1px solid rgba(0,255,255,.2); align-self:flex-start; }

        .scan-btn { border:1px solid rgba(0,255,255,.3); border-radius:8px; background:rgba(0,255,255,.06); color:#00ffff; padding:.5rem 1rem; cursor:pointer; font-size:.78rem; font-weight:700; transition:all .2s; font-family:'Orbitron',monospace; }
        .scan-btn.active { background:rgba(0,255,255,.18); border-color:#00ffff; box-shadow:0 0 15px rgba(0,255,255,0.3); }

        .ledger-item { display:flex; justify-content:space-between; align-items:center; padding:.65rem .9rem; border-radius:8px; font-size:.82rem; background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.04); }

        .section-title { font-size:1rem; font-weight:800; color:#10b981; display:flex; align-items:center; gap:.5rem; margin-bottom:1rem; font-family:'Orbitron',monospace; letter-spacing:0.05em; text-shadow:none; }

        .mcx-ticker-wrap { background:rgba(5,0,15,.98); border-bottom:1px solid rgba(255,0,255,.2); padding:.5rem 0; overflow:hidden; position:relative; box-shadow:0 2px 20px rgba(255,0,255,0.15); }
        .mcx-ticker { display:flex; gap:2.5rem; animation:ticker 60s linear infinite; white-space:nowrap; padding:.1rem 0; }
        .mcx-item { display:flex; align-items:center; gap:.4rem; font-size:.75rem; font-weight:700; font-family:'Orbitron',monospace; }
        .tag { display:inline-flex; align-items:center; padding:.15rem .55rem; border-radius:5px; font-size:.7rem; font-weight:700; }
      `}</style>

      {/* ══ MEGA LIVE TICKER (Flow Line) ══ */}
      <div className="mcx-ticker-wrap">
        <div className="mcx-ticker">
          {(() => {
            const stateMult = INPUT_STATE_MULTIPLIER[selState] || 1.0;
            const petrol = { name: `Petrol (${selState})`, price: FUEL_BASE_PRICES.PETROL * stateMult, pct: (stateMult-1)*100 };
            const diesel = { name: `Diesel (${selState})`, price: FUEL_BASE_PRICES.DIESEL * stateMult, pct: (stateMult-1)*100 };
            
            // Combine MCX with Fuel and some random agri items for a massive flow line
            const megaTicker = [petrol, diesel, ...MCX_COMMODITIES];
            // Add top 15 base crops to the ticker
            Object.entries(BASE_PRICES).slice(0,15).forEach(([crop, price]) => {
                megaTicker.push({ name: crop, price: price, pct: ((Math.random()*4)-2) }); // Simulated %
            });
            
            return [...megaTicker, ...megaTicker, ...megaTicker].map((m, i) => {
            const lp = liveMcx[m.name] || m.price || m.price;
            const pct = m.pct !== undefined ? m.pct : (((lp - (m.price||lp))/(m.price||lp))*100);
            const displayPct = Math.abs(pct).toFixed(2);
            const isUp = pct >= 0 && mcxTrend[m.name] !== 'down';
            return (
              <span key={i} className="mcx-item">
                <span style={{color: m.name.includes('Petrol') || m.name.includes('Diesel') ? '#ff80ff' : '#cc99ff'}}>{m.name}</span>
                <span style={{color:isUp?'#00ffff':'#ff4488',fontWeight:800}}>₹{lp.toFixed(m.name.includes('Petrol') ? 2 : 0)}</span>
                <span style={{color:isUp?'#00ffff':'#ff4488',fontSize:'.7rem'}}>{isUp?'▲':'▼'} {displayPct}%</span>
                <span style={{color:'rgba(255,0,255,.3)',margin:'0 .25rem'}}>|</span>
              </span>
            );
          })})()}
        </div>
      </div>

      {/* ══ Top Header ══ */}
      <header style={{ background:'rgba(15,22,36,0.98)', borderBottom:'1px solid rgba(255,255,255,.06)', padding:'1rem 1.5rem', display:'flex', justifyContent:'flex-end', alignItems:'center', position:'sticky', top:0, zIndex:100, backdropFilter:'blur(20px)', boxShadow:'0 4px 20px rgba(0,0,0,0.3)' }}>
        {/* Location pickers, Lang, user detail & logout */}
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
            <option value="en">🇬🇧 English</option>
            <option value="hi">🇮🇳 हिंदी</option>
            <option value="te">🇮🇳 తెలుగు</option>
          </select>
          <div style={{ display:'flex', alignItems:'center', gap:'.5rem', background:'rgba(255,255,255,.05)', borderRadius:8, padding:'.3rem .8rem' }}>
            <span style={{fontSize:'.8rem', color:'#94a3b8'}}>👤</span>
            <span style={{fontSize:'.82rem', fontWeight:600, color:'#e2e8f0'}}>{user.name || user.email || 'Farmer'}</span>
          </div>
          <button className="btn btn-outline" style={{padding:'.4rem .8rem',fontSize:'.78rem'}} onClick={()=>{ localStorage.removeItem(SESSION_KEY); setUser(null); }}>Logout</button>
        </div>
      </header>



      {/* ══ Main Scrollable Content Area ══ */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        <main style={{ maxWidth: 1400, margin: '0 auto' }}>

        {/* ════════ TAB: OVERVIEW ════════ */}
        {activeTab==='overview' && (
          <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>

            
            {/* Macro Economy & Fuel Cards */}
            <div className="section-title">⚖️ MACRO ECONOMY & FUEL (Live for {selState})</div>
            <div className="grid4" style={{marginBottom:'1rem'}}>
              {[
                { icon:'🪙', label:'Gold (10g)', val: (liveMcx['Gold (10g)'] || 72450).toFixed(0), color:'#ffd700', bg:'rgba(255,215,0,0.05)', border:'rgba(255,215,0,0.3)' },
                { icon:'☁️', label:'Cotton (Bale)', val: (liveMcx['Cotton (170kg)'] || 28500).toFixed(0), color:'#ffffff', bg:'rgba(255,255,255,0.05)', border:'rgba(255,255,255,0.3)' },
                { icon:'⛽', label:'Petrol (1L)', val: (FUEL_BASE_PRICES.PETROL * (INPUT_STATE_MULTIPLIER[selState] || 1.0)).toFixed(2), color:'#10b981', bg:'rgba(16,185,129,0.03)', border:'rgba(16,185,129,0.15)' },
                { icon:'🛢️', label:'Diesel (1L)', val: (FUEL_BASE_PRICES.DIESEL * (INPUT_STATE_MULTIPLIER[selState] || 1.0)).toFixed(2), color:'#3b82f6', bg:'rgba(59,130,246,0.03)', border:'rgba(59,130,246,0.15)' },
              ].map(s=>(
                <div key={s.label} className="stat-card" style={{borderColor:s.border, background:s.bg}}>
                  <div style={{fontSize:'1.8rem'}}>{s.icon}</div>
                  <div style={{fontSize:'1.5rem',fontWeight:800,color:s.color}}>₹{s.val}</div>
                  <div style={{fontSize:'.78rem',color:'#94a3b8',fontWeight:600}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Weather Stat Cards */}
            <div className="grid4">
              {[
                { icon:'🌡', label:'Temperature',   val:weather.temp,     color:'#fb923c' },
                { icon:'💧', label:'Humidity',       val:weather.humidity, color:'#60a5fa' },
                { icon:'🌧', label:'Rain Chance',    val:weather.rain,     color:'#818cf8' },
                { icon:'💨', label:'Wind Speed',     val:weather.wind,     color:'#34d399' },
              ].map(s=>(
                <div key={s.label} className="stat-card">
                  <div style={{fontSize:'1.8rem'}}>{s.icon}</div>
                  <div style={{fontSize:'1.5rem',fontWeight:800,color:s.color}}>{s.val}</div>
                  <div style={{fontSize:'.78rem',color:'#94a3b8',fontWeight:600}}>{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid2">
              {/* Weather Advisory */}
              <div className="card">
                <div className="section-title">🌤 Weather Forecast — {selMandal}, {selDistrict}</div>
                <div style={{background:'rgba(251,146,60,.06)',border:'1px solid rgba(251,146,60,.2)',borderRadius:10,padding:'.85rem 1rem',fontSize:'.85rem',color:'#fed7aa',marginBottom:'1rem',lineHeight:1.6}}>
                  ⚠️ <strong>Advisory:</strong> {weather.advisory}
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'.4rem'}}>
                  {(weather.forecast||[]).map((f,i)=>(
                    <div key={i} style={{textAlign:'center',background:'rgba(255,255,255,.03)',borderRadius:8,padding:'.5rem .25rem'}}>
                      <div style={{fontSize:'.7rem',color:'#94a3b8',fontWeight:700}}>{f.day}</div>
                      <div style={{fontSize:'1.3rem',margin:'.2rem 0'}}>{f.icon}</div>
                      <div style={{fontSize:'.72rem',fontWeight:700,color:'#f87171'}}>{f.high}°</div>
                      <div style={{fontSize:'.68rem',color:'#60a5fa'}}>{f.low}°</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Farmer Profile */}
              <div className="card">
                <div className="section-title">👨‍🌾 Farmer Profile</div>
                <div style={{display:'flex',flexDirection:'column',gap:'.65rem'}}>
                  {[
                    ['👤 Name',          user.name || 'Registered Farmer'],
                    ['📧 Contact',       user.email || `+91 ${user.phone||'–'}`],
                    ['📍 Location',      `${selMandal}, ${selDistrict}, ${selState}`],
                    ['🌾 Primary Crop',  'Cotton / Tomato / Paddy'],
                    ['🏡 Farm Size',     '5.5 Acres — Black Cotton Soil'],
                    ['💧 Water Source',  'Borewell + Drip Irrigation'],
                  ].map(([k,v])=>(
                    <div key={k} style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid rgba(255,255,255,.04)',paddingBottom:'.5rem'}}>
                      <span style={{fontSize:'.8rem',color:'#94a3b8'}}>{k}</span>
                      <span style={{fontSize:'.85rem',fontWeight:600,color:'#e2e8f0'}}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Live Prices */}
            <div className="card">
              <div className="section-title">⚡ Live Commodity Prices — {selState} Mandis</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:'.7rem'}}>
                {['Tomato','Onion','Potato','Wheat','Paddy (Rice)','Cotton (Long Staple)','Turmeric (Haldi)','Red Chilli (Dry)','Soybean (Yellow)','Groundnut (in shell)','Toor Dal (Arhar)','Moong Dal (Green)'].map(crop=>{
                  const price = livePrices[crop] || BASE_PRICES[crop] || 20;
                  const base  = BASE_PRICES[crop] || 20;
                  const pct   = (((price-base)/base)*100).toFixed(1);
                  const isUp  = priceTrend[crop] !== 'down';
                  const flash = priceFlash[crop];
                  return (
                    <div key={crop} className={`price-row${flash?(isUp?' flash-up':' flash-down'):''}`} style={{background:'rgba(255,255,255,.03)',borderRadius:8,padding:'.75rem'}}>
                      <div style={{fontSize:'.78rem',color:'#94a3b8',marginBottom:'.2rem'}}>{crop}</div>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <span style={{fontSize:'1.1rem',fontWeight:800,color:isUp?'#4ade80':'#f87171'}}>₹{price.toFixed(2)}</span>
                        <span style={{fontSize:'.72rem',fontWeight:700,color:isUp?'#4ade80':'#f87171'}}>{isUp?'▲':'▼'}{Math.abs(pct)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ════════ TAB: AI CROP ADVISOR ════════ */}
        {activeTab==='advisor' && (
          <div className="grid2">
            <div className="card">
              <div className="section-title">🌱 AI Crop Recommendation Engine</div>
              <p style={{fontSize:'.85rem',color:'#94a3b8',marginBottom:'1.25rem'}}>Enter your farm details. Our AI will analyze soil type, water availability, season, and market demand to suggest the most profitable crop.</p>
              <form onSubmit={handleRecommendCrop} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                {[
                  { label:'🏔 Soil Type', id:'soil', opts:['Black','Red','Sandy','Clay','Loamy','Alluvial'] },
                  { label:'💧 Water Availability', id:'water', opts:['Light','Medium','Heavy','Drip Only'] },
                  { label:'📅 Cropping Season', id:'season', opts:['Kharif','Rabi','Zaid','Year Round'] },
                ].map(f=>(
                  <div key={f.id}>
                    <label className="fld">{f.label}</label>
                    <select className="input" value={cropInputs[f.id]} onChange={e=>setCropInputs(p=>({...p,[f.id]:e.target.value}))}>
                      {f.opts.map(o=><option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div>
                  <label className="fld">📐 Farm Area (Acres)</label>
                  <input className="input" type="number" value={cropInputs.area} min="0.1" step="0.5" onChange={e=>setCropInputs(p=>({...p,area:e.target.value}))} />
                </div>
                <button type="submit" className="btn btn-primary" style={{marginTop:'.5rem'}}>🧠 Generate AI Recommendation</button>
              </form>
            </div>
            <div className="card">
              <div className="section-title">📊 Recommendation Result</div>
              {recommendation ? (
                <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                  <div style={{background:'linear-gradient(135deg,rgba(34,197,94,.12),rgba(16,163,74,.06))',border:'1px solid rgba(34,197,94,.25)',borderRadius:12,padding:'1.25rem',textAlign:'center'}}>
                    <div style={{fontSize:'2rem',marginBottom:'.5rem'}}>🏆</div>
                    <div style={{fontSize:'1.6rem',fontWeight:800,color:'#4ade80'}}>{recommendation.crop}</div>
                    <div style={{fontSize:'.85rem',color:'#94a3b8',marginTop:'.3rem'}}>Best crop for your conditions</div>
                  </div>
                  {[
                    ['💵 Estimated Profit',    `₹${recommendation.profit}/season`],
                    ['⚠️ Risk Level',           recommendation.risk],
                    ['📊 Market Demand',         recommendation.demand],
                    ['🧪 Fertilizer Plan',       recommendation.fertilizer],
                    ['📦 Expected Yield',        recommendation.yieldPredict],
                    ['📈 Live Market Price',     `₹${(livePrices[recommendation.crop]||20).toFixed(2)}/unit`],
                  ].map(([k,v])=>(
                    <div key={k} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'1rem',padding:'.6rem .8rem',background:'rgba(255,255,255,.03)',borderRadius:8,border:'1px solid rgba(255,255,255,.05)'}}>
                      <span style={{fontSize:'.82rem',color:'#94a3b8',flexShrink:0}}>{k}</span>
                      <span style={{fontSize:'.85rem',fontWeight:700,color:'#e2e8f0',textAlign:'right'}}>{v}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:'1rem',opacity:.6,padding:'3rem 1rem',textAlign:'center'}}>
                  <span style={{fontSize:'3rem'}}>🌱</span>
                  <p style={{color:'#94a3b8',fontSize:'.9rem'}}>Fill the form and click Generate to get personalized crop advice from our AI engine.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════ TAB: DISEASE SCANNER ════════ */}
        {activeTab==='scanner' && (
          <div className="grid2">
            <div className="card">
              <div className="section-title">🔬 AI Leaf Disease Scanner</div>
              <p style={{fontSize:'.85rem',color:'#94a3b8',marginBottom:'1rem'}}>Select a sample leaf type and click Scan to simulate our computer vision disease detection model.</p>
              <div style={{display:'flex',gap:'.6rem',flexWrap:'wrap',marginBottom:'1rem'}}>
                {[{id:'spot',label:'🍅 Tomato (Leaf Spot)'},{id:'blast',label:'🌾 Rice (Blast Fungus)'},{id:'healthy',label:'🌿 Cotton (Healthy)'}].map(s=>(
                  <button key={s.id} className={`scan-btn${scanTarget===s.id?' active':''}`} onClick={()=>{setScanTarget(s.id);setScanResult(null);}}>{s.label}</button>
                ))}
              </div>
              <div onClick={triggerScan} style={{background:'rgba(10,18,30,.9)',border:'2px dashed rgba(74,222,128,.2)',borderRadius:14,height:240,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',position:'relative',overflow:'hidden',transition:'all .2s'}}>
                {scanning ? (
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:'2rem',animation:'pulse 1s infinite'}}>🔬</div>
                    <div style={{color:'#4ade80',fontWeight:700,marginTop:'.5rem'}}>Analyzing Leaf Sample…</div>
                    <div style={{position:'absolute',height:2,background:'linear-gradient(90deg,transparent,#4ade80,transparent)',width:'100%',left:0,animation:'scanLine 1.5s linear infinite'}}></div>
                  </div>
                ) : (
                  <div style={{textAlign:'center',padding:'1.5rem'}}>
                    <div style={{fontSize:'3rem'}}>📸</div>
                    <div style={{fontWeight:700,color:'#e2e8f0',marginTop:'.7rem'}}>Click to Start AI Scan</div>
                    <div style={{fontSize:'.78rem',color:'#94a3b8',marginTop:'.4rem'}}>Simulating: {scanTarget==='spot'?'Tomato Leaf Spot':scanTarget==='blast'?'Rice Blast Fungus':'Healthy Cotton Leaf'}</div>
                  </div>
                )}
              </div>
            </div>
            <div className="card">
              <div className="section-title">📋 Diagnosis Report</div>
              {scanResult ? (
                <div style={{display:'flex',flexDirection:'column',gap:'.85rem',animation:'fadeIn .5s ease'}}>
                  <div style={{background:scanResult.danger==='None'?'rgba(34,197,94,.1)':scanResult.danger==='High'?'rgba(239,68,68,.1)':'rgba(251,146,60,.1)',border:`1px solid ${scanResult.danger==='None'?'rgba(34,197,94,.3)':scanResult.danger==='High'?'rgba(239,68,68,.3)':'rgba(251,146,60,.3)'}`,borderRadius:10,padding:'1rem',textAlign:'center'}}>
                    <div style={{fontSize:'1.1rem',fontWeight:800,color:scanResult.danger==='None'?'#4ade80':scanResult.danger==='High'?'#f87171':'#fb923c'}}>{scanResult.disease}</div>
                    <div style={{fontSize:'.82rem',color:'#94a3b8',marginTop:'.25rem'}}>Confidence: <strong style={{color:'#e2e8f0'}}>{scanResult.confidence}</strong> | Risk: <strong style={{color:scanResult.danger==='None'?'#4ade80':scanResult.danger==='High'?'#f87171':'#fb923c'}}>{scanResult.danger}</strong></div>
                  </div>
                  {[['🛡️ Treatment',scanResult.medicine],['⚠️ Prevention',scanResult.prevention]].map(([t,v])=>(
                    <div key={t} style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',borderRadius:10,padding:'1rem'}}>
                      <div style={{fontWeight:700,color:'#e2e8f0',marginBottom:'.4rem'}}>{t}</div>
                      <p style={{fontSize:'.85rem',color:'#94a3b8',lineHeight:1.6}}>{v}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:'1rem',opacity:.5,padding:'3rem'}}>
                  <span style={{fontSize:'3rem'}}>🔬</span>
                  <p style={{color:'#94a3b8',textAlign:'center',fontSize:'.9rem'}}>Click on the scanner panel to analyze the leaf sample.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════ TAB: MARKET & PRICES ════════ */}
        {activeTab==='market' && (
          <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
            {/* Mandi Comparison */}
            <div className="grid2">
              <div className="card">
                <div className="section-title">🚚 Mandi Price Comparison — {marketCrop}</div>
                <div style={{display:'flex',gap:'.7rem',marginBottom:'1rem',flexWrap:'wrap'}}>
                  <div style={{flex:1}}>
                    <label className="fld">Commodity</label>
                    <select className="input" value={marketCrop} onChange={e=>setMarketCrop(e.target.value)}>
                      {ALL_CROPS.slice(0,60).map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{width:140}}>
                    <label className="fld">Transport ₹/kg</label>
                    <input className="input" type="number" step="0.5" value={transportCost} onChange={e=>setTransportCost(e.target.value)} />
                  </div>
                </div>
                <div style={{maxHeight:340,overflowY:'auto',display:'flex',flexDirection:'column',gap:'.4rem'}}>
                  {mandiResult.details.slice(0,12).map((m,i)=>(
                    <div key={m.name} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.6rem .9rem',borderRadius:8,background:i===0?'rgba(74,222,128,.08)':'rgba(255,255,255,.03)',border:i===0?'1px solid rgba(74,222,128,.2)':'1px solid rgba(255,255,255,.05)'}}>
                      <div>
                        <div style={{fontWeight:700,fontSize:'.85rem',color:'#e2e8f0'}}>{m.flag} {m.name} {i===0&&<span style={{background:'#22c55e',color:'#000',fontSize:'.65rem',padding:'.1rem .4rem',borderRadius:4,fontWeight:800,marginLeft:'.3rem'}}>BEST ⭐</span>}</div>
                        <div style={{fontSize:'.72rem',color:'#94a3b8'}}>{m.state} · Logistics: ₹{m.log}/kg</div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontWeight:800,color:'#4ade80'}}>₹{m.net}/kg</div>
                        <div style={{fontSize:'.72rem',color:'#94a3b8'}}>Mandi: ₹{m.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Farming Inputs */}
              <div className="card">
                <div className="section-title">🧪 Farming Inputs Cost by State</div>
                <div style={{marginBottom:'1rem'}}>
                  <label className="fld">State</label>
                  <select className="input" value={inputsState} onChange={e=>setInputsState(e.target.value)}>
                    {INPUT_STATE_MULTIPLIER && Object.keys(INPUT_STATE_MULTIPLIER).map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{maxHeight:320,overflowY:'auto',display:'flex',flexDirection:'column',gap:'.35rem'}}>
                  {COMMODITY_CATEGORIES['🧪 Farming Inputs']?.slice(0,14).map(item=>{
                    const base = BASE_PRICES[item]||100;
                    const stateP = +(base*(INPUT_STATE_MULTIPLIER?.[inputsState]||1)).toFixed(0);
                    const diff = stateP - base;
                    return (
                      <div key={item} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.5rem .7rem',borderRadius:7,background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.04)'}}>
                        <div>
                          <div style={{fontWeight:600,fontSize:'.8rem',color:'#e2e8f0'}}>{item}</div>
                          <div style={{fontSize:'.7rem',color:'#94a3b8'}}>Base: ₹{base}</div>
                        </div>
                        <div style={{textAlign:'right'}}>
                          <div style={{fontWeight:800,color:'#4ade80'}}>₹{stateP}</div>
                          <div style={{fontSize:'.68rem',color:diff>0?'#f87171':'#4ade80'}}>{diff>0?`+₹${diff} costlier`:`₹${Math.abs(diff)} cheaper`}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Full Live Rate Sheet */}
            <div className="card">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem',flexWrap:'wrap',gap:'1rem'}}>
                <div className="section-title" style={{marginBottom:0}}>📋 Live Commodity Rate Sheet</div>
                <input className="input" style={{width:280,margin:0}} placeholder="🔍 Search commodity…" value={marketSearch} onChange={e=>setMarketSearch(e.target.value)} />
              </div>
              {/* Category filter tabs */}
              <div style={{display:'flex',gap:'.4rem',overflowX:'auto',paddingBottom:'.5rem',marginBottom:'1rem'}}>
                <button className={`tab-btn${marketCategory==='All'?' active':''}`} onClick={()=>setMarketCategory('All')}>🌐 All</button>
                {Object.keys(COMMODITY_CATEGORIES).map(cat=>(
                  <button key={cat} className={`tab-btn${marketCategory===cat?' active':''}`} onClick={()=>setMarketCategory(cat)} style={{fontSize:'.76rem',padding:'.45rem .8rem'}}>{cat}</button>
                ))}
              </div>
              <div style={{maxHeight:440,overflowY:'auto',borderRadius:10,border:'1px solid rgba(255,255,255,.06)'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:'.82rem'}}>
                  <thead style={{position:'sticky',top:0,background:'#0d1a27',zIndex:1}}>
                    <tr style={{color:'#94a3b8',fontWeight:700,fontSize:'.75rem',textTransform:'uppercase',letterSpacing:'.06em'}}>
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
                      const lp    = livePrices[item] || BASE_PRICES[item] || 20;
                      const base  = BASE_PRICES[item] || 20;
                      const pct   = (((lp-base)/base)*100).toFixed(1);
                      const isUp  = priceTrend[item] !== 'down';
                      const flash = priceFlash[item];
                      const intl  = INTL_PRICES?.[item];
                      return (
                        <tr key={item} className={flash?(isUp?'flash-up':'flash-down'):''} style={{borderBottom:'1px solid rgba(255,255,255,.04)',cursor:'pointer'}} onClick={()=>setMarketCrop(item)}>
                          <td style={{padding:'.55rem 1rem',fontWeight:600,color:'#e2e8f0'}}>{item}</td>
                          <td style={{padding:'.55rem .7rem',fontSize:'.72rem',color:'#94a3b8'}}>{cat}</td>
                          <td style={{padding:'.55rem .7rem',textAlign:'right',fontWeight:800,color:isUp?'#4ade80':'#f87171'}}>₹{lp.toFixed(2)}</td>
                          <td style={{padding:'.55rem .7rem',textAlign:'right',fontSize:'.75rem',color:isUp?'#4ade80':'#f87171'}}>{isUp?'▲':'▼'}{Math.abs(pct)}%</td>
                          <td style={{padding:'.55rem .7rem',textAlign:'right',color:'#94a3b8'}}>₹{base}</td>
                          {INTL_PRICES && <td style={{padding:'.55rem .7rem',textAlign:'right',color:'#fbbf24'}}>{intl?`₹${intl.Dubai}`:'–'}</td>}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Price Alert */}
            <div className="card">
              <div className="section-title">🔔 Price Alert — Get Notified via Email / SMS</div>
              {alertSent && <div style={{background:'rgba(34,197,94,.1)',border:'1px solid rgba(34,197,94,.3)',borderRadius:8,padding:'.75rem 1rem',marginBottom:'1rem',fontSize:'.85rem',color:'#86efac'}}>✅ Alert set for <strong>{alertCrop}</strong> at threshold ₹{alertThreshold}. You'll be notified at <strong>{alertEmail||`+91 ${alertPhone}`}</strong>.</div>}
              <form onSubmit={handleAlert} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                <div><label className="fld">Commodity to Watch</label><select className="input" value={alertCrop} onChange={e=>setAlertCrop(e.target.value)}>{ALL_CROPS.slice(0,50).map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className="fld">Price Threshold (₹/unit)</label><input className="input" type="number" placeholder="e.g. 30" value={alertThreshold} onChange={e=>setAlertThreshold(e.target.value)} required /></div>
                <div><label className="fld">📧 Email Address</label><input className="input" type="email" placeholder="farmer@example.com" value={alertEmail} onChange={e=>setAlertEmail(e.target.value)} /></div>
                <div><label className="fld">📱 Phone (OTP)</label><input className="input" type="tel" placeholder="9876543210" maxLength={10} value={alertPhone} onChange={e=>setAlertPhone(e.target.value.replace(/\D/g,'').slice(0,10))} /></div>
                <button type="submit" className="btn btn-primary" style={{gridColumn:'span 2'}} disabled={alertSending||(!alertEmail&&!alertPhone)}>{alertSending?'📡 Sending…':'🔔 Set Alert & Notify Me'}</button>
              </form>
            </div>
          </div>
        )}

        {/* ════════ TAB: EXPENSE LEDGER ════════ */}
        {activeTab==='expenses' && (
          <div className="grid2">
            <div className="card">
              <div className="section-title">💰 Farm Expense Ledger</div>
              <div className="grid2" style={{marginBottom:'1.25rem'}}>
                <div style={{background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.2)',borderRadius:10,padding:'1rem'}}>
                  <div style={{fontSize:'.78rem',color:'#94a3b8'}}>Total Income</div>
                  <div style={{fontSize:'1.5rem',fontWeight:800,color:'#4ade80'}}>₹{totalIncome.toLocaleString('en-IN')}</div>
                </div>
                <div style={{background:'rgba(248,113,113,.08)',border:'1px solid rgba(248,113,113,.2)',borderRadius:10,padding:'1rem'}}>
                  <div style={{fontSize:'.78rem',color:'#94a3b8'}}>Total Expenses</div>
                  <div style={{fontSize:'1.5rem',fontWeight:800,color:'#f87171'}}>₹{totalExpense.toLocaleString('en-IN')}</div>
                </div>
              </div>
              <div style={{background:netReturn>=0?'rgba(74,222,128,.05)':'rgba(248,113,113,.05)',border:`1px solid ${netReturn>=0?'rgba(74,222,128,.2)':'rgba(248,113,113,.2)'}`,borderRadius:10,padding:'1rem',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
                <span style={{fontSize:'.9rem',color:'#94a3b8'}}>Net Profit / Loss</span>
                <span style={{fontSize:'1.3rem',fontWeight:800,color:netReturn>=0?'#4ade80':'#f87171'}}>{netReturn>=0?'+':''}₹{netReturn.toLocaleString('en-IN')}</span>
              </div>
              <form onSubmit={handleAddLedger} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.8rem'}}>
                <div><label className="fld">Type</label><select className="input" value={ledgerInput.type} onChange={e=>setLedgerInput(p=>({...p,type:e.target.value}))}><option value="expense">Expense (–)</option><option value="income">Income (+)</option></select></div>
                <div><label className="fld">Category</label><select className="input" value={ledgerInput.category} onChange={e=>setLedgerInput(p=>({...p,category:e.target.value}))}>{['Seeds','Fertilizer','Pesticide','Labor','Fuel','Equipment','Sales','Subsidy'].map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                <div style={{gridColumn:'span 2'}}><label className="fld">Description</label><input className="input" value={ledgerInput.desc} onChange={e=>setLedgerInput(p=>({...p,desc:e.target.value}))} placeholder="e.g. Bought 2 bags of Urea" /></div>
                <div><label className="fld">Amount (₹)</label><input className="input" type="number" value={ledgerInput.amount} onChange={e=>setLedgerInput(p=>({...p,amount:e.target.value}))} placeholder="Amount in Rupees" /></div>
                <div style={{display:'flex',alignItems:'flex-end'}}><button type="submit" className="btn btn-primary" style={{width:'100%'}}>+ Add Entry</button></div>
              </form>
            </div>
            <div className="card">
              <div className="section-title">📊 Recent Transactions</div>
              <div style={{display:'flex',flexDirection:'column',gap:'.5rem',maxHeight:460,overflowY:'auto'}}>
                {[...ledger].reverse().map(item=>(
                  <div key={item.id} className="ledger-item">
                    <div>
                      <div style={{fontWeight:600,color:'#e2e8f0',fontSize:'.83rem'}}>{item.desc}</div>
                      <div style={{fontSize:'.72rem',color:'#94a3b8'}}>{item.category} · {item.date}</div>
                    </div>
                    <div style={{fontWeight:800,fontSize:'1rem',color:item.type==='income'?'#4ade80':'#f87171'}}>
                      {item.type==='income'?'+':'–'} ₹{item.amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════ TAB: AI CHAT ════════ */}
        {activeTab==='chat' && (
          <div className="card" style={{maxWidth:800,margin:'0 auto'}}>
            <div className="section-title">🤖 AI Farming Assistant — Chat & Voice</div>
            <div style={{display:'flex',gap:'.5rem',flexWrap:'wrap',marginBottom:'1rem'}}>
              {['Is rain coming today?','Price of Tomato today?','Best fertilizer for cotton?','Which govt scheme for me?'].map(q=>(
                <button key={q} className="btn btn-outline" style={{fontSize:'.75rem',padding:'.35rem .75rem'}} onClick={()=>{
                  setChatMessages(p=>[...p,{sender:'user',text:q}]);
                  setChatInput(q);
                  setTimeout(()=>{ const e={preventDefault:()=>{}}; handleChat(e); },50);
                }}>💬 {q}</button>
              ))}
            </div>
            <div style={{background:'rgba(8,15,23,.8)',borderRadius:12,border:'1px solid rgba(255,255,255,.06)',padding:'1rem',height:360,overflowY:'auto',display:'flex',flexDirection:'column',gap:'.7rem',marginBottom:'1rem'}}>
              {chatMessages.map((m,i)=>(
                <div key={i} className={`chat-bubble ${m.sender}`}>{m.text}</div>
              ))}
              <div ref={chatEndRef}></div>
            </div>
            <form onSubmit={handleChat} style={{display:'flex',gap:'.7rem',alignItems:'center'}}>
              <button type="button" onClick={handleVoice} style={{background:isRecording?'rgba(239,68,68,.2)':'rgba(74,222,128,.08)',border:`1px solid ${isRecording?'rgba(239,68,68,.4)':'rgba(74,222,128,.25)'}`,borderRadius:10,padding:'.65rem .9rem',cursor:'pointer',fontSize:'1.2rem',animation:isRecording?'pulse 1s infinite':'none',flexShrink:0}} title="Voice Input">🎙️</button>
              <input className="input" style={{flex:1,margin:0}} value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Type in English, हिंदी, or తెలుగు…" />
              <button type="submit" className="btn btn-primary">Send ↗</button>
            </form>
          </div>
        )}

        {/* ════════ TAB: GOVT SCHEMES ════════ */}
        {activeTab==='schemes' && (
          <div className="grid2">
            {/* Eligibility checker */}
            <div className="card">
              <div className="section-title">📋 Eligibility Checker</div>
              <p style={{fontSize:'.85rem',color:'#94a3b8',marginBottom:'1.25rem'}}>Enter your details to instantly match eligible government schemes.</p>
              <div style={{display:'flex',flexDirection:'column',gap:'.9rem'}}>
                <div><label className="fld">🚜 Total Land Size (Acres)</label><input className="input" type="number" step="0.1" min="0" value={schemeLand} onChange={e=>setSchemeLand(e.target.value)} /></div>
                <div><label className="fld">📍 State Jurisdiction</label><select className="input" value={schemeState} onChange={e=>setSchemeState(e.target.value)}>{ALL_STATES && ALL_STATES.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                <div><label className="fld">🌾 Farming Sector</label><select className="input" value={schemeSector} onChange={e=>setSchemeSector(e.target.value)}><option value="Agriculture">Agriculture (Crops)</option><option value="Allied">Allied Sectors (Dairy, Beekeeping, Poultry)</option><option value="fisheries">Fisheries & Aquaculture</option></select></div>
                <div><label className="fld">👥 Social Category</label><select className="input" value={schemeSCST?'SC/ST/Women':'General'} onChange={e=>setSchemeSCST(e.target.value==='SC/ST/Women')}><option value="SC/ST/Women">SC / ST / Women Farmer</option><option value="General">General / OBC Farmer</option></select></div>
                <div style={{borderTop:'1px solid rgba(255,255,255,.06)',paddingTop:'1rem',display:'flex',flexDirection:'column',gap:'.7rem'}}>
                  <div style={{fontSize:'.75rem',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'.06em'}}>Document Status</div>
                  {[['schemeAadhaar',schemeAadhaar,setSchemeAadhaar,'🔗 Aadhaar Linked to Mobile'],['schemeBank',schemeBank,setSchemeBank,'🏦 Bank Account DBT Linked']].map(([k,v,set,lbl])=>(
                    <label key={k} style={{display:'flex',alignItems:'center',gap:'.6rem',cursor:'pointer',fontSize:'.875rem',color:'#e2e8f0'}}>
                      <input type="checkbox" checked={v} onChange={e=>set(e.target.checked)} style={{width:'1.1rem',height:'1.1rem',cursor:'pointer',accentColor:'#22c55e'}} />
                      {lbl}
                    </label>
                  ))}
                </div>
                <div style={{background:'rgba(255,255,255,.02)',borderRadius:8,padding:'.8rem',fontSize:'.8rem',color:'#64748b'}}>
                  ℹ️ Showing <strong style={{color:'#4ade80'}}>{matchingSchemes.length}</strong> schemes matching your profile.
                </div>
              </div>
            </div>

            {/* Matching Schemes list */}
            <div className="card">
              <div className="section-title">🏛 Eligible Schemes ({matchingSchemes.length})</div>
              <div style={{display:'flex',flexDirection:'column',gap:'.85rem',maxHeight:620,overflowY:'auto',paddingRight:'.25rem'}}>
                {GOVT_SCHEMES ? GOVT_SCHEMES.slice(0,12).map(scheme=>(
                  <div key={scheme.name} className="scheme-card">
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'1rem'}}>
                      <div>
                        <div style={{fontSize:'.7rem',color:'#4ade80',fontWeight:700,textTransform:'uppercase',letterSpacing:'.04em'}}>{scheme.ministry}</div>
                        <h4 style={{color:'#f1f5f9',fontSize:'.95rem',fontWeight:700,marginTop:'.2rem'}}>{scheme.name}</h4>
                      </div>
                      <span className="tag" style={{background:scheme.color||'#22c55e',color:'#000',flexShrink:0}}>{scheme.badge}</span>
                    </div>
                    <p style={{fontSize:'.82rem',color:'#94a3b8',lineHeight:1.6}}><strong style={{color:'#cbd5e1'}}>Benefit:</strong> {scheme.benefit}</p>
                    <div style={{background:'rgba(0,0,0,.2)',borderRadius:8,padding:'.75rem'}}>
                      <div style={{fontSize:'.72rem',fontWeight:700,color:'#e2e8f0',marginBottom:'.35rem'}}>📋 Required Documents</div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:'.35rem'}}>
                        {(scheme.docs||[]).map(doc=>{
                          const ok = (doc.toLowerCase().includes('aadhaar')&&schemeAadhaar)||(doc.toLowerCase().includes('bank')&&schemeBank);
                          return <span key={doc} className="tag" style={{background:ok?'rgba(34,197,94,.15)':'rgba(255,255,255,.07)',color:ok?'#4ade80':'#94a3b8',border:`1px solid ${ok?'rgba(34,197,94,.25)':'rgba(255,255,255,.1)'}`}}>{ok?'✅ ':'📄 '}{doc}</span>;
                        })}
                      </div>
                    </div>
                    <div style={{display:'flex',justifyContent:'flex-end'}}>
                      <a href={`https://${scheme.apply}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{textDecoration:'none',padding:'.45rem 1rem',fontSize:'.78rem'}}>Apply Online ↗</a>
                    </div>
                  </div>
                )) : <div style={{color:'#94a3b8',textAlign:'center',padding:'2rem'}}>No schemes data available.</div>}
              </div>
            </div>
          </div>
        )}

      </main>
      </div> {/* Closing Main Scrollable Content Area */}
      </div> {/* Closing Right Content Area */}

      {/* ══ Footer ══ */}
      <footer style={{borderTop:'1px solid rgba(74,222,128,.08)',padding:'1.25rem 1.5rem',textAlign:'center',fontSize:'.78rem',color:'#475569',marginTop:'2rem'}}>
        🌾 Smart Crop Advisor AI — Digital Farming Ecosystem for Indian Farmers · Live prices simulated · Official data from Agmarknet &amp; eNAM portals
      </footer>
    </div>
  );
}
