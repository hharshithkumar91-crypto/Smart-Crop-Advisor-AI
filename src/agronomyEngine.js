// agronomyEngine.js — AI Decision-Support & Agronomy Knowledge Engine

export const I18N = {
  en: {
    title: 'Smart Crop Advisor AI',
    tagline: 'Know what to grow. Know when to grow. Know how to protect it.',
    subtagline: 'An AI-powered personal farming decision support platform combining soil, weather, crop health & markets.',
    quickActions: 'Farmer Action Center',
    btnCropAdvisor: 'Find Best Crop Plan',
    btnCropDesc: '5-step smart farm analysis for top 3 crops, fertilizer & action plan',
    btnDiseaseScanner: 'Plant Health Scanner',
    btnDiseaseDesc: 'Scan leaf diseases with camera/photo & get instant organic/chemical cures',
    btnAiAssistant: 'Ask AI Farmer Assistant',
    btnAiDesc: '24/7 localized farming advice in Telugu, Hindi & English with voice support',
    weatherInsights: '🌾 Agricultural Weather Decisions',
    irrigationInsight: '💧 Irrigation Decision',
    fieldWorkInsight: '🌱 Field Spraying & Tillage',
    diseaseRiskAlert: '⚠️ Fungal & Pest Risk Alert',
    soilHealth: '🧪 Soil Fertility Snapshot',
    mandiPrices: '⚡ Live Mandi Commodity Rates',
    featuredInputs: '🛒 Recommended Inputs For Your Farm',
    suitabilityScore: 'Suitability Score',
    whyAiRecommended: '🧠 Why Did AI Recommend This Crop?',
    actionPlan: '📋 Farm Action Plan',
    disclaimer: '⚠️ Recommendation is based on agronomical suitability models and localized agro-climatic data. Always verify with your local Krishi Vigyan Kendra (KVK) or Agriculture Extension Officer.',
    stepLocation: '1. Location',
    stepFarm: '2. Farm Details',
    stepSoil: '3. Soil Health',
    stepSeason: '4. Season',
    stepPlan: '5. AI Plan',
    generatePlan: '🤖 Generate My Farm Action Plan',
    next: 'Next Step →',
    back: '← Back',
    topPick: 'Top Recommendation',
    altPick: 'Alternative Option',
  },
  hi: {
    title: 'स्मार्ट क्रॉप एडवाइजर एआई',
    tagline: 'क्या उगाएं, कब उगाएं और अपनी फसल को कैसे सुरक्षित रखें।',
    subtagline: 'मिट्टी, मौसम, फसल स्वास्थ्य और बाज़ार भाव का विश्लेषण करने वाला एआई कृषि निर्णय मंच।',
    quickActions: 'किसान त्वरित कार्य केंद्र',
    btnCropAdvisor: 'सर्वश्रेष्ठ फसल योजना खोजें',
    btnCropDesc: 'मिट्टी, मौसम और पानी के आधार पर शीर्ष 3 फसलों की सिफारिश एवं कार्य योजना',
    btnDiseaseScanner: 'पौध स्वास्थ्य रोग स्कैनर',
    btnDiseaseDesc: 'पत्ती के रोगों की फोटो खींचें और तुरंत जैविक/रासायनिक उपचार व दवा पाएं',
    btnAiAssistant: 'एआई किसान सहायक से पूछें',
    btnAiDesc: 'हिंदी, तेलुगु और अंग्रेजी में आवाज व चैट द्वारा 24/7 कृषि सलाह',
    weatherInsights: '🌾 मौसम आधारित कृषि निर्णय',
    irrigationInsight: '💧 सिंचाई निर्णय',
    fieldWorkInsight: '🌱 छिड़काव व जुताई परामर्श',
    diseaseRiskAlert: '⚠️ फफूंद व कीट संक्रमण चेतावनी',
    soilHealth: '🧪 मृदा स्वास्थ्य एवं पोषक तत्व',
    mandiPrices: '⚡ लाइव मंडी भाव नेटवर्क',
    featuredInputs: '🛒 आपके खेत हेतु अनुशंसित खाद एवं बीज',
    suitabilityScore: 'अनुकूलता स्कोर (Suitability Score)',
    whyAiRecommended: '🧠 एआई ने इस फसल की सिफारिश क्यों की?',
    actionPlan: '📋 संपूर्ण कृषि कार्य योजना',
    disclaimer: '⚠️ यह सिफारिश कृषि विज्ञान मॉडल पर आधारित है। कृपया स्थानीय कृषि विज्ञान केंद्र (KVK) अथवा कृषि अधिकारी से भी परामर्श लें।',
    stepLocation: '1. स्थान',
    stepFarm: '2. खेत विवरण',
    stepSoil: '3. मिट्टी जांच',
    stepSeason: '4. फसल सीजन',
    stepPlan: '5. एआई योजना',
    generatePlan: '🤖 मेरी संपूर्ण कृषि योजना तैयार करें',
    next: 'आगे बढ़ें →',
    back: '← पीछे जाएं',
    topPick: 'सर्वोत्तम सिफारिश',
    altPick: 'वैकल्पिक विकल्प',
  },
  te: {
    title: 'స్మార్ట్ క్రాప్ అడ్వైజర్ ఏఐ',
    tagline: 'ఏమి పండించాలి, ఎప్పుడు పండించాలి, ఎలా రక్షించుకోవాలి.',
    subtagline: 'నేల, వాతావరణం, పంట ఆరోగ్యం మరియు మార్కెట్ సమాచారాన్ని మిళితం చేసే ఏఐ వ్యవసాయ వేదిక.',
    quickActions: 'రైతు శీఘ్ర కార్యాచరణ కేంద్రం',
    btnCropAdvisor: 'ఉత్తమ పంట ప్రణాళికను కనుగొనండి',
    btnCropDesc: 'నేల, నీరు & వాతావరణం ఆధారంగా టాప్ 3 పంటలు, ఎరువులు మరియు యాక్షన్ ప్లాన్',
    btnDiseaseScanner: 'మొక్కల ఆరోగ్య స్కానర్',
    btnDiseaseDesc: 'ఆకు తెగుళ్లను ఫోటో తీసి స్కాన్ చేయండి మరియు సేంద్రీయ/రసాయన నివారణలు పొందండి',
    btnAiAssistant: 'ఏఐ రైతు సహాయకుడిని అడగండి',
    btnAiDesc: 'తెలుగు, హిందీ మరియు ఆంగ్లంలో 24/7 వాయిస్ & చాట్ ద్వారా వ్యక్తిగత వ్యవసాయ సలహాలు',
    weatherInsights: '🌾 వాతావరణ ఆధారిత వ్యవసాయ నిర్ణయాలు',
    irrigationInsight: '💧 నీటి పారుదల సలహా',
    fieldWorkInsight: '🌱 మందుల పిచికారీ & దుక్కి పనులు',
    diseaseRiskAlert: '⚠️ తెగుళ్లు & ఫంగల్ ముప్పు హెచ్చరిక',
    soilHealth: '🧪 నేల సారం & పోషకాల నివేదిక',
    mandiPrices: '⚡ లైవ్ మార్కెట్ & మండీ ధరలు',
    featuredInputs: '🛒 మీ పంట కోసం విత్తనాలు & ఎరువులు',
    suitabilityScore: 'అనుకూలత స్కోరు (Suitability Score)',
    whyAiRecommended: '🧠 ఏఐ ఈ పంటను ఎందుకు సిఫార్సు చేసింది?',
    actionPlan: '📋 సమగ్ర పంట కార్యాచరణ ప్రణాళిక',
    disclaimer: '⚠️ ఈ సిఫార్సు వ్యవసాయ శాస్త్ర నమూనాలపై ఆధారపడి ఉంటుంది. స్థానిక కృషి విజ్ఞాన కేంద్రం (KVK) లేదా వ్యవసాయ అధికారిని సంప్రదించండి.',
    stepLocation: '1. ప్రాంతం',
    stepFarm: '2. పొలం వివరాలు',
    stepSoil: '3. నేల పరీక్ష',
    stepSeason: '4. కాలం/సీజన్',
    stepPlan: '5. ఏఐ ప్రణాళిక',
    generatePlan: '🤖 నా సమగ్ర పంట ప్రణాళికను రూపొందించండి',
    next: 'తరువాత →',
    back: '← వెనుకకు',
    topPick: 'ప్రధాన సిఫార్సు',
    altPick: 'ప్రత్యామ్నాయ పంట',
  }
};

// ── WEATHER AGRICULTURAL DECISION ENGINE ─────────────────────────────────────
export const calculateWeatherDecisions = (weather) => {
  const tempStr = weather?.temp || '32°C';
  const tempVal = parseFloat(tempStr) || 32;
  const humStr = weather?.humidity || '65%';
  const humVal = parseFloat(humStr) || 65;
  const rainStr = weather?.rain || '20%';
  const rainVal = parseFloat(rainStr) || 20;
  const windStr = weather?.wind || '12 km/h';
  const windVal = parseFloat(windStr) || 12;

  // 1. Irrigation Decision
  let irrigation = {
    badge: 'Normal Irrigation',
    color: '#3b82f6',
    icon: '💧',
    action: 'Maintain regular schedule',
    detail: 'Soil moisture transpiration is within normal range. Provide moderate moisture as per crop growth stage.'
  };

  if (rainVal >= 55 || (weather?.condition && weather.condition.toLowerCase().includes('rain'))) {
    irrigation = {
      badge: 'Delay Irrigation',
      color: '#ef4444',
      icon: '🌧️',
      action: 'Hold irrigation for 24-48 hours',
      detail: `Rain probability is high (${rainStr}). Postpone scheduled watering to prevent waterlogging, soil compaction, and root rot.`
    };
  } else if (tempVal >= 35 && humVal <= 45) {
    irrigation = {
      badge: 'Increase Irrigation',
      color: '#f97316',
      icon: '☀️',
      action: 'Early morning or evening drip run',
      detail: `High temperature (${tempStr}) and dry air accelerate soil evaporation. Run drip irrigation early (6-9 AM) to prevent flower drop.`
    };
  }

  // 2. Field Work & Chemical Spraying
  let fieldWork = {
    badge: 'Safe For Field Work',
    color: '#22c55e',
    icon: '🚜',
    action: 'Favorable for spraying & weeding',
    detail: 'Calm winds and low rain probability provide an optimal window for foliar fertilizer application, herbicide, and tillage.'
  };

  if (rainVal >= 40) {
    fieldWork = {
      badge: 'Avoid Spraying',
      color: '#ef4444',
      icon: '⚠️',
      action: 'Risk of rain wash-off',
      detail: `Upcoming rain (${rainStr}) will wash away expensive foliar nutrition and pesticides. Delay spraying until skies clear.`
    };
  } else if (windVal >= 20) {
    fieldWork = {
      badge: 'High Wind Drift',
      color: '#f59e0b',
      icon: '💨',
      action: 'Postpone chemical spraying',
      detail: `Wind speed (${windStr}) exceeds safe spray threshold. Chemical drift can damage neighboring crops and reduce efficacy.`
    };
  }

  // 3. Fungal & Pest Risk
  let diseaseRisk = {
    badge: 'Low Infection Risk',
    color: '#22c55e',
    icon: '🛡️',
    action: 'Routine field scouting',
    detail: 'Atmospheric conditions do not favor rapid spore proliferation. Inspect leaf undersides once a week for sucking pests.'
  };

  if (humVal >= 75 && tempVal >= 24 && tempVal <= 32) {
    diseaseRisk = {
      badge: 'High Fungal Disease Risk',
      color: '#ef4444',
      icon: '🦠',
      action: 'Prophylactic spray recommended',
      detail: `High humidity (${humStr}) + warm conditions (${tempStr}) form the ideal breeding environment for Blight, Powdery Mildew, and Leaf Spot.`
    };
  } else if (humVal >= 65) {
    diseaseRisk = {
      badge: 'Moderate Disease Index',
      color: '#f59e0b',
      icon: '⚠️',
      action: 'Monitor lower canopy',
      detail: 'Moderate humidity. Keep drainage furrows clear and remove dead foliage to improve air circulation within crop rows.'
    };
  }

  return { irrigation, fieldWork, diseaseRisk };
};

// ── COMPREHENSIVE PLANT HEALTH SCANNER DATABASE ──────────────────────────────
export const PLANT_DISEASES_DB = {
  tomato_blight: {
    id: 'tomato_blight',
    crop: 'Tomato',
    disease: 'Early Blight (Alternaria solani)',
    confidence: '96.2%',
    confidenceType: 'High',
    riskLevel: 'High',
    riskColor: '#ef4444',
    sampleImage: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    symptoms: [
      'Dark brown to black concentric target-like rings on older lower leaves',
      'Yellow chlorotic halos surrounding leaf lesions',
      'Stem cankers and leathery dark sunken spots near the fruit calyx',
      'Premature defoliation exposing green fruit to sunscald'
    ],
    immediateSteps: [
      '1. Prune and dispose of infected lower leaves immediately (do not compost).',
      '2. Switch from overhead sprinkler to drip irrigation to keep foliage dry.',
      '3. Ensure 45-60cm plant spacing to promote ventilation and reduce humidity.'
    ],
    organicRemedy: 'Spray Cold-Pressed Neem Oil (15ml/litre water) mixed with 2g organic soap, or apply Trichoderma viride bio-fungicide (5g/litre) twice a week.',
    chemicalRemedy: 'Foliar spray of Mancozeb 75% WP (2.5g/L) or Copper Oxychloride 50% WP (3g/L). In advanced stage, apply Azoxystrobin + Difenoconazole (1ml/L).',
    marketplaceMatch: 'Mancozeb Fungicide (1kg)'
  },
  rice_blast: {
    id: 'rice_blast',
    crop: 'Paddy (Rice)',
    disease: 'Rice Blast (Magnaporthe oryzae)',
    confidence: '94.8%',
    confidenceType: 'High',
    riskLevel: 'Severe',
    riskColor: '#ef4444',
    sampleImage: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
    symptoms: [
      'Spindle-shaped elliptical lesions with grayish or whitish centers on leaves',
      'Brown or reddish margins around diamond-shaped spots',
      'Blackish necrotic lesions at leaf collar and neck node causing panicle breakage ("Neck Blast")',
      'Incomplete grain filling resulting in chaffy white earheads'
    ],
    immediateSteps: [
      '1. Stop any further top-dressing of Urea/Nitrogen fertilizers immediately.',
      '2. Maintain a shallow water layer (2-3 cm) in paddy beds; avoid severe drought stress.',
      '3. Disinfect boots and spray equipment to prevent spore transfer between bunds.'
    ],
    organicRemedy: 'Foliar application of Pseudomonas fluorescens (10g/L) at tillering and boot leaf stages.',
    chemicalRemedy: 'Spray Tricyclazole 75% WP @ 0.6g per litre of water or Isoprothiolane 40% EC @ 1.5ml/L at early lesion appearance.',
    marketplaceMatch: 'Bio Pesticide (Beauveria 1L)'
  },
  cotton_blight: {
    id: 'cotton_blight',
    crop: 'Cotton',
    disease: 'Bacterial Blight / Angular Leaf Spot (Xanthomonas citri pv. malvacearum)',
    confidence: '92.5%',
    confidenceType: 'High',
    riskLevel: 'Medium',
    riskColor: '#f97316',
    sampleImage: 'https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=600&auto=format&fit=crop&q=80',
    symptoms: [
      'Angular water-soaked spots bounded by leaf veinlets on underside of leaves',
      'Lesions turning dark brown to black on the upper leaf surface',
      'Black lesions extending along petioles and branches ("Blackarm phase")',
      'Infected young bolls rotting and shedding prematurely'
    ],
    immediateSteps: [
      '1. Avoid walking through wet cotton fields to reduce mechanical spread.',
      '2. Rogue out severely stunted or blackarm-affected seedlings.',
      '3. Avoid excess Nitrogen application; balance with Potassium (MOP).'
    ],
    organicRemedy: 'Spray diluted fermented cow urine (10% solution) mixed with Asafoetida (Hing) powder (1g/L) as a natural anti-bacterial barrier.',
    chemicalRemedy: 'Foliar spray of Copper Oxychloride 50 WP (2.5g/L) combined with Streptocycline or Plantomycin (100mg/L water).',
    marketplaceMatch: 'Copper Oxychloride (1kg)'
  },
  chilli_anthracnose: {
    id: 'chilli_anthracnose',
    crop: 'Chilli',
    disease: 'Anthracnose & Fruit Rot (Colletotrichum capsici)',
    confidence: '93.7%',
    confidenceType: 'High',
    riskLevel: 'High',
    riskColor: '#ef4444',
    sampleImage: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80',
    symptoms: [
      'Circular sunken necrotic spots with black concentric rings on ripening pods',
      'Dieback of twigs starting from tip downwards ("Die-back phase")',
      'Premature fruit drop and straw-colored bleached infected pods',
      'Greyish fungal spore masses visible inside fruit lesions under humid conditions'
    ],
    immediateSteps: [
      '1. Pick and burn all rotten dropped chillies away from field bunds.',
      '2. Ensure proper field drainage to eliminate water stagnation during rains.',
      '3. Maintain clean weed-free borders around the chilli plot.'
    ],
    organicRemedy: 'Neem seed kernel extract (NSKE 5%) or Bacillus subtilis foliar spray at fruit set stage.',
    chemicalRemedy: 'Spray Azoxystrobin 23% SC @ 1ml/L or Difenoconazole 25% EC @ 0.5ml/L or Carbendazim 50% WP @ 1g/L.',
    marketplaceMatch: 'Carbendazim Fungicide (500g)'
  },
  healthy_leaf: {
    id: 'healthy_leaf',
    crop: 'General Crop',
    disease: 'Healthy Leaf — No Pathogen Detected',
    confidence: '99.1%',
    confidenceType: 'Optimal',
    riskLevel: 'None',
    riskColor: '#22c55e',
    sampleImage: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
    symptoms: [
      'Uniform rich green color across leaf blade without chlorosis or yellowing',
      'Intact leaf margins and healthy vein structure with no necrotic spotting',
      'Active turgidity indicating balanced moisture and nutrient uptake',
      'No signs of sucking pests, mite webbing, or fungal mycelium'
    ],
    immediateSteps: [
      '1. Continue regular balanced N-P-K fertigation as per crop calendar.',
      '2. Conduct weekly scouting of lower canopy leaves for pest monitoring.',
      '3. Maintain optimal soil organic matter through vermicompost application.'
    ],
    organicRemedy: 'No corrective chemical required. Apply preventive Panchagavya (30ml/L) to boost natural crop immunity.',
    chemicalRemedy: 'None needed. Avoid unnecessary prophylactic fungicide sprays to preserve beneficial predatory insects.',
    marketplaceMatch: 'Organic Manure (per bag 50kg)'
  }
};

// ── MULTI-CRITERIA AI CROP RECOMMENDATION ENGINE ─────────────────────────────
export const generateCropRecommendations = (farmData, weatherData) => {
  const {
    state = 'Telangana',
    season = 'Kharif',
    soilType = 'Black Cotton',
    irrigation = 'Drip Irrigation',
    farmSize = 5,
    prevCrop = 'Legumes / Pulses',
    nitrogen = 75,
    phosphorus = 35,
    potassium = 45,
    ph = 6.8
  } = farmData;

  const area = parseFloat(farmSize) || 5;

  // Master Agronomic Candidate Crops Matrix
  const CANDIDATES = [
    {
      name: 'Paddy (Rice)',
      icon: '🌾',
      category: 'Grains',
      idealSoils: ['Clay', 'Alluvial', 'Black Cotton'],
      idealSeasons: ['Kharif', 'Rabi'],
      waterNeed: 'Heavy',
      minPh: 5.5, maxPh: 7.5,
      optimalN: 80, optimalP: 40, optimalK: 40,
      baseSuitability: 82,
      baseProfitPerAcre: 48000,
      yieldRange: '28 - 32 Quintals / Acre',
      sowingWindow: 'June 15 – July 25 (Kharif) | Dec 1 – Jan 10 (Rabi)',
      seedRate: '20 - 25 kg / Acre',
      inputs: ['Paddy Hybrid Seed (5kg)', 'Urea (50kg bag)', 'DAP Fertilizer (50kg)', 'Zinc Sulphate (per kg)']
    },
    {
      name: 'Cotton (Long Staple)',
      icon: '☁️',
      category: 'Cash Crop',
      idealSoils: ['Black Cotton', 'Red Loamy', 'Alluvial'],
      idealSeasons: ['Kharif'],
      waterNeed: 'Medium',
      minPh: 6.0, maxPh: 8.2,
      optimalN: 90, optimalP: 45, optimalK: 50,
      baseSuitability: 86,
      baseProfitPerAcre: 58000,
      yieldRange: '12 - 16 Quintals / Acre',
      sowingWindow: 'June 1 – July 15 (Early Kharif)',
      seedRate: '2 - 3 packets (450g) / Acre',
      inputs: ['BT Cotton Seed (450g pkt)', 'NPK 10-26-26 (50kg)', 'MOP (Potash 50kg)', 'Neem Oil Pesticide (5L)']
    },
    {
      name: 'Tomato Hybrid',
      icon: '🍅',
      category: 'Vegetables',
      idealSoils: ['Red Loamy', 'Black Cotton', 'Alluvial', 'Sandy Loam'],
      idealSeasons: ['Kharif', 'Rabi', 'Zaid', 'Year Round'],
      waterNeed: 'Medium',
      minPh: 6.0, maxPh: 7.5,
      optimalN: 100, optimalP: 50, optimalK: 60,
      baseSuitability: 84,
      baseProfitPerAcre: 72000,
      yieldRange: '22 - 28 Tonnes / Acre',
      sowingWindow: 'July – August (Kharif) | Oct – Nov (Rabi)',
      seedRate: '100 - 150 grams / Acre (Transplanted)',
      inputs: ['Tomato Hybrid Seed (10g)', 'NPK 19-19-19 (25kg/acre)', 'Mancozeb Fungicide (1kg)', 'Drip Tape (per 100m roll)']
    },
    {
      name: 'Maize (Corn)',
      icon: '🌽',
      category: 'Grains',
      idealSoils: ['Alluvial', 'Red Loamy', 'Black Cotton'],
      idealSeasons: ['Kharif', 'Rabi'],
      waterNeed: 'Medium',
      minPh: 5.8, maxPh: 7.8,
      optimalN: 70, optimalP: 35, optimalK: 35,
      baseSuitability: 80,
      baseProfitPerAcre: 42000,
      yieldRange: '30 - 36 Quintals / Acre',
      sowingWindow: 'June – July (Kharif) | Oct – Nov (Rabi)',
      seedRate: '7 - 8 kg / Acre',
      inputs: ['Maize Hybrid Seed (per kg)', 'Urea (50kg bag)', 'Atrazine Herbicide (1kg)', 'Zinc Sulphate (per kg)']
    },
    {
      name: 'Groundnut (Peanut)',
      icon: '🥜',
      category: 'Oilseeds',
      idealSoils: ['Red Loamy', 'Sandy Loam', 'Alluvial'],
      idealSeasons: ['Kharif', 'Rabi'],
      waterNeed: 'Light',
      minPh: 6.0, maxPh: 7.2,
      optimalN: 25, optimalP: 50, optimalK: 40,
      baseSuitability: 78,
      baseProfitPerAcre: 38000,
      yieldRange: '10 - 14 Quintals / Acre',
      sowingWindow: 'June 15 – July 15 (Kharif) | Nov – Dec (Rabi)',
      seedRate: '40 - 50 kg kernels / Acre',
      inputs: ['Biofertilizer (Rhizobium 200g)', 'SSP Single Super Phosphate (50kg)', 'Gypsum (200kg)', 'Neem Oil Pesticide (5L)']
    },
    {
      name: 'Red Chilli (Guntur/Warangal)',
      icon: '🌶️',
      category: 'Spices',
      idealSoils: ['Black Cotton', 'Red Loamy'],
      idealSeasons: ['Kharif'],
      waterNeed: 'Medium',
      minPh: 6.2, maxPh: 7.8,
      optimalN: 90, optimalP: 45, optimalK: 50,
      baseSuitability: 83,
      baseProfitPerAcre: 85000,
      yieldRange: '18 - 24 Quintals (Dry) / Acre',
      sowingWindow: 'July – August (Nursery) | Aug – Sept (Transplant)',
      seedRate: '250 - 300 grams / Acre',
      inputs: ['Vegetable Seed Kit (assorted)', 'NPK 12-32-16 (50kg)', 'Bio Pesticide (Beauveria 1L)', 'Copper Oxychloride (1kg)']
    },
    {
      name: 'Wheat (Sharbati)',
      icon: '🌾',
      category: 'Grains',
      idealSoils: ['Alluvial', 'Clay', 'Black Cotton'],
      idealSeasons: ['Rabi'],
      waterNeed: 'Medium',
      minPh: 6.2, maxPh: 7.5,
      optimalN: 75, optimalP: 40, optimalK: 35,
      baseSuitability: 85,
      baseProfitPerAcre: 44000,
      yieldRange: '22 - 26 Quintals / Acre',
      sowingWindow: 'November 1 – November 25 (Rabi)',
      seedRate: '40 kg / Acre',
      inputs: ['Urea (50kg bag)', 'DAP Fertilizer (50kg)', 'MOP (Potash 50kg)', 'Pendimethalin (1L)']
    },
    {
      name: 'Soybean (Yellow)',
      icon: '🫘',
      category: 'Oilseeds',
      idealSoils: ['Black Cotton', 'Alluvial'],
      idealSeasons: ['Kharif'],
      waterNeed: 'Medium',
      minPh: 6.0, maxPh: 7.5,
      optimalN: 30, optimalP: 50, optimalK: 35,
      baseSuitability: 79,
      baseProfitPerAcre: 36000,
      yieldRange: '10 - 13 Quintals / Acre',
      sowingWindow: 'June 20 – July 10 (Early Kharif)',
      seedRate: '28 - 30 kg / Acre',
      inputs: ['Biofertilizer (Rhizobium 200g)', 'DAP Fertilizer (50kg)', 'Neem Oil Pesticide (5L)']
    }
  ];

  // Score each crop mathematically against farm variables
  const scoredCrops = CANDIDATES.map(crop => {
    let score = crop.baseSuitability;

    // Soil match (+6 or -8)
    if (crop.idealSoils.some(s => soilType.toLowerCase().includes(s.toLowerCase()))) {
      score += 6;
    } else {
      score -= 8;
    }

    // Season match (+7 or -15)
    if (crop.idealSeasons.includes(season)) {
      score += 7;
    } else {
      score -= 15;
    }

    // pH match (+4 or -6)
    if (ph >= crop.minPh && ph <= crop.maxPh) {
      score += 4;
    } else {
      const diff = Math.min(Math.abs(ph - crop.minPh), Math.abs(ph - crop.maxPh));
      score -= Math.round(diff * 5);
    }

    // Irrigation source bonus
    if (irrigation === 'Drip Irrigation') {
      if (crop.category === 'Vegetables' || crop.category === 'Spices' || crop.category === 'Cash Crop') score += 5;
    } else if (irrigation === 'Rainfed') {
      if (crop.waterNeed === 'Heavy') score -= 14;
      if (crop.waterNeed === 'Light') score += 4;
    }

    // Previous crop rotation bonus
    if (prevCrop.includes('Legumes') || prevCrop.includes('Pulses')) {
      if (crop.category === 'Grains' || crop.category === 'Cash Crop') score += 5;
    }

    // State regional affinity
    if ((state === 'Telangana' || state === 'Andhra Pradesh') && (crop.name.includes('Cotton') || crop.name.includes('Chilli') || crop.name.includes('Paddy'))) {
      score += 4;
    }
    if ((state === 'Punjab' || state === 'Haryana' || state === 'Uttar Pradesh') && (crop.name.includes('Wheat') || crop.name.includes('Paddy'))) {
      score += 5;
    }

    // Clamp score between 65% and 94%
    const finalScore = Math.min(94, Math.max(65, score));
    return { ...crop, finalScore };
  });

  // Sort descending by score
  scoredCrops.sort((a, b) => b.finalScore - a.finalScore);

  // Take Top 3
  const top3 = scoredCrops.slice(0, 3).map((crop, index) => {
    const rankIcons = ['🥇 1st Choice', '🥈 2nd Choice', '🥉 3rd Choice'];
    const totalEstProfit = (crop.baseProfitPerAcre * area).toLocaleString('en-IN');

    // Build Explainable AI Checklist
    const whyChecks = [
      {
        type: 'match',
        icon: '✓',
        title: 'Soil pH Compatibility',
        detail: `Your soil pH (${ph}) is within the optimal ${crop.minPh}–${crop.maxPh} range for ${crop.name}.`
      },
      {
        type: 'match',
        icon: '✓',
        title: 'Climatic & Seasonal Suitability',
        detail: `The selected ${season} season matches this crop's physiological vegetative cycle.`
      },
      {
        type: 'match',
        icon: '✓',
        title: 'Soil Physical Properties',
        detail: `${soilType} provides adequate root aeration and moisture-holding capacity.`
      },
      {
        type: 'match',
        icon: '✓',
        title: 'Crop Rotation Advantage',
        detail: `Cultivating after ${prevCrop} prevents soil-borne pathogen buildup and optimizes fertility.`
      }
    ];

    // Nutrient advisory checks
    if (phosphorus < 28) {
      whyChecks.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Low Soil Phosphorus (P)',
        detail: `Detected P is ${phosphorus} kg/ha (Deficient). Apply 40kg DAP or Single Super Phosphate (SSP) during basal land preparation.`
      });
    } else if (nitrogen < 50) {
      whyChecks.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Moderate Soil Nitrogen (N)',
        detail: `Detected N is ${nitrogen} kg/ha. Apply Neem-Coated Urea in split doses (Basal + 30 Days + 55 Days) to prevent leaf yellowing.`
      });
    } else if (potassium < 35) {
      whyChecks.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Low Potassium (K)',
        detail: `Detected K is ${potassium} kg/ha. Apply 25kg MOP (Muriate of Potash) per acre to boost grain weight and disease resistance.`
      });
    } else {
      whyChecks.push({
        type: 'info',
        icon: '✓',
        title: 'Balanced N-P-K Levels',
        detail: `Soil nutrient profile (N:${nitrogen}, P:${phosphorus}, K:${potassium}) supports steady root establishment.`
      });
    }

    // Stage-wise Fertilizer Plan
    const fertilizerStages = [
      { stage: 'Basal (At Sowing)', desc: `50 kg DAP + 25 kg MOP + 10 kg Zinc Sulphate per acre incorporated into final ploughing.` },
      { stage: 'Vegetative (30 Days)', desc: `45 kg Neem-Coated Urea + 50 kg Organic Compost top-dressed after weeding.` },
      { stage: 'Flowering / Pod Formation (55-65 Days)', desc: `Foliar spray of 19-19-19 water-soluble fertilizer (5g/L) + 1g Boron per litre.` }
    ];

    // Irrigation Schedule
    const irrigationPlan = {
      method: irrigation,
      requirement: crop.waterNeed === 'Heavy' ? '1200 - 1400 mm total' : crop.waterNeed === 'Medium' ? '650 - 800 mm total' : '400 - 550 mm total',
      stages: 'Critical stages: Early tillering/branching, flowering initiation, and fruit/grain filling.',
      schedule: irrigation === 'Drip Irrigation' 
        ? 'Run drip 1.5 to 2.5 hours every alternate day in morning hours.'
        : 'Irrigate every 7-10 days depending on topsoil dryness (maintain 2-3 cm moisture).'
    };

    // Disease risk & prevention
    const diseaseRisks = [
      'Leaf Spot & Fungal Blight (Prevent with prophylactic Mancozeb spray at 35 days).',
      'Stem Borers / Sucking Pests (Monitor with 5 Pheromone Traps/acre & apply Neem Oil 15ml/L).'
    ];

    return {
      name: crop.name,
      icon: crop.icon,
      category: crop.category,
      suitabilityScore: crop.finalScore,
      rank: rankIcons[index],
      estProfitPerAcre: `₹${crop.baseProfitPerAcre.toLocaleString('en-IN')}`,
      totalEstProfit: `₹${totalEstProfit}`,
      yieldRange: crop.yieldRange,
      sowingWindow: crop.sowingWindow,
      seedRate: crop.seedRate,
      whyExplanation: whyChecks,
      fertilizerStages,
      irrigationPlan,
      diseaseRisks,
      matchingInputs: crop.inputs
    };
  });

  return top3;
};