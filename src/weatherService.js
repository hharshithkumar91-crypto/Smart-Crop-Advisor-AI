// weatherService.js — Live weather from Open-Meteo (100% free, no API key)

// Coordinates for all Indian locations (state > district > representative lat/lng)
const LOCATION_COORDS = {
  'Telangana': {
    _default: { lat: 17.385, lng: 78.4867 },
    'Hyderabad': { lat: 17.385, lng: 78.4867 }, 'Warangal': { lat: 17.978, lng: 79.5941 },
    'Nizamabad': { lat: 18.672, lng: 78.094 }, 'Karimnagar': { lat: 18.4386, lng: 79.1288 },
    'Khammam': { lat: 17.2473, lng: 80.1514 }, 'Nalgonda': { lat: 17.0583, lng: 79.2671 },
    'Medak': { lat: 18.053, lng: 78.262 }, 'Ranga Reddy': { lat: 17.2543, lng: 78.3866 },
    'Mahbubnagar': { lat: 16.737, lng: 78.002 }, 'Adilabad': { lat: 19.6667, lng: 78.5322 },
  },
  'Andhra Pradesh': {
    _default: { lat: 17.6868, lng: 83.2185 },
    'Visakhapatnam': { lat: 17.6868, lng: 83.2185 }, 'Vijayawada': { lat: 16.5062, lng: 80.6480 },
    'Guntur': { lat: 16.3067, lng: 80.4365 }, 'Kurnool': { lat: 15.8281, lng: 78.0373 },
    'Nellore': { lat: 14.4426, lng: 79.9865 }, 'Kadapa': { lat: 14.4674, lng: 78.8241 },
    'Chittoor': { lat: 13.2172, lng: 79.1003 }, 'Anantapur': { lat: 14.6819, lng: 77.6006 },
    'Srikakulam': { lat: 18.2949, lng: 83.8938 }, 'East Godavari': { lat: 17.0005, lng: 81.8040 },
  },
  'Maharashtra': {
    _default: { lat: 19.076, lng: 72.8777 },
    'Mumbai': { lat: 19.076, lng: 72.8777 }, 'Pune': { lat: 18.5204, lng: 73.8567 },
    'Nashik': { lat: 19.9975, lng: 73.7898 }, 'Nagpur': { lat: 21.1458, lng: 79.0882 },
    'Aurangabad': { lat: 19.8762, lng: 75.3433 }, 'Solapur': { lat: 17.6599, lng: 75.9064 },
    'Kolhapur': { lat: 16.7050, lng: 74.2433 }, 'Amravati': { lat: 20.9320, lng: 77.7523 },
    'Sangli': { lat: 16.8524, lng: 74.5815 }, 'Satara': { lat: 17.6805, lng: 74.0183 },
  },
  'Karnataka': {
    _default: { lat: 12.9716, lng: 77.5946 },
    'Bengaluru Urban': { lat: 12.9716, lng: 77.5946 }, 'Mysuru': { lat: 12.2958, lng: 76.6394 },
    'Hubli-Dharwad': { lat: 15.3647, lng: 75.1240 }, 'Belagavi': { lat: 15.8497, lng: 74.4977 },
    'Mangaluru': { lat: 12.9141, lng: 74.8560 }, 'Kalaburagi': { lat: 17.3297, lng: 76.8343 },
    'Ballari': { lat: 15.1394, lng: 76.9214 }, 'Shivamogga': { lat: 13.9299, lng: 75.5681 },
    'Tumakuru': { lat: 13.3379, lng: 77.1173 }, 'Vijayapura': { lat: 16.8302, lng: 75.7100 },
  },
  'Tamil Nadu': {
    _default: { lat: 13.0827, lng: 80.2707 },
    'Chennai': { lat: 13.0827, lng: 80.2707 }, 'Coimbatore': { lat: 11.0168, lng: 76.9558 },
    'Madurai': { lat: 9.9252, lng: 78.1198 }, 'Salem': { lat: 11.6643, lng: 78.1460 },
    'Tirunelveli': { lat: 8.7139, lng: 77.7567 }, 'Trichy': { lat: 10.7905, lng: 78.7047 },
    'Vellore': { lat: 12.9165, lng: 79.1325 }, 'Erode': { lat: 11.3410, lng: 77.7172 },
    'Tiruppur': { lat: 11.1085, lng: 77.3411 }, 'Thanjavur': { lat: 10.7870, lng: 79.1378 },
  },
  'Uttar Pradesh': {
    _default: { lat: 26.8467, lng: 80.9462 },
    'Lucknow': { lat: 26.8467, lng: 80.9462 }, 'Kanpur': { lat: 26.4499, lng: 80.3319 },
    'Agra': { lat: 27.1767, lng: 78.0081 }, 'Varanasi': { lat: 25.3176, lng: 82.9739 },
    'Allahabad': { lat: 25.4358, lng: 81.8463 }, 'Meerut': { lat: 28.9845, lng: 77.7064 },
    'Mathura': { lat: 27.4924, lng: 77.6737 }, 'Aligarh': { lat: 27.8974, lng: 78.0880 },
    'Bareilly': { lat: 28.3670, lng: 79.4304 }, 'Gorakhpur': { lat: 26.7606, lng: 83.3732 },
  },
  'Punjab': {
    _default: { lat: 30.9010, lng: 75.8573 },
    'Ludhiana': { lat: 30.9010, lng: 75.8573 }, 'Amritsar': { lat: 31.6340, lng: 74.8723 },
    'Jalandhar': { lat: 31.3260, lng: 75.5762 }, 'Patiala': { lat: 30.3398, lng: 76.3869 },
    'Bathinda': { lat: 30.2110, lng: 74.9455 }, 'Hoshiarpur': { lat: 31.5143, lng: 75.9115 },
    'Gurdaspur': { lat: 32.0414, lng: 75.4032 }, 'Mohali': { lat: 30.7046, lng: 76.7179 },
    'Firozpur': { lat: 30.9219, lng: 74.6135 }, 'Moga': { lat: 30.8140, lng: 75.1726 },
  },
  'Gujarat': {
    _default: { lat: 23.0225, lng: 72.5714 },
    'Ahmedabad': { lat: 23.0225, lng: 72.5714 }, 'Surat': { lat: 21.1702, lng: 72.8311 },
    'Vadodara': { lat: 22.3072, lng: 73.1812 }, 'Rajkot': { lat: 22.3039, lng: 70.8022 },
    'Bhavnagar': { lat: 21.7645, lng: 72.1519 }, 'Junagadh': { lat: 21.5222, lng: 70.4579 },
    'Gandhinagar': { lat: 23.2156, lng: 72.6369 }, 'Anand': { lat: 22.5645, lng: 72.9289 },
    'Mehsana': { lat: 23.5880, lng: 72.3693 }, 'Kutch': { lat: 23.2420, lng: 69.6669 },
  },
  'Rajasthan': {
    _default: { lat: 26.9124, lng: 75.7873 },
    'Jaipur': { lat: 26.9124, lng: 75.7873 }, 'Jodhpur': { lat: 26.2389, lng: 73.0243 },
    'Kota': { lat: 25.2138, lng: 75.8648 }, 'Ajmer': { lat: 26.4499, lng: 74.6399 },
    'Udaipur': { lat: 24.5854, lng: 73.7125 }, 'Bikaner': { lat: 28.0229, lng: 73.3119 },
    'Alwar': { lat: 27.5530, lng: 76.6346 }, 'Sikar': { lat: 27.6094, lng: 75.1399 },
    'Nagaur': { lat: 27.2024, lng: 73.7340 }, 'Jhalawar': { lat: 24.5963, lng: 76.1650 },
  },
  'Madhya Pradesh': {
    _default: { lat: 23.2599, lng: 77.4126 },
    'Bhopal': { lat: 23.2599, lng: 77.4126 }, 'Indore': { lat: 22.7196, lng: 75.8577 },
    'Gwalior': { lat: 26.2183, lng: 78.1828 }, 'Jabalpur': { lat: 23.1815, lng: 79.9864 },
    'Ujjain': { lat: 23.1765, lng: 75.7885 }, 'Sagar': { lat: 23.8388, lng: 78.7378 },
    'Rewa': { lat: 24.5373, lng: 81.2985 }, 'Vidisha': { lat: 23.5239, lng: 77.8082 },
    'Chhindwara': { lat: 22.0574, lng: 78.9382 }, 'Khargone': { lat: 21.8243, lng: 75.6161 },
  },
  'West Bengal': {
    _default: { lat: 22.5726, lng: 88.3639 },
    'Kolkata': { lat: 22.5726, lng: 88.3639 }, 'Bardhaman': { lat: 23.2324, lng: 87.8615 },
    'Nadia': { lat: 23.4710, lng: 88.5565 }, 'Murshidabad': { lat: 24.1753, lng: 88.2668 },
    'Hooghly': { lat: 22.8963, lng: 88.3960 }, 'Malda': { lat: 25.0108, lng: 88.1411 },
    'Jalpaiguri': { lat: 26.5161, lng: 88.7185 }, 'Birbhum': { lat: 23.8561, lng: 87.6218 },
    'Bankura': { lat: 23.2297, lng: 87.0679 }, 'Medinipur': { lat: 22.4260, lng: 87.3197 },
  },
  'Bihar': {
    _default: { lat: 25.6093, lng: 85.1376 },
    'Patna': { lat: 25.6093, lng: 85.1376 }, 'Gaya': { lat: 24.7955, lng: 84.9994 },
    'Muzaffarpur': { lat: 26.1209, lng: 85.3647 }, 'Bhagalpur': { lat: 25.2425, lng: 86.9842 },
    'Darbhanga': { lat: 26.1542, lng: 85.8918 }, 'Arrah': { lat: 25.5563, lng: 84.6675 },
    'Purnia': { lat: 25.7771, lng: 87.4753 }, 'Munger': { lat: 25.3708, lng: 86.4735 },
    'Rohtas': { lat: 24.9537, lng: 84.0159 }, 'Aurangabad': { lat: 24.7536, lng: 84.3742 },
  },
  'Odisha': {
    _default: { lat: 20.2961, lng: 85.8245 },
    'Bhubaneswar': { lat: 20.2961, lng: 85.8245 }, 'Cuttack': { lat: 20.4625, lng: 85.8830 },
    'Sambalpur': { lat: 21.4669, lng: 83.9812 }, 'Berhampur': { lat: 19.3150, lng: 84.7941 },
    'Rourkela': { lat: 22.2604, lng: 84.8536 }, 'Balasore': { lat: 21.4942, lng: 86.9314 },
    'Baripada': { lat: 21.9322, lng: 86.7272 }, 'Bolangir': { lat: 20.7011, lng: 83.4846 },
    'Koraput': { lat: 18.8135, lng: 82.7123 }, 'Angul': { lat: 20.8408, lng: 85.1006 },
  },
  'Kerala': {
    _default: { lat: 8.5241, lng: 76.9366 },
    'Thiruvananthapuram': { lat: 8.5241, lng: 76.9366 }, 'Kochi (Ernakulam)': { lat: 9.9312, lng: 76.2673 },
    'Kozhikode': { lat: 11.2588, lng: 75.7804 }, 'Thrissur': { lat: 10.5276, lng: 76.2144 },
    'Palakkad': { lat: 10.7867, lng: 76.6548 }, 'Kollam': { lat: 8.8932, lng: 76.6141 },
    'Alappuzha': { lat: 9.4981, lng: 76.3388 }, 'Kottayam': { lat: 9.5916, lng: 76.5222 },
    'Malappuram': { lat: 11.0510, lng: 76.0711 }, 'Kannur': { lat: 11.8745, lng: 75.3704 },
  },
  'Haryana': {
    _default: { lat: 28.4595, lng: 77.0266 },
    'Gurugram': { lat: 28.4595, lng: 77.0266 }, 'Ambala': { lat: 30.3782, lng: 76.7767 },
    'Karnal': { lat: 29.6857, lng: 76.9905 }, 'Rohtak': { lat: 28.8955, lng: 76.6066 },
    'Hisar': { lat: 29.1492, lng: 75.7217 }, 'Sonipat': { lat: 28.9931, lng: 77.0151 },
    'Yamunanagar': { lat: 30.1290, lng: 77.2674 }, 'Kurukshetra': { lat: 29.9695, lng: 76.8783 },
    'Kaithal': { lat: 29.8015, lng: 76.3996 }, 'Jind': { lat: 29.3162, lng: 76.3148 },
  },
  'Assam': {
    _default: { lat: 26.1445, lng: 91.7362 },
    'Guwahati': { lat: 26.1445, lng: 91.7362 }, 'Silchar': { lat: 24.8333, lng: 92.7789 },
    'Dibrugarh': { lat: 27.4728, lng: 94.9120 }, 'Jorhat': { lat: 26.7509, lng: 94.2037 },
    'Nagaon': { lat: 26.3512, lng: 92.6840 }, 'Tezpur': { lat: 26.6528, lng: 92.7926 },
    'Barpeta': { lat: 26.3200, lng: 91.0068 }, 'Dhubri': { lat: 26.0220, lng: 89.9811 },
    'Karimganj': { lat: 24.8649, lng: 92.3550 }, 'Sivasagar': { lat: 26.9826, lng: 94.6425 },
  },
  'Jharkhand': {
    _default: { lat: 23.3441, lng: 85.3096 },
    'Ranchi': { lat: 23.3441, lng: 85.3096 }, 'Dhanbad': { lat: 23.7957, lng: 86.4304 },
    'Jamshedpur': { lat: 22.8046, lng: 86.2029 }, 'Hazaribagh': { lat: 23.9931, lng: 85.3637 },
    'Dumka': { lat: 24.2684, lng: 87.2488 }, 'Gumla': { lat: 23.0434, lng: 84.5429 },
    'Palamu': { lat: 24.0269, lng: 84.0523 }, 'Godda': { lat: 24.8270, lng: 87.2117 },
    'Chaibasa': { lat: 22.5547, lng: 85.8026 }, 'Khunti': { lat: 23.0713, lng: 85.2817 },
  },
  'Chhattisgarh': {
    _default: { lat: 21.2514, lng: 81.6296 },
    'Raipur': { lat: 21.2514, lng: 81.6296 }, 'Bilaspur': { lat: 22.0797, lng: 82.1409 },
    'Durg': { lat: 21.1904, lng: 81.2849 }, 'Korba': { lat: 22.3595, lng: 82.7501 },
    'Jagdalpur': { lat: 19.0837, lng: 82.0199 }, 'Raigarh': { lat: 21.8974, lng: 83.3950 },
    'Ambikapur': { lat: 23.1187, lng: 83.1990 }, 'Mahasamund': { lat: 21.1101, lng: 82.0974 },
    'Dhamtari': { lat: 20.7076, lng: 81.5498 }, 'Kanker': { lat: 20.2720, lng: 81.4918 },
  },
  'Himachal Pradesh': {
    _default: { lat: 31.1048, lng: 77.1734 },
    'Shimla': { lat: 31.1048, lng: 77.1734 }, 'Mandi': { lat: 31.7185, lng: 76.9318 },
    'Kangra': { lat: 32.0998, lng: 76.2691 }, 'Kullu': { lat: 31.9579, lng: 77.1095 },
    'Solan': { lat: 30.9045, lng: 77.0967 }, 'Una': { lat: 31.4685, lng: 76.2708 },
    'Hamirpur': { lat: 31.6862, lng: 76.5213 }, 'Bilaspur': { lat: 31.3381, lng: 76.7600 },
    'Chamba': { lat: 32.5534, lng: 76.1258 }, 'Kinnaur': { lat: 31.5839, lng: 78.1736 },
  },
  'Uttarakhand': {
    _default: { lat: 30.3165, lng: 78.0322 },
    'Dehradun': { lat: 30.3165, lng: 78.0322 }, 'Haridwar': { lat: 29.9457, lng: 78.1642 },
    'Nainital': { lat: 29.3803, lng: 79.4636 }, 'Udham Singh Nagar': { lat: 28.9800, lng: 79.4125 },
    'Almora': { lat: 29.5892, lng: 79.6467 }, 'Pauri Garhwal': { lat: 30.1410, lng: 78.7737 },
    'Tehri Garhwal': { lat: 30.3913, lng: 78.4313 }, 'Chamoli': { lat: 30.4030, lng: 79.3184 },
    'Pithoragarh': { lat: 29.5829, lng: 80.2182 }, 'Bageshwar': { lat: 29.8356, lng: 79.7717 },
  },
};

// WMO weather codes to human-readable conditions & icons
const WMO_CODES = {
  0: { desc: 'Clear Sky', icon: '☀️' },
  1: { desc: 'Mainly Clear', icon: '🌤' },
  2: { desc: 'Partly Cloudy', icon: '⛅' },
  3: { desc: 'Overcast', icon: '☁️' },
  45: { desc: 'Foggy', icon: '🌫' },
  48: { desc: 'Rime Fog', icon: '🌫' },
  51: { desc: 'Light Drizzle', icon: '🌦' },
  53: { desc: 'Moderate Drizzle', icon: '🌦' },
  55: { desc: 'Dense Drizzle', icon: '🌧' },
  61: { desc: 'Slight Rain', icon: '🌦' },
  63: { desc: 'Moderate Rain', icon: '🌧' },
  65: { desc: 'Heavy Rain', icon: '🌧' },
  71: { desc: 'Slight Snow', icon: '🌨' },
  73: { desc: 'Moderate Snow', icon: '🌨' },
  75: { desc: 'Heavy Snow', icon: '❄️' },
  80: { desc: 'Rain Showers', icon: '🌦' },
  81: { desc: 'Moderate Showers', icon: '🌧' },
  82: { desc: 'Heavy Showers', icon: '⛈' },
  95: { desc: 'Thunderstorm', icon: '⛈' },
  96: { desc: 'Thunderstorm + Hail', icon: '⛈' },
  99: { desc: 'Severe Storm', icon: '🌪' },
};

function getWMO(code) {
  return WMO_CODES[code] || { desc: 'Unknown', icon: '🌤' };
}

// Generate farming advisory based on weather conditions
function generateAdvisory(temp, humidity, rainChance, windSpeed, condition) {
  const advisories = [];
  if (temp >= 42) advisories.push('🔥 Extreme heat! Avoid fieldwork 11am–4pm. Heavy irrigation needed.');
  else if (temp >= 38) advisories.push('⚠️ High temperature. Water crops early morning or late evening.');
  else if (temp <= 10) advisories.push('❄️ Cold conditions. Protect tender crops from frost damage.');

  if (rainChance >= 80) advisories.push('🌧 Heavy rain likely. Delay pesticide spraying. Ensure field drainage.');
  else if (rainChance >= 50) advisories.push('🌦 Rain expected. Good for sowing. Pause chemical application.');
  else if (rainChance <= 10 && temp > 35) advisories.push('🏜 Dry & hot. Mulch soil to retain moisture. Irrigate daily.');

  if (humidity >= 85) advisories.push('💧 Very humid — watch for fungal diseases. Apply preventive fungicide.');
  else if (humidity <= 30) advisories.push('🌵 Low humidity. Increase irrigation frequency.');

  if (windSpeed >= 40) advisories.push('💨 Strong winds! Secure shade nets and crop supports.');
  else if (windSpeed >= 25) advisories.push('🌬 Windy conditions. Avoid spraying — drift risk high.');

  if (advisories.length === 0) advisories.push('✅ Good farming weather. Ideal for all field activities.');
  return advisories.join(' ');
}

// Cache to avoid repeated API calls
const weatherCache = {};
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export function getCoords(state, district) {
  const stateData = LOCATION_COORDS[state];
  if (!stateData) return { lat: 20.5937, lng: 78.9629 }; // India center
  return stateData[district] || stateData._default || { lat: 20.5937, lng: 78.9629 };
}

export async function fetchLiveWeather(state, district, mandal) {
  const cacheKey = `${state}|${district}`;
  const cached = weatherCache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const { lat, lng } = getCoords(state, district);

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset&timezone=Asia/Kolkata&forecast_days=7`;

    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();

    const current = json.current;
    const daily = json.daily;
    const DAYS_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const currentWMO = getWMO(current.weather_code);
    const rainProbToday = daily.precipitation_probability_max?.[0] ?? 0;

    const result = {
      temp: `${Math.round(current.temperature_2m)}°C`,
      tempRaw: Math.round(current.temperature_2m),
      feelsLike: `${Math.round(current.apparent_temperature)}°C`,
      humidity: `${current.relative_humidity_2m}%`,
      humidityRaw: current.relative_humidity_2m,
      rain: `${rainProbToday}%`,
      rainRaw: rainProbToday,
      wind: `${Math.round(current.wind_speed_10m)} km/h`,
      windRaw: Math.round(current.wind_speed_10m),
      windGusts: `${Math.round(current.wind_gusts_10m)} km/h`,
      cloudCover: `${current.cloud_cover}%`,
      pressure: `${Math.round(current.surface_pressure)} hPa`,
      precipitation: `${current.precipitation} mm`,
      condition: `${currentWMO.desc} ${currentWMO.icon}`,
      conditionIcon: currentWMO.icon,
      advisory: generateAdvisory(
        current.temperature_2m,
        current.relative_humidity_2m,
        rainProbToday,
        current.wind_speed_10m,
        currentWMO.desc
      ),
      forecast: daily.time.map((date, i) => {
        const d = new Date(date);
        const wmo = getWMO(daily.weather_code[i]);
        return {
          day: DAYS_ABBR[d.getDay()],
          date: `${d.getDate()}/${d.getMonth() + 1}`,
          icon: wmo.icon,
          desc: wmo.desc,
          high: Math.round(daily.temperature_2m_max[i]),
          low: Math.round(daily.temperature_2m_min[i]),
          rainChance: daily.precipitation_probability_max?.[i] ?? 0,
          precip: daily.precipitation_sum[i],
          windMax: Math.round(daily.wind_speed_10m_max[i]),
        };
      }),
      sunrise: daily.sunrise?.[0]?.split('T')[1] || '06:00',
      sunset: daily.sunset?.[0]?.split('T')[1] || '18:30',
      location: `${mandal || district}, ${district}, ${state}`,
      isLive: true,
      lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    weatherCache[cacheKey] = { data: result, timestamp: Date.now() };
    return result;
  } catch (err) {
    console.warn('Live weather fetch failed, using fallback:', err.message);
    // Return a fallback so the app doesn't break
    return null;
  }
}
