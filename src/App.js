import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Auth, { SESSION_KEY } from './Auth';
import { getTotalUsers, getOnlineUsers, setUserOffline, getAllUsers, addListing, getActiveListings, rateListing } from './api';
import {
  COMMODITY_CATEGORIES, ALL_CROPS, BASE_PRICES,
  MANDI_DB, MANDI_MULTIPLIERS, STATE_MANDI_DISTANCES, INTL_PRICES,
  INPUT_STATE_MULTIPLIER, INDIA_LOCATIONS, ALL_STATES,
  WEATHER_DATA, GOVT_SCHEMES, MCX_COMMODITIES, FUEL_BASE_PRICES
} from './data';
import { fetchLiveWeather } from './weatherService';

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

// Starter listings for the marketplace — covering all categories with photos & stock
const STARTER_LISTINGS = [
  // 🥬 Vegetables
  {
    id: "veg_spinach",
    title: "Fresh Farm Organic Spinach (Palak)",
    category: "🥬 Vegetables",
    price: 18,
    quantity: 150,
    unit: "kg",
    description: "Freshly harvested nutrient-rich green spinach leaves. 100% organic without chemical sprays.",
    sellerId: "green_farm_1",
    sellerName: "Ramesh Organic Farms",
    sellerPhone: "9876543210",
    sellerLocation: { state: "Telangana", district: "Hyderabad", mandal: "Secunderabad" },
    rating: 4.9,
    ratingCount: 24,
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "veg_tomato",
    title: "Red Farm-Fresh Hybrid Tomatoes",
    category: "🥬 Vegetables",
    price: 22,
    quantity: 500,
    unit: "kg",
    description: "Juicy, firm red tomatoes suitable for long transport and market sales.",
    sellerId: "kisan_agro_2",
    sellerName: "Venkateswara Agri Farms",
    sellerPhone: "9440123456",
    sellerLocation: { state: "Andhra Pradesh", district: "Guntur", mandal: "Tenali" },
    rating: 4.8,
    ratingCount: 38,
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "veg_onion",
    title: "Premium Red Nasik Onions",
    category: "🥬 Vegetables",
    price: 28,
    quantity: 1000,
    unit: "kg",
    description: "High-grade dry red onions with long shelf life and rich flavor.",
    sellerId: "nashik_farms",
    sellerName: "Patil Farmer Producer Co.",
    sellerPhone: "9822012345",
    sellerLocation: { state: "Maharashtra", district: "Nashik", mandal: "Malegaon" },
    rating: 4.7,
    ratingCount: 42,
    image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "veg_potato",
    title: "Fresh Harvest Potato (Jyoti Grade A)",
    category: "🥬 Vegetables",
    price: 20,
    quantity: 800,
    unit: "kg",
    description: "Clean, dirt-free large potatoes ideal for cooking and wholesale distribution.",
    sellerId: "up_potatoes",
    sellerName: "Agra Wholesale Farmers",
    sellerPhone: "9711098765",
    sellerLocation: { state: "Uttar Pradesh", district: "Agra", mandal: "Etmadpur" },
    rating: 4.6,
    ratingCount: 19,
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=80"
  },

  // 🍎 Fruits
  {
    id: "fruit_mango",
    title: "Sweet Alphonso Mangoes (Ratnagiri)",
    category: "🍎 Fruits",
    price: 120,
    quantity: 200,
    unit: "kg",
    description: "Naturally ripened GI-tagged Ratnagiri Alphonso mangoes with rich aroma.",
    sellerId: "mango_king",
    sellerName: "Kokan Agro Orchards",
    sellerPhone: "9823456789",
    sellerLocation: { state: "Maharashtra", district: "Pune", mandal: "Haveli" },
    rating: 5.0,
    ratingCount: 56,
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "fruit_banana",
    title: "Organic Robusta Bananas",
    category: "🍎 Fruits",
    price: 28,
    quantity: 350,
    unit: "kg",
    description: "Sweet, nutrient-dense green-ripened robusta bananas.",
    sellerId: "kerala_fruits",
    sellerName: "Malabar Fruit Producers",
    sellerPhone: "9447012345",
    sellerLocation: { state: "Kerala", district: "Palakkad", mandal: "Ottappalam" },
    rating: 4.8,
    ratingCount: 31,
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "fruit_grapes",
    title: "Export Quality Seedless Green Grapes",
    category: "🍎 Fruits",
    price: 80,
    quantity: 250,
    unit: "kg",
    description: "Crisp, sweet Thomson seedless green grapes directly from vineyards.",
    sellerId: "grapes_nashik",
    sellerName: "Sahyadri Farmers Producer Co.",
    sellerPhone: "9822334455",
    sellerLocation: { state: "Maharashtra", district: "Nashik", mandal: "Dindori" },
    rating: 4.9,
    ratingCount: 29,
    image: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=500&auto=format&fit=crop&q=80"
  },

  // 🌾 Grains & Seeds
  {
    id: "grain_basmati",
    title: "1121 Premium Long-Grain Basmati Rice",
    category: "🌾 Grains & Seeds",
    price: 95,
    quantity: 500,
    unit: "kg",
    description: "Aromatic extra-long grain basmati rice, aged 12 months for fluffiness.",
    sellerId: "punjab_rice",
    sellerName: "Golden Field Millers",
    sellerPhone: "9814012345",
    sellerLocation: { state: "Punjab", district: "Amritsar", mandal: "Ajnala" },
    rating: 5.0,
    ratingCount: 47,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "grain_wheat",
    title: "Sharbati Gold Wheat (MP Special)",
    category: "🌾 Grains & Seeds",
    price: 32,
    quantity: 1200,
    unit: "kg",
    description: "Lustrous heavy grain Sharbati wheat, famous for soft rotis.",
    sellerId: "mp_grains",
    sellerName: "Narmada Valley Farmers",
    sellerPhone: "9826012345",
    sellerLocation: { state: "Madhya Pradesh", district: "Indore", mandal: "Sanwer" },
    rating: 4.8,
    ratingCount: 35,
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "seed_1",
    title: "Premium Hybrid Tomato Seeds",
    category: "🌾 Grains & Seeds",
    price: 150,
    quantity: 50,
    unit: "pkt",
    description: "High-yield, disease-resistant tomato seeds. Perfect for Kharif and Rabi seasons.",
    sellerId: "seed_corp",
    sellerName: "Krishna Seed Biotech",
    sellerPhone: "9848022338",
    sellerLocation: { state: "Telangana", district: "Hyderabad", mandal: "Secunderabad" },
    rating: 4.8,
    ratingCount: 12,
    image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500&auto=format&fit=crop&q=80"
  },

  // 🫘 Pulses & Spices
  {
    id: "pulse_toor",
    title: "Organic Desi Toor Dal (Arhar)",
    category: "🫘 Pulses & Spices",
    price: 140,
    quantity: 400,
    unit: "kg",
    description: "Unpolished natural Toor Dal high in protein and free from synthetic dyes.",
    sellerId: "gulbarga_dal",
    sellerName: "Deccan Pulses Co.",
    sellerPhone: "9845012345",
    sellerLocation: { state: "Karnataka", district: "Kalaburagi", mandal: "Kalaburagi City" },
    rating: 4.9,
    ratingCount: 22,
    image: "https://images.unsplash.com/photo-1585994191611-72ec0b73c41e?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "spice_turmeric",
    title: "High-Curcumin Salem Turmeric Powder/Fingers",
    category: "🫘 Pulses & Spices",
    price: 160,
    quantity: 300,
    unit: "kg",
    description: "Bright yellow aromatic turmeric with 5%+ curcumin content.",
    sellerId: "salem_spices",
    sellerName: "Kongu Spices & Herbs",
    sellerPhone: "9842012345",
    sellerLocation: { state: "Tamil Nadu", district: "Salem", mandal: "Attur" },
    rating: 5.0,
    ratingCount: 40,
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80"
  },

  // 🥜 Dry Fruits & Nuts
  {
    id: "dry_almond",
    title: "Raw California Almonds (Badam)",
    category: "🥜 Dry Fruits & Nuts",
    price: 750,
    quantity: 150,
    unit: "kg",
    description: "Crunchy, sweet, jumbo size California almonds packed with Vitamin E.",
    sellerId: "kashmir_dry",
    sellerName: "Himalayan Dry Fruits",
    sellerPhone: "9906012345",
    sellerLocation: { state: "Uttarakhand", district: "Dehradun", mandal: "Rishikesh" },
    rating: 4.9,
    ratingCount: 33,
    image: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "dry_cashew",
    title: "Whole W240 Jumbo Cashews (Kaju)",
    category: "🥜 Dry Fruits & Nuts",
    price: 900,
    quantity: 100,
    unit: "kg",
    description: "Export-grade unblemished whole cashew nuts from Mangaluru coastal farms.",
    sellerId: "cashew_coast",
    sellerName: "Mangalore Cashew Exports",
    sellerPhone: "9845912345",
    sellerLocation: { state: "Karnataka", district: "Mangaluru", mandal: "Puttur" },
    rating: 5.0,
    ratingCount: 45,
    image: "https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=500&auto=format&fit=crop&q=80"
  },

  // 🥛 Dairy & Oils
  {
    id: "dairy_ghee",
    title: "Pure A2 Desi Cow Bilona Ghee",
    category: "🥛 Dairy & Oils",
    price: 1100,
    quantity: 80,
    unit: "litre",
    description: "Traditional hand-churned Bilona method Ghee from Gir cow milk.",
    sellerId: "gir_dairy",
    sellerName: "Krishna Gaushala Organics",
    sellerPhone: "9825012345",
    sellerLocation: { state: "Gujarat", district: "Ahmedabad", mandal: "Sanand" },
    rating: 5.0,
    ratingCount: 62,
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80"
  },

  // 🧪 Fertilizers & Agri
  {
    id: "fert_1",
    title: "Organic NPK Fertilizer (Gromore)",
    category: "🧪 Fertilizers & Agri",
    price: 950,
    quantity: 120,
    unit: "bag",
    description: "Rich organic fertilizer with NPK 19-19-19 ratio. Increases crop yield and soil health.",
    sellerId: "agri_store",
    sellerName: "Balaji Agro Chemicals",
    sellerPhone: "9440123456",
    sellerLocation: { state: "Andhra Pradesh", district: "Guntur", mandal: "Tenali" },
    rating: 4.5,
    ratingCount: 8,
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "pest_1",
    title: "Pure Neem Oil Bio-Pesticide",
    category: "🧪 Fertilizers & Agri",
    price: 350,
    quantity: 80,
    unit: "litre",
    description: "100% cold-pressed neem oil. Highly effective natural pesticide for cotton and vegetable crops.",
    sellerId: "eco_grow",
    sellerName: "Green Earth Organics",
    sellerPhone: "9123456789",
    sellerLocation: { state: "Maharashtra", district: "Nagpur", mandal: "Katol" },
    rating: 4.6,
    ratingCount: 15,
    image: "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=500&auto=format&fit=crop&q=80"
  },

  // 🛠️ Farming Tools
  {
    id: "tool_1",
    title: "Heavy-Duty Hand Cultivator Tool",
    category: "🛠️ Farming Tools",
    price: 450,
    quantity: 25,
    unit: "pcs",
    description: "Ergonomic rust-resistant carbon steel garden tool for weeding and soil loosening.",
    sellerId: "tool_works",
    sellerName: "Kisan Steel & Tools",
    sellerPhone: "9876543210",
    sellerLocation: { state: "Karnataka", district: "Bengaluru", mandal: "Whitefield" },
    rating: 4.7,
    ratingCount: 20,
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&auto=format&fit=crop&q=80"
  }
];

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

  /* ── Live Weather ─────────────────────────────── */
  const [liveWeather, setLiveWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  /* ── Responsive Sidebar State ─────────────────── */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /* ── Farmers Registry State ─────────────────── */
  const [registeredFarmers, setRegisteredFarmers] = useState([]);
  const [directorySearch, setDirectorySearch]     = useState('');

  /* ── P2P Marketplace State ──────────────────── */
  const [activeListings, setActiveListingsState]  = useState([]);
  const [listingsLoading, setListingsLoading]     = useState(false);
  const [marketFilter, setMarketFilter]           = useState('All');
  const [marketSearchInput, setMarketSearchInput] = useState('');
  const [marketLocFilter, setMarketLocFilter]     = useState('All');
  const [marketplaceMode, setMarketplaceMode]     = useState('buy'); // 'buy' or 'sell'
  const [cart, setCart]                           = useState([]);
  const [isCartOpen, setIsCartOpen]               = useState(false);
  const [newListing, setNewListing] = useState({
    title: '', category: '🥬 Vegetables', price: '', quantity: '',
    unit: 'kg', description: '', imageUrl: '',
    sellerName: '', sellerPhone: '', sellerState: 'Telangana',
    sellerDistrict: 'Hyderabad', sellerMandal: 'Secunderabad'
  });
  const [successOrder, setSuccessOrder]           = useState(null);

  const chatEndRef = useRef(null);

  /* ══ EFFECTS ══════════════════════════════════════ */

  // Load session on mount
  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) try { setUser(JSON.parse(saved)); } catch(e) {}
    
    // Auto-load geo-detected location from permissions screen
    const detState = sessionStorage.getItem('detected_state');
    const detDistrict = sessionStorage.getItem('detected_district');
    if (detState) {
      setSelState(detState);
      if (detDistrict) {
        setSelDistrict(detDistrict);
        // pick first mandal
        const mandalsList = (INDIA_LOCATIONS[detState]?.[detDistrict]) || [];
        if (mandalsList.length) setSelMandal(mandalsList[0]);
      }
    }

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

  // Fetch directory and marketplace listings on mount
  useEffect(() => {
    async function loadDirectoryAndMarket() {
      try {
        const usersList = await getAllUsers();
        setRegisteredFarmers(usersList);
      } catch (e) {
        console.error("Error loading directory:", e);
      }

      setListingsLoading(true);
      try {
        const listingsList = await getActiveListings();
        if (listingsList.length > 0) {
          setActiveListingsState(listingsList);
        } else {
          setActiveListingsState(STARTER_LISTINGS);
        }
      } catch (e) {
        console.error("Error loading listings:", e);
        setActiveListingsState(STARTER_LISTINGS);
      } finally {
        setListingsLoading(false);
      }
    }
    
    if (user) {
      loadDirectoryAndMarket();
    }
  }, [user]);

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

  // Fetch live weather when location changes
  useEffect(() => {
    let cancelled = false;
    setWeatherLoading(true);
    fetchLiveWeather(selState, selDistrict, selMandal).then(data => {
      if (!cancelled) {
        setLiveWeather(data);
        setWeatherLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setWeatherLoading(false);
    });
    return () => { cancelled = true; };
  }, [selState, selDistrict, selMandal]);

  /* ══ HELPER FUNCTIONS ════════════════════════════ */

  const getWeather = (state) => {
    // Use live weather if available
    if (liveWeather) return liveWeather;
    // Fallback to static data
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

    const stateDistances = (STATE_MANDI_DISTANCES && STATE_MANDI_DISTANCES[selState]) || [];

    const rows = MANDI_DB.map((m, idx) => {
      const distanceKm = stateDistances[idx] !== undefined ? stateDistances[idx] : m.dist;
      const deliveryFee = distanceKm * 5; // 1 kilometer = 5 rupees
      const grossPrice = +(base * (MANDI_MULTIPLIERS[m.name] || 1)).toFixed(2);
      // Freight cost per kg (base + ₹5/km total delivery cost distributed per 100kg quintal = 0.05 per kg)
      const logCost = +(trans + distanceKm * 0.05).toFixed(2);
      const net = +(grossPrice - logCost).toFixed(2);
      return { 
        ...m, 
        distanceKm, 
        deliveryFee, 
        price: grossPrice, 
        log: logCost, 
        net 
      };
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

  // Category → Unsplash CDN fallback image
  const CATEGORY_IMAGES = {
    '🥬 Vegetables': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
    '🍎 Fruits':     'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&q=80',
    '🌾 Grains & Seeds': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80',
    '🫘 Pulses & Spices': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
    '🥜 Dry Fruits & Nuts': 'https://images.unsplash.com/photo-1563412580-2b36f02c1e9c?w=400&q=80',
    '🥛 Dairy & Oils': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
    '🧪 Fertilizers & Agri': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80',
    '🛠️ Farming Tools': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80',
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    // Validate all required fields
    if (!newListing.title.trim()) return alert('Product title is required.');
    if (!newListing.price || parseFloat(newListing.price) <= 0) return alert('Enter a valid price.');
    if (!newListing.quantity || parseFloat(newListing.quantity) <= 0) return alert('Enter a valid quantity.');
    const sName = newListing.sellerName.trim() || user.name || 'Farmer';
    const sPhone = newListing.sellerPhone.trim() || user.phone || '';
    if (!sPhone) return alert('Seller phone number is required for buyers to contact you.');
    if (sPhone && !/^\d{10}$/.test(sPhone)) return alert('Phone must be 10 digits (without +91).');

    const imageUrl = newListing.imageUrl.trim() ||
      CATEGORY_IMAGES[newListing.category] ||
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80';

    const listingData = {
      title: newListing.title.trim(),
      category: newListing.category,
      price: parseFloat(newListing.price),
      quantity: parseFloat(newListing.quantity),
      unit: newListing.unit,
      description: newListing.description.trim(),
      sellerId: user.phone || user.email || 'unknown',
      sellerName: sName,
      sellerPhone: sPhone,
      sellerLocation: {
        state: newListing.sellerState || selState,
        district: newListing.sellerDistrict || selDistrict,
        mandal: newListing.sellerMandal || selMandal
      },
      image: imageUrl,
      rating: 5.0,
      ratingCount: 1
    };

    const newId = await addListing(listingData);
    const finalListing = { id: newId || Date.now().toString(), ...listingData };

    setActiveListingsState(prev => [finalListing, ...prev]);
    setNewListing({
      title: '', category: '🥬 Vegetables', price: '', quantity: '',
      unit: 'kg', description: '', imageUrl: '',
      sellerName: '', sellerPhone: '', sellerState: 'Telangana',
      sellerDistrict: 'Hyderabad', sellerMandal: 'Secunderabad'
    });
    setMarketplaceMode('buy');
  };

  const handleRateProduct = async (listingId, stars) => {
    const isStarter = isNaN(listingId) ? (listingId.startsWith('seed') || listingId.startsWith('fert') || listingId.startsWith('pest') || listingId.startsWith('tool')) : true;
    
    if (!isStarter) {
      try {
        await rateListing(listingId, stars);
      } catch (e) {
        console.error("Error writing rating:", e);
      }
    }
    
    setActiveListingsState(prev => prev.map(item => {
      if (item.id === listingId) {
        const currentRating = item.rating || 5;
        const currentCount = item.ratingCount || 1;
        const newCount = currentCount + 1;
        const newRating = parseFloat(((currentRating * currentCount + stars) / newCount).toFixed(1));
        return {
          ...item,
          rating: newRating,
          ratingCount: newCount
        };
      }
      return item;
    }));
  };

  const handleAddToCart = (listing, qty) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === listing.id);
      if (existing) {
        return prev.map(item => item.id === listing.id ? { ...item, quantity: item.quantity + qty } : item);
      }
      return [...prev, {
        id: listing.id,
        title: listing.title,
        price: listing.price,
        quantity: qty,
        unit: listing.unit,
        sellerName: listing.sellerName,
        sellerPhone: listing.sellerPhone,
        sellerLocation: listing.sellerLocation,
        image: listing.image
      }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (id, newQty) => {
    if (newQty <= 0) {
      setCart(prev => prev.filter(item => item.id !== id));
    } else {
      setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item));
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const newTransactions = cart.map(item => ({
      id: Date.now() + Math.random(),
      type: 'expense',
      category: item.title.includes('Seeds') ? 'Seeds' :
                item.title.includes('Fertilizer') ? 'Fertilizer' :
                item.title.includes('Pesticide') ? 'Pesticide' : 'Equipment',
      desc: `Bought ${item.quantity} ${item.unit} of ${item.title} from ${item.sellerName}`,
      amount: item.price * item.quantity,
      date: new Date().toISOString().split('T')[0]
    }));

    setLedger(prev => [...prev, ...newTransactions]);
    setSuccessOrder(cart);
    setCart([]);
    setIsCartOpen(false);
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const clean = text.replace(/[*_#•]/g, '');
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.lang = lang === 'hi' ? 'hi-IN' : lang === 'te' ? 'te-IN' : 'en-IN';
        window.speechSynthesis.speak(utterance);
      } catch(e) {}
    }
  };

  const levDistance = (a, b) => {
    if (!a || !b) return 99;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          );
        }
      }
    }
    return matrix[b.length][a.length];
  };

  const hasFuzzyMatch = (qText, keywords) => {
    const cleanQ = qText.toLowerCase();
    const words = cleanQ.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
    for (const kw of keywords) {
      if (cleanQ.includes(kw)) return true;
      for (const w of words) {
        if (w.length >= 3 && kw.length >= 3) {
          if (w.startsWith(kw) || kw.startsWith(w)) return true;
          if (Math.abs(w.length - kw.length) <= 2 && levDistance(w, kw) <= 2) return true;
        }
      }
    }
    return false;
  };

  const generateChatGPTResponse = (text) => {
    const q = text.toLowerCase();
    const w = getWeather(selState);
    const tomP = (livePrices['Tomato'] || BASE_PRICES['Tomato'] || 22).toFixed(2);
    const onionP = (livePrices['Onion'] || BASE_PRICES['Onion'] || 28).toFixed(2);
    const cottonP = (livePrices['Cotton (170kg)'] || 28500).toFixed(0);

    // Weather & Rain (fuzzy spellings: rain, weat, wether, barish, mausam, mosam, varsham, pani, temp, etc.)
    if (hasFuzzyMatch(q, ['rain', 'weather', 'wether', 'waether', 'barish', 'baris', 'mausam', 'mosam', 'mosum', 'varsham', 'varsam', 'temp', 'temprature', 'cloud', 'clod'])) {
      return `🌦️ **Live Weather & Farming Advisory (${selMandal}, ${selState})**:\n\n` +
             `• **Current Temp**: ${w.temp || '32°C'} | **Humidity**: ${w.humidity || '68%'}\n` +
             `• **Rain Probability**: ${w.rain || '45%'} | **Condition**: ${w.condition || 'Partly Cloudy'}\n\n` +
             `💡 **Actionable Advice**: Moderate rain risk. If sowing Kharif crops (Paddy/Cotton/Maize), ensure field drainage channels are clear. Avoid applying chemical sprays right before rainfall.`;
    }

    // Mandi Rates & Commodity Prices (fuzzy: price, pric, mandi, madi, rate, rat, bhav, bhao, dam, cost, tomato, onion, cotton, etc.)
    if (hasFuzzyMatch(q, ['price', 'pric', 'prce', 'mandi', 'madi', 'mandee', 'rate', 'rat', 'bhav', 'bhao', 'dam', 'daam', 'cost', 'tomato', 'tomat', 'tamatar', 'onion', 'pyaaz', 'cotton', 'kapas'])) {
      return `💰 **Live Mandi Rates & Market Trends (${selState})**:\n\n` +
             `• 🍅 **Tomato**: ₹${tomP}/kg (Bengaluru Mandi offers +25% export premium)\n` +
             `• 🧅 **Onion**: ₹${onionP}/kg (Nashik & Guntur mandis reporting stable arrivals)\n` +
             `• ☁️ **Cotton**: ₹${cottonP}/bale (MCX futures showing bullish trend ▲)\n\n` +
             `📊 **Tip**: Visit the 'Market & Prices' tab to select any of 300+ commodities and calculate exact road distance with ₹5/km delivery charges!`;
    }

    // Fertilizer & NPK Dosage (fuzzy: fertilizer, fert, fertlisr, urea, dap, npk, khad, kaad, dosage, dose, compost)
    if (hasFuzzyMatch(q, ['fertilizer', 'fert', 'fertiliser', 'fertlisr', 'urea', 'ureia', 'dap', 'npk', 'khad', 'khaad', 'kaad', 'dosage', 'dosag', 'dose', 'compost'])) {
      return `🧪 **Precision Fertilizer Dosage Plan (Per Acre)**:\n\n` +
             `1. **Basal Dose (Sowing)**: 50 kg DAP + 25 kg MOP (Potash) + 10 kg Zinc Sulphate.\n` +
             `2. **First Top Dressing (30 Days)**: 45 kg Neem-Coated Urea + 50 kg Organic Compost.\n` +
             `3. **Flowering Stage (60 Days)**: 19-19-19 Foliar Spray (5g/L water) + 1 kg Boron.\n\n` +
             `⚠️ **Caution**: Avoid over-applying Urea to prevent vegetative overgrowth and pest infestation.`;
    }

    // Pest & Disease (fuzzy: pest, pestisid, pesticide, disease, desease, keeda, kida, fungus, bug, spot, blast, insect, neem, worm)
    if (hasFuzzyMatch(q, ['pest', 'pestisid', 'pesticide', 'disease', 'diseas', 'desease', 'keeda', 'kida', 'fungus', 'bug', 'spot', 'blast', 'insect', 'neem', 'worm', 'caterpillar'])) {
      return `🐛 **AI Crop Protection & Disease Cure**:\n\n` +
             `• **Sucking Pests (Aphids/Thrips)**: Spray Cold-Pressed Neem Oil (15ml/L) or Cypermethrin (1.5ml/L).\n` +
             `• **Fungal Blight / Leaf Spot**: Apply Copper Oxychloride 50 WP (2.5g/L) or Mancozeb (2g/L).\n` +
             `• **Bollworm in Cotton**: Use Pheromone Traps (5 per acre) + BT Bio-pesticide spray.\n\n` +
             `🔬 **Tip**: You can also take a photo of your leaf in the 'Disease Scanner' tab for instant AI diagnosis!`;
    }

    // Schemes & Subsidies (fuzzy: scheme, schem, skeme, subsidy, subsidey, kisan, kisn, pm, yojana, yojna, loan, bima, govt)
    if (hasFuzzyMatch(q, ['scheme', 'schem', 'skeme', 'subsidy', 'subsidey', 'subsidee', 'kisan', 'pm', 'yojana', 'yojna', 'yoana', 'loan', 'bima', 'beema', 'govt', 'gov'])) {
      return `🏛️ **Government Subsidies & Benefits Portal (${selState})**:\n\n` +
             `1. **PM-KISAN**: ₹6,000 yearly directly transferred to your bank in 3 equal ₹2,000 installments.\n` +
             `2. **PMFBY Insurance**: Protects against flood, drought, or storm damage at nominal 1.5–2% premium.\n` +
             `3. **Kisan Credit Card (KCC)**: Instant low-interest crop loan up to ₹3 Lakh at 4% effective interest.\n` +
             `4. **Sub-Mission on Mechanization**: Up to 80% subsidy for SC/ST/Women farmers on tractors & implements.\n\n` +
             `📋 Check the 'Govt Schemes' tab to verify your exact land eligibility!`;
    }

    // Drip & Irrigation (fuzzy: drip, irrigation, irrigatn, sinchai, secai, paani, pani, water, pipe)
    if (hasFuzzyMatch(q, ['drip', 'irrigation', 'irrigatn', 'sinchai', 'secai', 'seanchai', 'paani', 'pani', 'water', 'pipe'])) {
      return `💧 **Smart Water Management & Drip Fertigation**:\n\n` +
             `• **Water Efficiency**: Drip systems reduce water consumption by 50% while increasing crop yield by 35%.\n` +
             `• **Irrigation Schedule**: Run drip for 2 hours every morning during summer months.\n` +
             `• **Subsidy**: 80–90% subsidy under PMKSY Micro Irrigation scheme in ${selState}.\n\n` +
             `🌱 Soluble fertilizers like 19-19-19 can be directly fed through the drip venturi injector.`;
    }

    // Dairy & Livestock (fuzzy: milk, milik, dairy, dary, cow, caow, buffalo, baffalo, ghee, cattle, pashu)
    if (hasFuzzyMatch(q, ['milk', 'milik', 'dairy', 'dary', 'cow', 'caow', 'buffalo', 'baffalo', 'ghee', 'cattle', 'catle', 'pashu'])) {
      return `🥛 **Dairy Farming & Livestock Care**:\n\n` +
             `• **Milk Yield Booster**: Feed 25kg green fodder + 8kg dry straw + 1kg balanced concentrate per 2.5L milk.\n` +
             `• **Nutrition**: Add 50g Mineral Mixture daily to boost milk fat and SNF percentage.\n` +
             `• **Health**: Ensure periodic deworming every 3 months and annual Foot & Mouth Disease (FMD) vaccination.`;
    }

    return `🌾 **Smart Farm Advisor (ChatGPT Farming AI)**:\n\n` +
           `Regarding: "${text}"\n\n` +
           `• **Best Practice**: For optimal crop yields in ${selState}, maintain balanced soil pH (6.5–7.5) and organic carbon.\n` +
           `• **Market Strategy**: Sell produce when mandi prices hit green upward trends or leverage our P2P marketplace.\n` +
           `• **Weather Timing**: Always check 5-day weather forecasts before applying foliar fertilizers or pesticides.\n\n` +
           `💬 *Ask me about specific crops, fertilizer ratios, pest solutions, live rates, or govt subsidies!*`;
  };

  const handleChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput; setChatInput('');
    setChatMessages(prev => [...prev, { sender:'user', text }]);
    setTimeout(() => {
      const reply = generateChatGPTResponse(text);
      setChatMessages(prev => [...prev, { sender:'bot', text:reply }]);
      speakText(reply);
    }, 500);
  };

  const handleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'te' ? 'te-IN' : 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        setIsRecording(true);

        recognition.onresult = (event) => {
          setIsRecording(false);
          const transcript = event.results[0]?.[0]?.transcript;
          if (transcript) {
            setChatMessages(prev => [...prev, { sender: 'user', text: `🎙️ "${transcript}"` }]);
            const botReply = generateChatGPTResponse(transcript);
            setTimeout(() => {
              setChatMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
              speakText(botReply);
            }, 500);
          }
        };

        recognition.onerror = () => {
          setIsRecording(false);
          runVoiceSim();
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
        return;
      } catch (e) {
        console.error(e);
      }
    }
    runVoiceSim();
  };

  const runVoiceSim = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      const sampleQ = 'What is the best fertilizer and weather advisory for cotton crop?';
      setChatMessages(prev => [...prev, { sender: 'user', text: `🎙️ "${sampleQ}"` }]);
      const botReply = generateChatGPTResponse(sampleQ);
      setTimeout(() => {
        setChatMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
        speakText(botReply);
      }, 500);
    }, 2000);
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
    { id:'overview',    icon:'🏡', label:'Farm Overview' },
    { id:'marketplace', icon:'🛒', label:'Agri P2P Store' },
    { id:'directory',   icon:'👥', label:'Farmers Registry' },
    { id:'advisor',     icon:'🌱', label:'AI Crop Advisor' },
    { id:'scanner',     icon:'🔬', label:'Disease Scanner' },
    { id:'market',      icon:'📈', label:'Market & Prices' },
    { id:'expenses',    icon:'💰', label:'Expense Ledger' },
    { id:'chat',        icon:'🤖', label:'AI Chat & Voice' },
    { id:'schemes',     icon:'🏛', label:'Govt Schemes' },
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

        /* Responsive Sidebar Drawer for Mobile */
        .responsive-sidebar {
          width: 240px; background: #111; border-right: 1px solid #222;
          display: flex; flex-direction: column; flex-shrink: 0;
          height: calc(100vh - 36px); position: sticky; top: 36px;
          overflow-y: auto; padding: 1.25rem 1rem; z-index: 1000;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hamburger-btn {
          display: none;
          background: transparent;
          border: none;
          color: #f1f1f1;
          font-size: 1.4rem;
          cursor: pointer;
          padding: 0;
          align-items: center;
          justify-content: center;
          margin-right: 0.75rem;
        }

        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 999;
        }

        @media (max-width: 768px) {
          .responsive-sidebar {
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            height: 100vh;
            transform: translateX(-100%);
            box-shadow: 20px 0 50px rgba(0,0,0,0.8);
            z-index: 2000;
          }
          .responsive-sidebar.open {
            transform: translateX(0);
          }
          .hamburger-btn {
            display: inline-flex;
          }
          .sidebar-overlay.show {
            display: block;
          }
        }

        /* P2P Marketplace Styles */
        .marketplace-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .product-card {
          background: #1e1e1e;
          border: 1px solid #2a2a2a;
          border-radius: 14px;
          overflow: hidden;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }
        .product-card:hover {
          border-color: #22c55e;
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(34, 197, 94, 0.1);
        }
        .product-img-container {
          height: 180px;
          position: relative;
          background: #151515;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid #2a2a2a;
          overflow: hidden;
        }
        .product-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .product-img-fallback {
          font-size: 3.5rem;
        }
        .product-details {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .seller-badge {
          font-size: 0.72rem;
          background: #2563eb;
          color: #fff;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          font-weight: 600;
          display: inline-block;
        }
        .star-rating {
          display: inline-flex;
          gap: 0.15rem;
          color: #fbbf24;
          cursor: pointer;
        }
        .star-rating-static {
          display: inline-flex;
          gap: 0.15rem;
          color: #fbbf24;
        }
        
        /* Cart Overlay & Sidebar */
        .cart-sidebar {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 380px;
          background: #151515;
          border-left: 1px solid #2a2a2a;
          box-shadow: -10px 0 40px rgba(0, 0, 0, 0.7);
          z-index: 3000;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cart-sidebar.open {
          transform: translateX(0);
        }
        .cart-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          z-index: 2999;
          display: none;
        }
        .cart-overlay.open {
          display: block;
        }

        /* Farmers Directory */
        .directory-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .farmer-card {
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.2s ease;
          position: relative;
        }
        .farmer-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
        }
        .avatar-circle {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          font-weight: 700;
          color: #fff;
          position: relative;
          flex-shrink: 0;
        }
        .online-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid #1a1a1a;
          position: absolute;
          bottom: 2px;
          right: 2px;
        }
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

        {/* Sidebar backdrop overlay click shield (mobile only) */}
        <div className={`sidebar-overlay${isSidebarOpen ? ' show' : ''}`} onClick={() => setIsSidebarOpen(false)} />

        {/* ── Left Sidebar ── */}
        <aside className={`responsive-sidebar${isSidebarOpen ? ' open' : ''}`}>
          <div style={{ display:'flex', alignItems:'center', gap:'.7rem', marginBottom:'2rem', padding:'0 .25rem' }}>
            <span style={{ fontSize:'1.6rem' }}>🌾</span>
            <div>
              <div style={{ fontWeight:800, fontSize:'1rem', color:'#fff', letterSpacing:'-.01em' }}>Smart Crop AI</div>
              <div style={{ fontSize:'.7rem', color:'#666', fontWeight:500 }}>Farm Assistant</div>
            </div>
          </div>

          <nav style={{ display:'flex', flexDirection:'column', gap:'.2rem', flex:1 }}>
            {TABS.map(t => (
              <button key={t.id} className={`nav-btn${activeTab===t.id?' active':''}`} onClick={() => { setActiveTab(t.id); setIsSidebarOpen(false); }}>
                <span className="nav-icon">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </nav>

          <div style={{ marginTop:'auto', paddingTop:'1.25rem', borderTop:'1px solid #222' }}>
            {/* Live user stats */}
            <div style={{ display:'flex', gap:'.4rem', marginBottom:'.75rem' }}>
              <div style={{ flex:1, background:'#1a1a1a', borderRadius:6, padding:'.35rem .5rem', textAlign:'center' }}>
                <div style={{ fontSize:'.65rem', color:'#666' }}>Farmers</div>
                <div style={{ fontSize:'.85rem', fontWeight:700, color:'#60a5fa' }}>{totalUsers || '—'}</div>
              </div>
              <div style={{ flex:1, background:'#1a1a1a', borderRadius:6, padding:'.35rem .5rem', textAlign:'center' }}>
                <div style={{ fontSize:'.65rem', color:'#666' }}>Online</div>
                <div style={{ fontSize:'.85rem', fontWeight:700, color:'#22c55e' }}>{onlineUsers || '—'}</div>
              </div>
            </div>
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
            <div style={{ display:'flex', alignItems:'center', fontWeight:700, fontSize:'1rem', color:'#f1f1f1' }}>
              <button className="hamburger-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>☰</button>
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

            {/* ════ AGRI P2P MARKETPLACE ════ */}
            {activeTab==='marketplace' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Header Card */}
                <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>🛒 Farmers & Ingredients Marketplace</h2>
                    <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.2rem' }}>Direct peer-to-peer commerce. Buy and sell farming tools, seeds, fertilizers, and crop yields.</p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ background: '#222', borderRadius: '8px', padding: '0.25rem', display: 'flex' }}>
                      <button 
                        className={`btn ${marketplaceMode==='buy' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', borderRadius: '6px', border: 'none' }}
                        onClick={() => setMarketplaceMode('buy')}
                      >
                        Buy Produce
                      </button>
                      <button 
                        className={`btn ${marketplaceMode==='sell' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', borderRadius: '6px', border: 'none' }}
                        onClick={() => setMarketplaceMode('sell')}
                      >
                        Sell Your Crop
                      </button>
                    </div>

                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', position: 'relative' }}
                      onClick={() => setIsCartOpen(true)}
                    >
                      🛒 Cart ({cart.reduce((s,i)=>s+i.quantity,0)})
                      {cart.length > 0 && (
                        <span style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: '#fff', fontSize: '0.65rem', width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {cart.length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {marketplaceMode === 'buy' ? (
                  <>
                    {/* Filters Bar */}
                    <div className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <div style={{ flex: 2, minWidth: '200px' }}>
                        <label className="fld">Search</label>
                        <input 
                          className="input" 
                          placeholder="🔍 Search crops, fertilizers, tools..." 
                          value={marketSearchInput}
                          onChange={e => setMarketSearchInput(e.target.value)}
                        />
                      </div>
                      
                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <label className="fld">Location Filter</label>
                        <select className="input" value={marketLocFilter} onChange={e => setMarketLocFilter(e.target.value)}>
                          <option value="All">All Regions</option>
                          {ALL_STATES && ALL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <label className="fld">Category</label>
                        <select className="input" value={marketFilter} onChange={e => setMarketFilter(e.target.value)}>
                          <option value="All">All Categories</option>
                          <option value="🥬 Vegetables">🥬 Vegetables</option>
                          <option value="🍎 Fruits">🍎 Fruits</option>
                          <option value="🌾 Grains & Seeds">🌾 Grains & Seeds</option>
                          <option value="🫘 Pulses & Spices">🫘 Pulses & Spices</option>
                          <option value="🥜 Dry Fruits & Nuts">🥜 Dry Fruits & Nuts</option>
                          <option value="🥛 Dairy & Oils">🥛 Dairy & Oils</option>
                          <option value="🧪 Fertilizers & Agri">🧪 Fertilizers & Agri</option>
                          <option value="🛠️ Farming Tools">🛠️ Farming Tools</option>
                        </select>
                      </div>
                    </div>

                    {/* Listings Grid */}
                    {listingsLoading ? (
                      <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <span style={{ fontSize: '2rem' }}>🔄</span>
                        <p style={{ color: '#888', marginTop: '1rem' }}>Loading active marketplace listings...</p>
                      </div>
                    ) : (
                      <div className="marketplace-grid">
                        {(() => {
                          const sLower = marketSearchInput.toLowerCase();
                          const filtered = activeListings.filter(item => {
                            const matchSearch = (item.title || '').toLowerCase().includes(sLower) || 
                                                (item.description || '').toLowerCase().includes(sLower) ||
                                                (item.sellerName || '').toLowerCase().includes(sLower);
                            const matchCategory = marketFilter === 'All' || item.category === marketFilter;
                            const matchLocation = marketLocFilter === 'All' || item.sellerLocation?.state === marketLocFilter;
                            return matchSearch && matchCategory && matchLocation;
                          });

                          if (filtered.length === 0) {
                            return (
                              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
                                <span style={{ fontSize: '3rem' }}>🛒</span>
                                <p style={{ color: '#888', marginTop: '1rem' }}>No listings found matching filters.</p>
                              </div>
                            );
                          }

                          return filtered.map(item => (
                            <div key={item.id} className="product-card">
                              <div className="product-img-container">
                                {item.image && item.image.startsWith('http') ? (
                                  <img
                                    src={item.image}
                                    alt={item.title}
                                    className="product-img"
                                    loading="lazy"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div
                                  className="product-img-fallback"
                                  style={{ display: item.image && item.image.startsWith('http') ? 'none' : 'flex' }}
                                >
                                  {item.category?.includes('Vegetables') ? '🥬' :
                                   item.category?.includes('Fruits') ? '🍎' :
                                   item.category?.includes('Grains') ? '🌾' :
                                   item.category?.includes('Pulses') || item.category?.includes('Spices') ? '🫘' :
                                   item.category?.includes('Dry') ? '🥜' :
                                   item.category?.includes('Dairy') || item.category?.includes('Oils') ? '🥛' :
                                   item.category?.includes('Fertilizers') ? '🧪' : '🛠️'}
                                </div>
                              </div>
                              <div className="product-details">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                  <span style={{ fontSize: '0.72rem', background: '#2a2a2a', color: '#aaa', padding: '0.15rem 0.45rem', borderRadius: 4, fontWeight: 600 }}>
                                    {item.category}
                                  </span>
                                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#22c55e' }}>
                                    ₹{item.price} <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 500 }}>/ {item.unit}</span>
                                  </span>
                                </div>
                                
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '0.4rem' }}>{item.title}</h3>
                                <p style={{ fontSize: '0.78rem', color: '#888', lineHeight: 1.4, flex: 1, marginBottom: '0.75rem' }}>{item.description}</p>
                                
                                <div style={{ background: '#181818', padding: '0.6rem 0.75rem', borderRadius: 8, fontSize: '0.75rem', border: '1px solid #222', display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '0.75rem' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#888' }}>Seller:</span>
                                    <strong style={{ color: '#e2e8f0' }}>{item.sellerName}</strong>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#888' }}>Location:</span>
                                    <span style={{ color: '#e2e8f0' }}>📍 {item.sellerLocation?.mandal || 'Village'}, {item.sellerLocation?.state}</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#888' }}>Contact:</span>
                                    <span style={{ color: '#60a5fa', fontWeight: 600 }}>📞 +91 {item.sellerPhone}</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem', borderTop: '1px solid #222', paddingTop: '0.2rem' }}>
                                    <span style={{ color: '#888' }}>Stock:</span>
                                    <strong style={{ color: item.quantity > 5 ? '#22c55e' : '#ef4444' }}>{item.quantity} {item.unit}s left</strong>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                                    <span style={{ fontSize: '0.65rem', color: '#888', fontWeight: 600 }}>RATING ({item.ratingCount || 1})</span>
                                    <div className="star-rating">
                                      {[1,2,3,4,5].map(star => {
                                        const isGold = star <= Math.round(item.rating || 5);
                                        return (
                                          <span 
                                            key={star} 
                                            onClick={() => handleRateProduct(item.id, star)}
                                            style={{ fontSize: '1rem', transition: 'transform 0.1s' }}
                                            onMouseEnter={e => e.target.style.transform = 'scale(1.3)'}
                                            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                                          >
                                            {isGold ? '★' : '☆'}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                  <div style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', padding: '0.2rem 0.5rem', borderRadius: 4, fontSize: '0.75rem', fontWeight: 700 }}>
                                    {item.rating || 5.0} / 5.0
                                  </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                  {item.sellerId === (user.phone || user.email) ? (
                                    <button className="btn btn-outline" style={{ width: '100%', opacity: 0.6 }} disabled>
                                      ✏️ Your Listing
                                    </button>
                                  ) : item.quantity <= 0 ? (
                                    <button className="btn btn-outline" style={{ width: '100%', opacity: 0.5 }} disabled>
                                      ❌ Out of Stock
                                    </button>
                                  ) : (
                                    <>
                                      <button
                                        className="btn btn-primary"
                                        style={{ width: '100%' }}
                                        onClick={() => handleAddToCart(item, 1)}
                                      >
                                        🛒 Add to Cart
                                      </button>
                                      {item.sellerPhone && (
                                        <a
                                          href={`https://wa.me/91${item.sellerPhone}?text=${encodeURIComponent(`Hi ${item.sellerName}, I am interested in buying your listing: "${item.title}" at ₹${item.price}/${item.unit}. Please confirm availability.`)}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.5rem', background: '#16a34a', color: '#fff', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}
                                        >
                                          💬 WhatsApp Seller
                                        </a>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    )}
                  </>
                ) : (
                  /* ── Sell Form ── */
                  <div className="card" style={{ maxWidth: '680px', margin: '0 auto', width: '100%' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      🌾 List Your Crop / Product For Sale
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1.25rem' }}>
                      Fill in all details below. Buyers will contact you directly via phone/WhatsApp.
                    </p>

                    <form onSubmit={handleCreateListing} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                      {/* Product Info */}
                      <div style={{ background: '#181818', border: '1px solid #2a2a2a', borderRadius: 10, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#60a5fa', marginBottom: '-0.4rem' }}>📦 PRODUCT DETAILS</div>

                        <div>
                          <label className="fld">Product / Crop Title *</label>
                          <input className="input" placeholder="e.g. Fresh Organic Tomatoes — Grade A" value={newListing.title}
                            onChange={e => setNewListing(p => ({ ...p, title: e.target.value }))} required />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <label className="fld">Category *</label>
                            <select className="input" value={newListing.category} onChange={e => setNewListing(p => ({ ...p, category: e.target.value }))}>
                              <option value="🥬 Vegetables">🥬 Vegetables</option>
                              <option value="🍎 Fruits">🍎 Fruits</option>
                              <option value="🌾 Grains & Seeds">🌾 Grains & Seeds</option>
                              <option value="🫘 Pulses & Spices">🫘 Pulses & Spices</option>
                              <option value="🥜 Dry Fruits & Nuts">🥜 Dry Fruits & Nuts</option>
                              <option value="🥛 Dairy & Oils">🥛 Dairy & Oils</option>
                              <option value="🧪 Fertilizers & Agri">🧪 Fertilizers & Agri</option>
                              <option value="🛠️ Farming Tools">🛠️ Farming Tools</option>
                            </select>
                          </div>
                          <div>
                            <label className="fld">Unit Type *</label>
                            <select className="input" value={newListing.unit} onChange={e => setNewListing(p => ({ ...p, unit: e.target.value }))}>
                              <option value="kg">kilogram (kg)</option>
                              <option value="quintal">quintal</option>
                              <option value="tonne">tonne</option>
                              <option value="bag">bag (50 kg)</option>
                              <option value="pkt">packet (pkt)</option>
                              <option value="litre">litre</option>
                              <option value="dozen">dozen</option>
                              <option value="piece">piece</option>
                            </select>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <label className="fld">Price per Unit (₹) *</label>
                            <input className="input" type="number" placeholder="e.g. 50" value={newListing.price}
                              onChange={e => setNewListing(p => ({ ...p, price: e.target.value }))} required min="1" />
                          </div>
                          <div>
                            <label className="fld">Available Stock / Quantity *</label>
                            <input className="input" type="number" placeholder="e.g. 200" value={newListing.quantity}
                              onChange={e => setNewListing(p => ({ ...p, quantity: e.target.value }))} required min="1" />
                          </div>
                        </div>

                        <div>
                          <label className="fld">Description & Quality Details</label>
                          <textarea className="input" style={{ height: '90px', resize: 'vertical' }}
                            placeholder="Describe quality grade, organic status, harvest date, packaging, delivery terms, etc."
                            value={newListing.description}
                            onChange={e => setNewListing(p => ({ ...p, description: e.target.value }))} />
                        </div>

                        <div>
                          <label className="fld">Product Image URL (Optional)</label>
                          <input className="input" type="url" placeholder="https://example.com/product-photo.jpg (leave blank for auto-image)"
                            value={newListing.imageUrl}
                            onChange={e => setNewListing(p => ({ ...p, imageUrl: e.target.value }))} />
                          {newListing.imageUrl && newListing.imageUrl.startsWith('http') && (
                            <img src={newListing.imageUrl} alt="preview" style={{ marginTop: '0.5rem', height: 80, borderRadius: 6, objectFit: 'cover' }}
                              onError={e => e.target.style.display = 'none'} />
                          )}
                          {!newListing.imageUrl && (
                            <div style={{ fontSize: '0.7rem', color: '#555', marginTop: '0.3rem' }}>
                              Auto-image: <span style={{ color: '#888' }}>{CATEGORY_IMAGES[newListing.category] ? 'Unsplash CDN photo will be used' : 'Emoji fallback'}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Seller Info */}
                      <div style={{ background: '#181818', border: '1px solid #2a2a2a', borderRadius: 10, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#22c55e', marginBottom: '-0.4rem' }}>👤 SELLER / CONTACT DETAILS</div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <label className="fld">Your Full Name *</label>
                            <input className="input" placeholder={user.name || 'e.g. Ramesh Kumar'}
                              value={newListing.sellerName}
                              onChange={e => setNewListing(p => ({ ...p, sellerName: e.target.value }))} />
                            <div style={{ fontSize: '0.68rem', color: '#555', marginTop: '0.2rem' }}>Leave blank to use profile name: {user.name}</div>
                          </div>
                          <div>
                            <label className="fld">Mobile Number (10 digits) *</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                              <span style={{ background: '#222', border: '1px solid #333', borderRight: 'none', borderRadius: '8px 0 0 8px', padding: '0.6rem 0.75rem', fontSize: '0.875rem', color: '#888', whiteSpace: 'nowrap' }}>+91</span>
                              <input className="input" style={{ borderRadius: '0 8px 8px 0' }} type="tel" placeholder={user.phone || '9876543210'} maxLength={10}
                                value={newListing.sellerPhone}
                                onChange={e => setNewListing(p => ({ ...p, sellerPhone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} />
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#555', marginTop: '0.2rem' }}>Buyers will contact via WhatsApp/call</div>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                          <div>
                            <label className="fld">State *</label>
                            <select className="input" value={newListing.sellerState}
                              onChange={e => setNewListing(p => ({ ...p, sellerState: e.target.value, sellerDistrict: Object.keys(INDIA_LOCATIONS[e.target.value] || {})[0] || '', sellerMandal: '' }))}>
                              {ALL_STATES && ALL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="fld">District *</label>
                            <select className="input" value={newListing.sellerDistrict}
                              onChange={e => setNewListing(p => ({ ...p, sellerDistrict: e.target.value, sellerMandal: (INDIA_LOCATIONS[p.sellerState]?.[e.target.value])?.[0] || '' }))}>
                              {Object.keys(INDIA_LOCATIONS[newListing.sellerState] || {}).map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="fld">Mandal / Village *</label>
                            <select className="input" value={newListing.sellerMandal}
                              onChange={e => setNewListing(p => ({ ...p, sellerMandal: e.target.value }))}>
                              {(INDIA_LOCATIONS[newListing.sellerState]?.[newListing.sellerDistrict] || []).map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem', fontWeight: 'bold', fontSize: '1rem' }}>
                        🚀 Publish Listing to Marketplace
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* ════ FARMERS REGISTRY ════ */}
            {activeTab==='directory' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>👥 Registered Farmers Directory</h2>
                    <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.2rem' }}>Connect with agricultural producers and buyers in the community.</p>
                  </div>
                  <input 
                    className="input" 
                    style={{ width: '320px', margin: 0 }} 
                    placeholder="🔍 Search by name, village, or state..." 
                    value={directorySearch}
                    onChange={e => setDirectorySearch(e.target.value)}
                  />
                </div>

                <div className="directory-grid">
                  {(() => {
                    const searchLower = directorySearch.toLowerCase();
                    const filteredFarmers = registeredFarmers.filter(f => 
                      (f.name || '').toLowerCase().includes(searchLower) ||
                      (f.state || '').toLowerCase().includes(searchLower) ||
                      (f.district || '').toLowerCase().includes(searchLower) ||
                      (f.mandal || '').toLowerCase().includes(searchLower)
                    );

                    const displayFarmers = [...filteredFarmers];
                    if (user && !displayFarmers.some(f => f.phone === user.phone)) {
                      displayFarmers.push({
                        name: user.name || "You (Farmer)",
                        phone: user.phone || "",
                        email: user.email || "",
                        state: selState,
                        district: selDistrict,
                        mandal: selMandal,
                        isOnline: true,
                        isCurrentUser: true
                      });
                    }

                    if (displayFarmers.length === 0) {
                      return (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
                          <span style={{ fontSize: '3rem' }}>👥</span>
                          <p style={{ color: '#888', marginTop: '1rem' }}>No farmers match your search query.</p>
                        </div>
                      );
                    }

                    return displayFarmers.map((f, idx) => (
                      <div key={idx} className="farmer-card" style={{ borderLeft: f.isCurrentUser ? '4px solid #2563eb' : '1px solid #2a2a2a' }}>
                        <div className="avatar-circle" style={{ background: f.isCurrentUser ? '#1d4ed8' : '#22c55e' }}>
                          {(f.name || 'F').charAt(0).toUpperCase()}
                          <div className="online-dot" style={{ background: f.isOnline ? '#22c55e' : '#888' }}></div>
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{f.name}</span>
                            {f.isCurrentUser && <span style={{ background: '#2563eb', fontSize: '0.62rem', padding: '0.1rem 0.35rem', borderRadius: 4, fontWeight: 700 }}>YOU</span>}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.2rem' }}>
                            📍 {f.mandal || 'Village'}, {f.district}, {f.state}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#60a5fa', marginTop: '0.4rem', fontWeight: 600 }}>
                            📞 +91 {f.phone || '99999 99999'}
                          </div>
                        </div>
                        {!f.isCurrentUser && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <a href={`tel:${f.phone}`} className="btn btn-outline" style={{ padding: '0.35rem 0.6rem', fontSize: '0.7rem' }}>Call</a>
                            <a href={`https://wa.me/91${f.phone}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.7rem', background: '#16a34a' }}>Chat</a>
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

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
                  <div className="section-title" style={{justifyContent:'space-between'}}>
                    <span>🌤 Live Weather — {selMandal}, {selDistrict}, {selState}</span>
                    {liveWeather?.isLive && <span style={{fontSize:'.7rem',background:'#16a34a',color:'#fff',padding:'.15rem .5rem',borderRadius:4,fontWeight:700,animation:'pulse 2s infinite'}}>● LIVE</span>}
                    {weatherLoading && <span style={{fontSize:'.7rem',color:'#888'}}>Fetching...</span>}
                  </div>

                  {/* Primary Weather Stats */}
                  <div className="grid4">
                    {[
                      { icon:'🌡', label:'Temperature', val:weather.temp, sub:weather.feelsLike ? `Feels ${weather.feelsLike}` : null, color:'#f97316' },
                      { icon:'💧', label:'Humidity',    val:weather.humidity, sub:weather.cloudCover ? `Cloud ${weather.cloudCover}` : null, color:'#60a5fa' },
                      { icon:'🌧', label:'Rain Chance', val:weather.rain, sub:weather.precipitation ? `Precip ${weather.precipitation}` : null, color:'#818cf8' },
                      { icon:'💨', label:'Wind Speed',  val:weather.wind, sub:weather.windGusts ? `Gusts ${weather.windGusts}` : null, color:'#34d399' },
                    ].map(s=>(
                      <div key={s.label} className="stat-card">
                        <div style={{fontSize:'1.5rem'}}>{s.icon}</div>
                        <div style={{fontSize:'1.4rem',fontWeight:800,color:s.color}}>{s.val}</div>
                        <div style={{fontSize:'.75rem',color:'#888',fontWeight:600}}>{s.label}</div>
                        {s.sub && <div style={{fontSize:'.68rem',color:'#555',fontWeight:500}}>{s.sub}</div>}
                      </div>
                    ))}
                  </div>

                  {/* Extra live stats row */}
                  {liveWeather?.isLive && (
                    <div style={{display:'flex',gap:'.6rem',marginTop:'.75rem',flexWrap:'wrap'}}>
                      {[
                        { icon:'🌅', label:'Sunrise', val:weather.sunrise },
                        { icon:'🌇', label:'Sunset',  val:weather.sunset },
                        { icon:'🌤', label:'Condition', val:weather.condition },
                        { icon:'🔽', label:'Pressure', val:weather.pressure },
                      ].filter(s => s.val).map(s => (
                        <div key={s.label} style={{background:'#1f1f1f',border:'1px solid #2a2a2a',borderRadius:8,padding:'.5rem .8rem',display:'flex',alignItems:'center',gap:'.5rem',flex:'1 1 120px'}}>
                          <span style={{fontSize:'1rem'}}>{s.icon}</span>
                          <div>
                            <div style={{fontSize:'.68rem',color:'#888'}}>{s.label}</div>
                            <div style={{fontSize:'.85rem',fontWeight:700,color:'#e2e8f0'}}>{s.val}</div>
                          </div>
                        </div>
                      ))}
                      <div style={{background:'#1f1f1f',border:'1px solid #2a2a2a',borderRadius:8,padding:'.5rem .8rem',display:'flex',alignItems:'center',gap:'.5rem',flex:'1 1 120px'}}>
                        <span style={{fontSize:'1rem'}}>🕐</span>
                        <div>
                          <div style={{fontSize:'.68rem',color:'#888'}}>Updated</div>
                          <div style={{fontSize:'.85rem',fontWeight:700,color:'#e2e8f0'}}>{weather.lastUpdated || 'Just now'}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid2">
                  <div className="card">
                    <div className="section-title">📅 7-Day Forecast</div>
                    <div style={{background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.15)',borderRadius:8,padding:'.75rem',fontSize:'.83rem',color:'#fca5a5',marginBottom:'1rem',lineHeight:1.6}}>
                      ⚠️ <strong>Advisory:</strong> {weather.advisory}
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'.4rem'}}>
                      {(weather.forecast||[]).map((f,i)=>(
                        <div key={i} style={{textAlign:'center',background:'#222',borderRadius:8,padding:'.5rem .2rem',border:i===0?'1px solid #333':'1px solid transparent'}}>
                          <div style={{fontSize:'.65rem',color:i===0?'#22c55e':'#888',fontWeight:700}}>{i===0?'Today':f.day}</div>
                          {f.date && <div style={{fontSize:'.55rem',color:'#555'}}>{f.date}</div>}
                          <div style={{fontSize:'1.2rem',margin:'.2rem 0'}}>{f.icon}</div>
                          <div style={{fontSize:'.7rem',fontWeight:700,color:'#f87171'}}>{f.high}°</div>
                          <div style={{fontSize:'.65rem',color:'#60a5fa'}}>{f.low}°</div>
                          {f.rainChance !== undefined && <div style={{fontSize:'.55rem',color:'#818cf8',marginTop:'.15rem'}}>🌧{f.rainChance}%</div>}
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
                    <div className="section-title" style={{ justifyContent: 'space-between' }}>
                      <span>🚚 Best Mandi & Live Market — {marketCrop}</span>
                      <span style={{ fontSize: '.72rem', background: '#1e3a5f', color: '#60a5fa', padding: '.2rem .5rem', borderRadius: 6, fontWeight: 700 }}>
                        📍 From: {selState} (₹5/km delivery)
                      </span>
                    </div>
                    <div style={{display:'flex',gap:'.7rem',marginBottom:'1rem',flexWrap:'wrap'}}>
                      <div style={{flex:1}}>
                        <label className="fld">Commodity</label>
                        <select className="input" value={marketCrop} onChange={e=>setMarketCrop(e.target.value)}>
                          {ALL_CROPS.map(c=><option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div style={{width:140}}>
                        <label className="fld">Extra Handling &#x20B9;/kg</label>
                        <input className="input" type="number" step="0.5" value={transportCost} onChange={e=>setTransportCost(e.target.value)} />
                      </div>
                    </div>
                    <div style={{maxHeight:360,overflowY:'auto',display:'flex',flexDirection:'column',gap:'.4rem'}}>
                      {mandiResult.details.map((m,i)=>(
                        <div key={m.name} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.65rem .9rem',borderRadius:8,background:i===0?'rgba(34,197,94,.08)':'#1f1f1f',border:i===0?'1px solid rgba(34,197,94,.3)':'1px solid #2a2a2a'}}>
                          <div>
                            <div style={{fontWeight:700,fontSize:'.88rem',color:'#f1f1f1',display:'flex',alignItems:'center',gap:'.4rem'}}>
                              <span>{m.flag} {m.name}</span>
                              {i===0 && <span style={{background:'#16a34a',color:'#fff',fontSize:'.62rem',padding:'.1rem .4rem',borderRadius:4,fontWeight:800}}>BEST PROFIT ⭐</span>}
                            </div>
                            <div style={{fontSize:'.74rem',color:'#888',marginTop:'.2rem',display:'flex',gap:'.6rem',flexWrap:'wrap',alignItems:'center'}}>
                              <span>{m.state}</span>
                              <span>·</span>
                              <span style={{color:'#60a5fa',fontWeight:600}}>📍 {m.distanceKm} km</span>
                              <span>·</span>
                              <span style={{color:'#fbbf24',fontWeight:600}}>🚚 Delivery (₹5/km): &#x20B9;{(m.deliveryFee || 0).toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                          <div style={{textAlign:'right'}}>
                            <div style={{fontWeight:800,fontSize:'1.05rem',color:'#22c55e'}}>&#x20B9;{m.net}/kg net</div>
                            <div style={{fontSize:'.72rem',color:'#888'}}>Mandi: &#x20B9;{m.price}/kg</div>
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
                  <div style={{maxHeight:600,overflowY:'auto',borderRadius:10,border:'1px solid #222'}}>
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
                        {filteredCrops.map(({item,cat})=>{
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
              <div className="card" style={{maxWidth:850,margin:'0 auto',background:'linear-gradient(145deg, #161a23 0%, #0d1117 100%)',border:'1px solid #232d3f'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem',borderBottom:'1px solid #222d3d',paddingBottom:'.85rem'}}>
                  <div className="section-title" style={{marginBottom:0,color:'#93c5fd',fontSize:'1.1rem'}}>
                    🤖 ChatGPT AI Farming Assistant (Voice & Audio)
                  </div>
                  <div style={{fontSize:'.75rem',color:'#4ade80',background:'rgba(34,197,94,0.1)',padding:'.2rem .6rem',borderRadius:20,fontWeight:700,display:'flex',alignItems:'center',gap:'.4rem'}}>
                    <span style={{width:8,height:8,borderRadius:'50%',background:'#22c55e',display:'inline-block'}}></span>
                    AI Ready · {lang.toUpperCase()} Voice
                  </div>
                </div>

                {/* Prompt Guides / Presets */}
                <div style={{display:'flex',gap:'.5rem',flexWrap:'wrap',marginBottom:'1.25rem'}}>
                  {[
                    '🌦️ Weather & Rain Advisory',
                    '💰 Tomato & Mandi Rates',
                    '🧪 Cotton Fertilizer Dosage',
                    '🐛 Pest & Leaf Disease Remedy',
                    '🏛️ PM-KISAN & Subsidies',
                    '💧 Drip Irrigation Schedule',
                    '🥛 Milk & Dairy Yield Booster'
                  ].map(q => (
                    <button key={q} className="btn btn-outline" style={{fontSize:'.76rem',padding:'.4rem .75rem',background:'#121824',borderColor:'#232d3f',color:'#cbd5e1',borderRadius:8}} onClick={() => {
                      setChatMessages(p => [...p, { sender:'user', text: q }]);
                      const reply = generateChatGPTResponse(q);
                      setTimeout(() => {
                        setChatMessages(p => [...p, { sender:'bot', text: reply }]);
                        speakText(reply);
                      }, 400);
                    }}>
                      {q}
                    </button>
                  ))}
                </div>

                {/* Chat Message Window */}
                <div style={{background:'#090d16',borderRadius:12,border:'1px solid #1e293b',padding:'1.25rem',height:420,overflowY:'auto',display:'flex',flexDirection:'column',gap: '1rem',marginBottom:'1.25rem'}}>
                  {chatMessages.map((m, i) => (
                    <div key={i} className={`chat-bubble ${m.sender}`} style={{ position: 'relative', borderRadius: 12, padding: '0.85rem 1.1rem', maxWidth: '85%' }}>
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.9rem' }}>{m.text}</div>
                      {m.sender === 'bot' && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.4rem' }}>
                          <span style={{ fontSize: '0.68rem', color: '#64748b' }}>AI Expert Response</span>
                          <button 
                            onClick={() => speakText(m.text)} 
                            title="Listen out loud"
                            style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 6, padding: '0.2rem 0.6rem', color: '#60a5fa', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            🔊 Listen
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef}></div>
                </div>

                {/* Input & Voice Controls */}
                <form onSubmit={handleChat} style={{display:'flex',gap:'.75rem',alignItems:'center'}}>
                  <button 
                    type="button" 
                    onClick={handleVoice} 
                    style={{
                      background: isRecording ? 'rgba(239,68,68,0.2)' : '#1e293b',
                      border: `1px solid ${isRecording ? '#ef4444' : '#334155'}`,
                      borderRadius: 10,
                      padding: '.75rem 1rem',
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      animation: isRecording ? 'pulse 1s infinite' : 'none',
                      flexShrink: 0,
                      color: isRecording ? '#ef4444' : '#fff'
                    }}
                    title="Click to speak (Voice Input)"
                  >
                    🎙️ {isRecording ? 'Listening...' : ''}
                  </button>

                  <input 
                    className="input" 
                    style={{flex:1,margin:0,background:'#0f172a',border:'1px solid #334155',padding:'.75rem 1rem',fontSize:'.92rem',color:'#f8fafc'}} 
                    value={chatInput} 
                    onChange={e=>setChatInput(e.target.value)} 
                    placeholder="Ask anything in English, हिंदी, or తెలుగు (e.g. fertilizer dose, tomato rates, rainfall)..." 
                  />

                  <button type="submit" className="btn btn-primary" style={{padding:'.75rem 1.25rem',fontSize:'.9rem',fontWeight:700}}>
                    Send ↗
                  </button>
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

      {/* ── Cart Sidebar Panel ── */}
      <div className={`cart-overlay${isCartOpen ? ' open' : ''}`} onClick={() => setIsCartOpen(false)} />
      <div className={`cart-sidebar${isCartOpen ? ' open' : ''}`}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #2a2a2a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            🛒 Shopping Cart ({cart.reduce((s,i)=>s+i.quantity,0)})
          </h3>
          <button 
            style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '1.2rem', cursor: 'pointer' }}
            onClick={() => setIsCartOpen(false)}
          >
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cart.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justify: 'center', height: '80%', opacity: 0.4 }}>
              <span style={{ fontSize: '3rem' }}>🛒</span>
              <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '0.5rem' }}>Your shopping cart is empty.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '0.75rem', background: '#1c1c1c', border: '1px solid #222', borderRadius: '10px', padding: '0.75rem' }}>
                <div style={{ width: '45px', height: '45px', background: '#121212', borderRadius: '8px', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '1.4rem' }}>
                  {item.image === 'seeds' ? '🌾' :
                   item.image === 'fertilizer' ? '🧪' :
                   item.image === 'pesticide' ? '🌿' :
                   item.image === 'tools' ? '🛠️' : '📦'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.1rem' }}>
                    Seller: {item.sellerName}
                  </div>
                  <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#22c55e' }}>
                      ₹{item.price * item.quantity}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#121212', border: '1px solid #222', borderRadius: '6px', padding: '0.1rem' }}>
                      <button 
                        style={{ border: 'none', background: 'transparent', color: '#aaa', fontSize: '0.8rem', padding: '0.1rem 0.35rem', cursor: 'pointer' }}
                        onClick={() => handleUpdateCartQty(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#fff' }}>{item.quantity}</span>
                      <button 
                        style={{ border: 'none', background: 'transparent', color: '#aaa', fontSize: '0.8rem', padding: '0.1rem 0.35rem', cursor: 'pointer' }}
                        onClick={() => handleUpdateCartQty(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: '1.25rem', background: '#111', borderTop: '1px solid #2a2a2a' }}>
            <div style={{ display: 'flex', justify: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
              <span>Items Total:</span>
              <span>₹{cart.reduce((s,i) => s + i.price * i.quantity, 0)}</span>
            </div>
            <div style={{ display: 'flex', justify: 'space-between', marginBottom: '1rem', fontSize: '0.9rem', color: '#fff', fontWeight: 800 }}>
              <span>Grand Total:</span>
              <span style={{ color: '#22c55e' }}>₹{cart.reduce((s,i) => s + i.price * i.quantity, 0)}</span>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.75rem', fontWeight: 'bold', fontSize: '0.9rem', borderRadius: '8px' }}
              onClick={handleCheckout}
            >
              🤝 Complete P2P Checkout
            </button>
          </div>
        )}
      </div>

      {/* ── Checkout Success Modal ── */}
      {successOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.3s ease', border: '1px solid #22c55e', boxShadow: '0 8px 40px rgba(34, 197, 94, 0.2)' }}>
            <div style={{ fontSize: '3.5rem', animation: 'pulse 1.5s infinite' }}>🎉</div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#22c55e' }}>Order Successfully Placed!</h3>
              <p style={{ fontSize: '0.82rem', color: '#888', marginTop: '0.25rem' }}>Your order has been recorded. The sellers will contact you soon.</p>
            </div>

            <div style={{ background: '#151515', borderRadius: '10px', padding: '1rem', border: '1px solid #222', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', borderBottom: '1px solid #222', paddingBottom: '0.35rem' }}>
                Order Summary & Seller Contacts
              </div>
              {successOrder.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', gap: '0.5rem' }}>
                  <div style={{ textAlign: 'left', minWidth: 0 }}>
                    <div style={{ color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title} ({item.quantity} {item.unit})</div>
                    <div style={{ color: '#666', fontSize: '0.7rem' }}>Seller: {item.sellerName} (📍 {item.sellerLocation?.state})</div>
                  </div>
                  <a 
                    href={`https://wa.me/91${item.sellerPhone}?text=Hi%20${item.sellerName},%20I%20just%20placed%20an%20order%20for%20${item.quantity}%20${item.unit}%20of%20your%20${item.title}%20on%20Smart%20Crop%20Advisor%20AI!`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-primary" 
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.68rem', background: '#16a34a', textDecoration: 'none' }}
                  >
                    💬 WhatsApp
                  </a>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.15)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.78rem', color: '#86efac' }}>
              💰 <strong>Ledger Update:</strong> This purchase has been automatically logged under your **Expense Ledger** tab for seasonal cashflow tracking!
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.65rem' }} 
              onClick={() => setSuccessOrder(null)}
            >
              Done & Return to Market
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
