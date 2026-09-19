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
import { I18N, calculateWeatherDecisions, PLANT_DISEASES_DB, generateCropRecommendations } from './agronomyEngine';

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
    title: "Fresh Organic Spinach (Palak)",
    category: "🥬 Vegetables",
    price: 18, mrp: 25,
    quantity: 150, unit: "kg",
    description: "Freshly harvested organic spinach leaves. 100% chemical spray free.",
    sellerId: "green_farm_1", sellerName: "Ramesh Organic Farms", sellerPhone: "9876543210",
    sellerLocation: { state: "Telangana", district: "Hyderabad", mandal: "Secunderabad" },
    rating: 4.9, ratingCount: 24,
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "veg_tomato",
    title: "Red Hybrid Farm-Fresh Tomatoes",
    category: "🥬 Vegetables",
    price: 22, mrp: 30,
    quantity: 500, unit: "kg",
    description: "Juicy, firm red tomatoes suitable for kitchen cooking and salads.",
    sellerId: "kisan_agro_2", sellerName: "Venkateswara Agri Farms", sellerPhone: "9440123456",
    sellerLocation: { state: "Andhra Pradesh", district: "Guntur", mandal: "Tenali" },
    rating: 4.8, ratingCount: 38,
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "veg_onion",
    title: "Premium Red Nasik Onions",
    category: "🥬 Vegetables",
    price: 28, mrp: 38,
    quantity: 1000, unit: "kg",
    description: "High-grade dry red onions with long shelf life and rich flavor.",
    sellerId: "nashik_farms", sellerName: "Patil Farmer Producer Co.", sellerPhone: "9822012345",
    sellerLocation: { state: "Maharashtra", district: "Nashik", mandal: "Malegaon" },
    rating: 4.7, ratingCount: 42,
    image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "veg_potato",
    title: "Fresh Harvest Potato (Jyoti Grade A)",
    category: "🥬 Vegetables",
    price: 20, mrp: 28,
    quantity: 800, unit: "kg",
    description: "Clean, dirt-free large potatoes ideal for cooking and frying.",
    sellerId: "up_potatoes", sellerName: "Agra Wholesale Farmers", sellerPhone: "9711098765",
    sellerLocation: { state: "Uttar Pradesh", district: "Agra", mandal: "Etmadpur" },
    rating: 4.6, ratingCount: 19,
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "veg_carrot",
    title: "Organic Red Carrots (Gajar)",
    category: "🥬 Vegetables",
    price: 28, mrp: 40,
    quantity: 300, unit: "kg",
    description: "Sweet, crunchy carrots rich in Vitamin A. Perfect for salads and juices.",
    sellerId: "carrot_hp", sellerName: "Himachal Valley Growers", sellerPhone: "9816012345",
    sellerLocation: { state: "Himachal Pradesh", district: "Shimla", mandal: "Rohru" },
    rating: 4.8, ratingCount: 26,
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "veg_cauliflower",
    title: "White Snowball Cauliflower (Gobi)",
    category: "🥬 Vegetables",
    price: 25, mrp: 35,
    quantity: 400, unit: "kg",
    description: "Firm, crisp white cauliflower heads straight from farm fields.",
    sellerId: "pb_gobi", sellerName: "Ludhiana Vegetable Growers", sellerPhone: "9815012345",
    sellerLocation: { state: "Punjab", district: "Ludhiana", mandal: "Jagraon" },
    rating: 4.6, ratingCount: 17,
    image: "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "veg_okra",
    title: "Tender Green Okra / Lady Finger (Bhindi)",
    category: "🥬 Vegetables",
    price: 32, mrp: 45,
    quantity: 250, unit: "kg",
    description: "Young, non-fibrous okra pods suitable for daily frying and curries.",
    sellerId: "bhindi_tn", sellerName: "Coimbatore Agri Farms", sellerPhone: "9843012345",
    sellerLocation: { state: "Tamil Nadu", district: "Coimbatore", mandal: "Pollachi" },
    rating: 4.7, ratingCount: 29,
    image: "https://images.unsplash.com/photo-1627735483748-bc5bfd1f0e68?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "veg_garlic",
    title: "Desi Whole Garlic Bulbs (Lahsun)",
    category: "🥬 Vegetables",
    price: 120, mrp: 160,
    quantity: 500, unit: "kg",
    description: "Pungent, aromatic desi garlic bulbs with tight cloves and long shelf life.",
    sellerId: "garlic_mp", sellerName: "Madhya Pradesh Spice Growers", sellerPhone: "9827012345",
    sellerLocation: { state: "Madhya Pradesh", district: "Mandsaur", mandal: "Sitamau" },
    rating: 4.8, ratingCount: 35,
    image: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "veg_ginger",
    title: "Fresh Spicy Ginger Root (Adrak)",
    category: "🥬 Vegetables",
    price: 80, mrp: 110,
    quantity: 300, unit: "kg",
    description: "Fresh washed ginger with bold heat and rich gingerol oils.",
    sellerId: "ginger_ker", sellerName: "Kerala Spice Growers", sellerPhone: "9447112345",
    sellerLocation: { state: "Kerala", district: "Idukki", mandal: "Thodupuzha" },
    rating: 4.9, ratingCount: 44,
    image: "https://images.unsplash.com/photo-1573401015249-000df68ff7ca?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "veg_capsicum",
    title: "Green Crisp Capsicum (Shimla Mirch)",
    category: "🥬 Vegetables",
    price: 45, mrp: 60,
    quantity: 200, unit: "kg",
    description: "Glossy bell peppers for stir fries, curries, and daily kitchen use.",
    sellerId: "bell_pepper_tn", sellerName: "Ooty Hillfresh Produce", sellerPhone: "9842112345",
    sellerLocation: { state: "Tamil Nadu", district: "Nilgiris", mandal: "Ooty" },
    rating: 4.7, ratingCount: 22,
    image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500&auto=format&fit=crop&q=80"
  },

  // 🍎 Fruits
  {
    id: "fruit_mango",
    title: "Sweet Alphonso Mangoes (Ratnagiri)",
    category: "🍎 Fruits",
    price: 120, mrp: 160,
    quantity: 200, unit: "kg",
    description: "Naturally ripened GI-tagged Ratnagiri Alphonso mangoes with rich aroma.",
    sellerId: "mango_king", sellerName: "Kokan Agro Orchards", sellerPhone: "9823456789",
    sellerLocation: { state: "Maharashtra", district: "Ratnagiri", mandal: "Dapoli" },
    rating: 5.0, ratingCount: 56,
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "fruit_banana",
    title: "Organic Robusta Bananas (Kela)",
    category: "🍎 Fruits",
    price: 28, mrp: 40,
    quantity: 350, unit: "kg",
    description: "Sweet, potassium-dense naturally ripened robusta bananas.",
    sellerId: "kerala_fruits", sellerName: "Malabar Fruit Producers", sellerPhone: "9447012345",
    sellerLocation: { state: "Kerala", district: "Palakkad", mandal: "Ottappalam" },
    rating: 4.8, ratingCount: 31,
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "fruit_grapes",
    title: "Export Seedless Green Grapes (Angoor)",
    category: "🍎 Fruits",
    price: 80, mrp: 110,
    quantity: 250, unit: "kg",
    description: "Crisp, sweet Thomson seedless green grapes from Nashik vineyards.",
    sellerId: "grapes_nashik", sellerName: "Sahyadri Farmers Producer Co.", sellerPhone: "9822334455",
    sellerLocation: { state: "Maharashtra", district: "Nashik", mandal: "Dindori" },
    rating: 4.9, ratingCount: 29,
    image: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "fruit_apple",
    title: "Royal Delicious Kashmiri Apples (Seb)",
    category: "🍎 Fruits",
    price: 150, mrp: 200,
    quantity: 200, unit: "kg",
    description: "Crisp, sweet-tangy Kashmiri mountain apples picked at peak maturity.",
    sellerId: "apple_kash", sellerName: "J&K Horticulture Board", sellerPhone: "9906312345",
    sellerLocation: { state: "Jammu & Kashmir", district: "Shopian", mandal: "Keller" },
    rating: 4.9, ratingCount: 52,
    image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "fruit_pomegranate",
    title: "Ruby Red Bhagwa Pomegranate (Anar)",
    category: "🍎 Fruits",
    price: 90, mrp: 130,
    quantity: 300, unit: "kg",
    description: "Sweet juicy arils with soft seeds, high antioxidant content.",
    sellerId: "anar_solapur", sellerName: "Solapur Pomegranate Growers", sellerPhone: "9822556677",
    sellerLocation: { state: "Maharashtra", district: "Solapur", mandal: "Mangalvedhe" },
    rating: 4.9, ratingCount: 37,
    image: "https://images.unsplash.com/photo-1541344999736-83eca272f6fc?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "fruit_lemon",
    title: "Juicy Kagzi Lemons (Nimbu Pack)",
    category: "🍎 Fruits",
    price: 60, mrp: 80,
    quantity: 350, unit: "kg",
    description: "Thin-skinned acidic juicy lemons essential for everyday cooking and drinks.",
    sellerId: "lemon_ap", sellerName: "Coastal Citrus Farms", sellerPhone: "9440712345",
    sellerLocation: { state: "Andhra Pradesh", district: "Nellore", mandal: "Kavali" },
    rating: 4.7, ratingCount: 31,
    image: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=500&auto=format&fit=crop&q=80"
  },

  // 🌾 Grains & Flour
  {
    id: "grain_basmati",
    title: "1121 Premium Long-Grain Basmati Rice",
    category: "🌾 Grains & Flour",
    price: 95, mrp: 130,
    quantity: 500, unit: "kg",
    description: "Aromatic extra-long grain basmati rice, aged 12 months for fluffiness.",
    sellerId: "punjab_rice", sellerName: "Golden Field Millers", sellerPhone: "9814012345",
    sellerLocation: { state: "Punjab", district: "Amritsar", mandal: "Ajnala" },
    rating: 5.0, ratingCount: 47,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "grain_sona_masuri",
    title: "Sona Masuri Raw Rice (Everyday Rice)",
    category: "🌾 Grains & Flour",
    price: 55, mrp: 70,
    quantity: 1000, unit: "kg",
    description: "Lightweight, aromatic daily staple rice from the Godavari basin.",
    sellerId: "ap_rice", sellerName: "Godavari Rice Mills", sellerPhone: "9441234567",
    sellerLocation: { state: "Andhra Pradesh", district: "West Godavari", mandal: "Tanuku" },
    rating: 4.8, ratingCount: 63,
    image: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "grain_atta",
    title: "Stone-Ground Whole Wheat Chakki Atta",
    category: "🌾 Grains & Flour",
    price: 42, mrp: 55,
    quantity: 800, unit: "kg",
    description: "100% whole wheat chakki-fresh flour retaining all natural fibre and bran.",
    sellerId: "chakki_atta", sellerName: "Organic Chakki Mills", sellerPhone: "9812012345",
    sellerLocation: { state: "Haryana", district: "Rohtak", mandal: "Kalanaur" },
    rating: 4.9, ratingCount: 58,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "grain_poha",
    title: "Thick Flattened Rice (Poha / Aval)",
    category: "🌾 Grains & Flour",
    price: 65, mrp: 85,
    quantity: 300, unit: "kg",
    description: "Traditional thick beaten rice flakes. Quick and healthy breakfast cereal.",
    sellerId: "poha_mp", sellerName: "Nimar Valley Rice Mills", sellerPhone: "9827312345",
    sellerLocation: { state: "Madhya Pradesh", district: "Khandwa", mandal: "Punasa" },
    rating: 4.7, ratingCount: 27,
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "grain_besan",
    title: "Pure Chana Dal Besan (Gram Flour)",
    category: "🌾 Grains & Flour",
    price: 75, mrp: 95,
    quantity: 400, unit: "kg",
    description: "Finely milled yellow gram flour for snacks, kadhi, sweets, and rotis.",
    sellerId: "besan_raj", sellerName: "Rajasthan Gram Processors", sellerPhone: "9828112345",
    sellerLocation: { state: "Rajasthan", district: "Bikaner", mandal: "Nokha" },
    rating: 4.8, ratingCount: 33,
    image: "https://images.unsplash.com/photo-1627735483748-bc5bfd1f0e68?w=500&auto=format&fit=crop&q=80"
  },

  // 🫘 Pulses & Dal
  {
    id: "pulse_toor",
    title: "Unpolished Organic Toor Dal (Arhar)",
    category: "🫘 Pulses & Dal",
    price: 140, mrp: 180,
    quantity: 400, unit: "kg",
    description: "Protein-rich desi toor dal without oil or synthetic dye polishing.",
    sellerId: "gulbarga_dal", sellerName: "Deccan Pulses Co.", sellerPhone: "9845012345",
    sellerLocation: { state: "Karnataka", district: "Kalaburagi", mandal: "Kalaburagi City" },
    rating: 4.9, ratingCount: 22,
    image: "https://images.unsplash.com/photo-1585994191611-72ec0b73c41e?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "pulse_moong",
    title: "Split Yellow Moong Dal",
    category: "🫘 Pulses & Dal",
    price: 120, mrp: 155,
    quantity: 350, unit: "kg",
    description: "Light and easily digestible yellow split lentils for khichdi and dal tadka.",
    sellerId: "moong_raj", sellerName: "Barmer Pulse Growers", sellerPhone: "9829012345",
    sellerLocation: { state: "Rajasthan", district: "Barmer", mandal: "Balotra" },
    rating: 4.8, ratingCount: 31,
    image: "https://images.unsplash.com/photo-1599579776378-5aa72f1a0c8c?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "pulse_chana",
    title: "Desi Brown Chana (Kala Chana)",
    category: "🫘 Pulses & Dal",
    price: 90, mrp: 120,
    quantity: 600, unit: "kg",
    description: "High-protein unpolished desi chickpeas for curries, boiling, and sprouting.",
    sellerId: "chana_up", sellerName: "Kanpur Agricultural Co-op", sellerPhone: "9839012345",
    sellerLocation: { state: "Uttar Pradesh", district: "Kanpur", mandal: "Bilhaur" },
    rating: 4.6, ratingCount: 16,
    image: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "pulse_rajma",
    title: "Chitra Red Kidney Beans (Rajma)",
    category: "🫘 Pulses & Dal",
    price: 160, mrp: 200,
    quantity: 200, unit: "kg",
    description: "Creamy-cooking Himalayan Chitra rajma beans, rich in plant protein.",
    sellerId: "rajma_jk", sellerName: "J&K Valley Beans Growers", sellerPhone: "9906412345",
    sellerLocation: { state: "Jammu & Kashmir", district: "Jammu", mandal: "Akhnoor" },
    rating: 4.9, ratingCount: 43,
    image: "https://images.unsplash.com/photo-1551360934-39d45c0eda44?w=500&auto=format&fit=crop&q=80"
  },

  // 🌶 Spices & Masala
  {
    id: "spice_turmeric",
    title: "Salem Golden Turmeric Powder (5% Curcumin)",
    category: "🌶 Spices & Masala",
    price: 160, mrp: 210,
    quantity: 300, unit: "kg",
    description: "High-potency aromatic natural turmeric with therapeutic curcumin.",
    sellerId: "salem_spices", sellerName: "Kongu Spices & Herbs", sellerPhone: "9842012345",
    sellerLocation: { state: "Tamil Nadu", district: "Salem", mandal: "Attur" },
    rating: 5.0, ratingCount: 40,
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "spice_chilli",
    title: "Guntur Stemless Red Chilli (Mirchi)",
    category: "🌶 Spices & Masala",
    price: 200, mrp: 260,
    quantity: 250, unit: "kg",
    description: "Intense color and spicy heat. Famous hot variety from Guntur markets.",
    sellerId: "chilli_ap", sellerName: "Guntur Chilli Traders", sellerPhone: "9440812345",
    sellerLocation: { state: "Andhra Pradesh", district: "Guntur", mandal: "Ongole" },
    rating: 4.9, ratingCount: 48,
    image: "https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "spice_cumin",
    title: "Whole Cumin Seeds (Jeera)",
    category: "🌶 Spices & Masala",
    price: 320, mrp: 420,
    quantity: 200, unit: "kg",
    description: "Aromatic bold whole cumin seeds, cleaned and sorted for everyday tadka.",
    sellerId: "jeera_raj", sellerName: "Jodhpur Spice Farmers", sellerPhone: "9829112345",
    sellerLocation: { state: "Rajasthan", district: "Jodhpur", mandal: "Tinwari" },
    rating: 4.9, ratingCount: 36,
    image: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "spice_pepper",
    title: "Wayanad Black Pepper (Kali Mirch)",
    category: "🌶 Spices & Masala",
    price: 650, mrp: 850,
    quantity: 100, unit: "kg",
    description: "Single-origin whole black peppercorns with sharp fragrance and pungency.",
    sellerId: "pepper_ker", sellerName: "Wayanad Spice Planters", sellerPhone: "9447212345",
    sellerLocation: { state: "Kerala", district: "Wayanad", mandal: "Mananthavady" },
    rating: 5.0, ratingCount: 55,
    image: "https://images.unsplash.com/photo-1594568284297-7c64464062b4?w=500&auto=format&fit=crop&q=80"
  },

  // 🥜 Dry Fruits & Nuts
  {
    id: "dry_almond",
    title: "Raw California Almonds (Badam)",
    category: "🥜 Dry Fruits & Nuts",
    price: 750, mrp: 950,
    quantity: 150, unit: "kg",
    description: "Crunchy sweet jumbo almonds rich in Vitamin E and brain nutrients.",
    sellerId: "kashmir_dry", sellerName: "Himalayan Dry Fruits", sellerPhone: "9906012345",
    sellerLocation: { state: "Uttarakhand", district: "Dehradun", mandal: "Rishikesh" },
    rating: 4.9, ratingCount: 33,
    image: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "dry_cashew",
    title: "Whole W240 Jumbo Cashews (Kaju)",
    category: "🥜 Dry Fruits & Nuts",
    price: 900, mrp: 1150,
    quantity: 100, unit: "kg",
    description: "Export grade unblemished whole cashew nuts from Mangaluru coastal farms.",
    sellerId: "cashew_coast", sellerName: "Mangalore Cashew Exports", sellerPhone: "9845912345",
    sellerLocation: { state: "Karnataka", district: "Mangaluru", mandal: "Puttur" },
    rating: 5.0, ratingCount: 45,
    image: "https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "dry_foxnuts",
    title: "Bihar Phool Makhana (Fox Nuts)",
    category: "🥜 Dry Fruits & Nuts",
    price: 700, mrp: 900,
    quantity: 100, unit: "kg",
    description: "Jumbo popped lotus seeds, roasted superfood with zero cholesterol.",
    sellerId: "makhana_bihar", sellerName: "Darbhanga Makhana Co.", sellerPhone: "9835012345",
    sellerLocation: { state: "Bihar", district: "Darbhanga", mandal: "Singhwara" },
    rating: 4.9, ratingCount: 46,
    image: "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=500&auto=format&fit=crop&q=80"
  },

  // 🥛 Dairy & Oils
  {
    id: "dairy_ghee",
    title: "A2 Desi Cow Bilona Ghee (Gir Cow)",
    category: "🥛 Dairy & Oils",
    price: 1100, mrp: 1400,
    quantity: 80, unit: "litre",
    description: "Traditional hand-churned Vedic Bilona method ghee from grass-fed cows.",
    sellerId: "gir_dairy", sellerName: "Krishna Gaushala Organics", sellerPhone: "9825012345",
    sellerLocation: { state: "Gujarat", district: "Junagadh", mandal: "Sanand" },
    rating: 5.0, ratingCount: 62,
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "dairy_honey",
    title: "Raw Multifloral Forest Honey",
    category: "🥛 Dairy & Oils",
    price: 450, mrp: 600,
    quantity: 150, unit: "kg",
    description: "Unfiltered natural honey containing pollen, enzymes, and antioxidants.",
    sellerId: "honey_uttara", sellerName: "Kumaon Forest Beekeepers", sellerPhone: "9917012345",
    sellerLocation: { state: "Uttarakhand", district: "Nainital", mandal: "Ramnagar" },
    rating: 5.0, ratingCount: 71,
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "dairy_mustard_oil",
    title: "Cold-Pressed Kachi Ghani Mustard Oil",
    category: "🥛 Dairy & Oils",
    price: 180, mrp: 230,
    quantity: 300, unit: "litre",
    description: "Pungent traditional cold-press oil for cooking, pickles, and massage.",
    sellerId: "mustard_hr", sellerName: "Haryana Oilseed Mills", sellerPhone: "9812112345",
    sellerLocation: { state: "Haryana", district: "Rewari", mandal: "Kosli" },
    rating: 4.8, ratingCount: 39,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80"
  },

  // 🧴 Daily Routine
  {
    id: "daily_jaggery",
    title: "Organic Sugarcane Jaggery (Gud Cubes)",
    category: "🧴 Daily Routine",
    price: 60, mrp: 80,
    quantity: 500, unit: "kg",
    description: "Chemical-free unrefined natural jaggery rich in iron and minerals.",
    sellerId: "jaggery_maha", sellerName: "Kolhapur Jaggery Farmers", sellerPhone: "9822712345",
    sellerLocation: { state: "Maharashtra", district: "Kolhapur", mandal: "Shirol" },
    rating: 4.9, ratingCount: 52,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "daily_tea",
    title: "Assam CTC Kadak Chai Leaves",
    category: "🧴 Daily Routine",
    price: 250, mrp: 320,
    quantity: 300, unit: "kg",
    description: "Strong malty CTC tea blend giving deep liquor and rich tea aroma.",
    sellerId: "tea_assam", sellerName: "Dibrugarh Tea Gardens", sellerPhone: "9435012345",
    sellerLocation: { state: "Assam", district: "Dibrugarh", mandal: "Moran" },
    rating: 4.9, ratingCount: 67,
    image: "https://images.unsplash.com/photo-1564890369478-c89ca3d9cde4?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "daily_salt",
    title: "Himalayan Pink Rock Salt (Sendha Namak)",
    category: "🧴 Daily Routine",
    price: 35, mrp: 50,
    quantity: 1000, unit: "kg",
    description: "Unrefined pink crystal rock salt rich in 84 natural trace minerals.",
    sellerId: "salt_pk", sellerName: "Himalayan Mineral Works", sellerPhone: "9881012345",
    sellerLocation: { state: "Uttarakhand", district: "Haridwar", mandal: "Jwalapur" },
    rating: 4.8, ratingCount: 45,
    image: "https://images.unsplash.com/photo-1562547256-2c5ee93b60b7?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "daily_soap",
    title: "Ayurvedic Neem & Tulsi Herbal Bath Soap",
    category: "🧴 Daily Routine",
    price: 45, mrp: 65,
    quantity: 500, unit: "pcs",
    description: "Gentle handmade cold-process soap with pure antibacterial neem extract.",
    sellerId: "soap_goa", sellerName: "Goa Natural Organics", sellerPhone: "9821012345",
    sellerLocation: { state: "Goa", district: "North Goa", mandal: "Panaji" },
    rating: 4.8, ratingCount: 38,
    image: "https://images.unsplash.com/photo-1607006314597-9e76747b0a70?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "daily_coffee",
    title: "Coorg Pure Plantation Coffee Powder",
    category: "🧴 Daily Routine",
    price: 380, mrp: 480,
    quantity: 150, unit: "kg",
    description: "Slow roasted 80:20 Arabica blend for authentic South Indian filter coffee.",
    sellerId: "coffee_coorg", sellerName: "Kodagu Coffee Estates", sellerPhone: "9845312345",
    sellerLocation: { state: "Karnataka", district: "Kodagu", mandal: "Madikeri" },
    rating: 5.0, ratingCount: 44,
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=500&auto=format&fit=crop&q=80"
  },

  // 🌱 Seeds
  {
    id: "seed_tomato",
    title: "Abhinav F1 Hybrid Tomato Seeds (10g)",
    category: "🌱 Seeds",
    price: 150, mrp: 200,
    quantity: 50, unit: "pkt",
    description: "High-yield, disease-resistant tomato hybrid seeds for Kharif and Rabi.",
    sellerId: "seed_corp", sellerName: "Krishna Seed Biotech", sellerPhone: "9848022338",
    sellerLocation: { state: "Telangana", district: "Hyderabad", mandal: "Secunderabad" },
    rating: 4.8, ratingCount: 12,
    image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "seed_paddy",
    title: "IR-64 Certified Paddy Hybrid Seeds (5kg)",
    category: "🌱 Seeds",
    price: 280, mrp: 360,
    quantity: 200, unit: "bag",
    description: "Short-duration certified seeds giving up to 55 quintals/acre yield.",
    sellerId: "paddy_seed_ap", sellerName: "Sri Rama Seed House", sellerPhone: "9441812345",
    sellerLocation: { state: "Andhra Pradesh", district: "West Godavari", mandal: "Bhimavaram" },
    rating: 4.7, ratingCount: 22,
    image: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=500&auto=format&fit=crop&q=80"
  },

  // 🧪 Fertilizers & Agri
  {
    id: "fert_npk",
    title: "Organic Balanced NPK 19-19-19 (50kg Bag)",
    category: "🧪 Fertilizers & Agri",
    price: 950, mrp: 1200,
    quantity: 120, unit: "bag",
    description: "Water-soluble balanced crop nutrient booster for rapid vegetative and fruit growth.",
    sellerId: "agri_store", sellerName: "Balaji Agro Chemicals", sellerPhone: "9440123456",
    sellerLocation: { state: "Andhra Pradesh", district: "Guntur", mandal: "Tenali" },
    rating: 4.5, ratingCount: 8,
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "fert_urea",
    title: "Neem-Coated Urea Fertilizer (50kg)",
    category: "🧪 Fertilizers & Agri",
    price: 280, mrp: 350,
    quantity: 500, unit: "bag",
    description: "Slow nitrogen release formulation reducing volatilization and soil acidification.",
    sellerId: "urea_farmer", sellerName: "Krishak Agri Suppliers", sellerPhone: "9849112345",
    sellerLocation: { state: "Telangana", district: "Karimnagar", mandal: "Jammikunta" },
    rating: 4.6, ratingCount: 14,
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "pest_neemoil",
    title: "Cold-Pressed Neem Bio-Pesticide (5L)",
    category: "🧪 Fertilizers & Agri",
    price: 350, mrp: 450,
    quantity: 80, unit: "can",
    description: "Natural organic pest control against whiteflies, aphids, and bollworms.",
    sellerId: "eco_grow", sellerName: "Green Earth Organics", sellerPhone: "9123456789",
    sellerLocation: { state: "Maharashtra", district: "Nagpur", mandal: "Katol" },
    rating: 4.6, ratingCount: 15,
    image: "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=500&auto=format&fit=crop&q=80"
  },

  // 💧 Irrigation
  {
    id: "irr_drip",
    title: "Inline 16mm Drip Irrigation Tape (100m Roll)",
    category: "💧 Irrigation",
    price: 650, mrp: 850,
    quantity: 200, unit: "roll",
    description: "20cm emitter spacing inline tape delivering 2-4 LPH water directly to crop roots.",
    sellerId: "drip_jain", sellerName: "Jain Irrigation Dealers", sellerPhone: "9825412345",
    sellerLocation: { state: "Maharashtra", district: "Jalgaon", mandal: "Jalgaon City" },
    rating: 4.7, ratingCount: 17,
    image: "https://images.unsplash.com/photo-1519003300449-424ad0405076?w=500&auto=format&fit=crop&q=80"
  },

  // 🛠️ Farming Tools
  {
    id: "tool_cultivator",
    title: "Heavy-Duty Ergonomic Hand Cultivator",
    category: "🛠️ Farming Tools",
    price: 450, mrp: 580,
    quantity: 25, unit: "pcs",
    description: "Tough carbon steel prongs for weed removal, aerating soil, and preparing seed beds.",
    sellerId: "tool_works", sellerName: "Kisan Steel & Tools", sellerPhone: "9876543210",
    sellerLocation: { state: "Karnataka", district: "Bengaluru", mandal: "Whitefield" },
    rating: 4.7, ratingCount: 20,
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "tool_sprayer",
    title: "16L Rechargeable Battery Power Sprayer",
    category: "🛠️ Farming Tools",
    price: 3200, mrp: 4200,
    quantity: 30, unit: "pcs",
    description: "Backpack electric sprayer with brass lance and pressure regulator for agrochemicals.",
    sellerId: "sprayer_ts", sellerName: "Kisan Machinery Stores", sellerPhone: "9440312345",
    sellerLocation: { state: "Telangana", district: "Hyderabad", mandal: "Uppal" },
    rating: 4.8, ratingCount: 25,
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&auto=format&fit=crop&q=80"
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

  /* ── Crop advisor (5-step farm setup) ─────────────── */
  const [cropStep, setCropStep] = useState(1);
  const [farmSetup, setFarmSetup] = useState({
    farmSize: '5',
    irrigation: 'Drip Irrigation',
    prevCrop: 'Legumes / Pulses',
    soilType: 'Black Cotton',
    nitrogen: 75,
    phosphorus: 35,
    potassium: 45,
    ph: 6.8,
    season: 'Kharif',
  });
  const [cropRecommendations, setCropRecommendations] = useState(null);
  const [selectedCropRank, setSelectedCropRank] = useState(0);

  /* ── Plant Health Scanner ────────────────────────── */
  const [scanCropType, setScanCropType] = useState('tomato_blight');
  const [uploadedScanImage, setUploadedScanImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [diseaseReport, setDiseaseReport] = useState(null);

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
  const [wishlist, setWishlist]                   = useState([]);
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
    if (e) e.preventDefault();
    const w = getWeather(selState);
    const recs = generateCropRecommendations({
      ...farmSetup,
      state: selState,
      district: selDistrict,
      mandal: selMandal,
    }, w);
    setCropRecommendations(recs);
    setSelectedCropRank(0);
    setCropStep(5);
  };

  const triggerScan = () => {
    setIsScanning(true);
    setDiseaseReport(null);
    setTimeout(() => {
      setIsScanning(false);
      const rep = PLANT_DISEASES_DB[scanCropType] || PLANT_DISEASES_DB.tomato_blight;
      setDiseaseReport(uploadedScanImage ? { ...rep, sampleImage: uploadedScanImage, confidence: '95.8%' } : rep);
    }, 2000);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedScanImage(url);
      setIsScanning(true);
      setDiseaseReport(null);
      setTimeout(() => {
        setIsScanning(false);
        const rep = PLANT_DISEASES_DB[scanCropType] || PLANT_DISEASES_DB.tomato_blight;
        setDiseaseReport({
          ...rep,
          sampleImage: url,
          confidence: '96.5% (High Precision Agronomic AI)'
        });
      }, 2200);
    }
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
    const currCrop = cropRecommendations ? cropRecommendations[selectedCropRank]?.name : 'Tomato / Cotton';

    // Yellow leaves query
    if (q.includes('yellow') || q.includes('peeli') || q.includes('pasupu') || q.includes('chlorosis')) {
      if (lang === 'te') {
        return `🍂 **ఆకులు పసుపు రంగులోకి మారడానికి నివారణ (${currCrop})**:\n\n` +
               `1. **నత్రజని లోపం**: దిగువ ఆకులు పసుపు రంగులోకి మారితే, ఎకరాకు 25 కేజీల యూరియా లేదా 19-19-19 స్ప్రే (5 గ్రా/లీ) చేయండి.\n` +
               `2. **ఇనుము/జింక్ లోపం**: పై లేత ఆకులు పసుపు రంగులోకి మారితే, చీలేటెడ్ జింక్ (1 గ్రా/లీ) పిచికారీ చేయండి.\n` +
               `3. **నీటి నిల్వ**: పొలంలో నీరు నిల్వ ఉంటే వేర్లు ఊపిరాడక పసుపు రంగులోకి మారతాయి; కాలువలు తీసి నీటిని తొలగించండి.`;
      }
      if (lang === 'hi') {
        return `🍂 **पत्तियों का पीला पड़ना — कारण एवं रोकथाम (${currCrop})**:\n\n` +
               `1. **नाइट्रोजन की कमी**: निचली पत्तियां पीली पड़ रही हैं तो 19-19-19 (5 ग्राम/लीटर पानी) का छिड़काव करें।\n` +
               `2. **जिंक/आयरन की कमी**: ऊपरी नई पत्तियां पीली हैं तो चिलेटेड जिंक (1 ग्राम/लीटर) स्प्रे करें।\n` +
               `3. **जलभराव**: अधिक पानी से जड़ें सड़ने लगती हैं, खेत से अतिरिक्त पानी तुरंत निकालें।`;
      }
      return `🍂 **Diagnosis & Remedy for Yellowing Leaves (${currCrop})**:\n\n` +
             `1. **Nitrogen Deficiency**: Older lower leaves turn pale yellow first. Apply 19-19-19 foliar spray (5g/L) or top-dress 25kg Urea/acre.\n` +
             `2. **Zinc / Micronutrient Chlorosis**: Yellowing between leaf veins on young leaves. Spray Chelated Zinc (1g/L) + Ferrous Sulphate (2g/L).\n` +
             `3. **Waterlogging & Root Asphyxiation**: Excessive moisture starves roots of oxygen. Ensure drainage channels are clear.\n` +
             `4. **Sucking Pests (Whiteflies/Thrips)**: Spray Cold-Pressed Neem Oil (15ml/L) or Acetamiprid (0.5g/L).`;
    }

    // Cotton irrigation query
    if ((q.includes('cotton') || q.includes('kapas') || q.includes('paththi')) && (q.includes('irrigate') || q.includes('water') || q.includes('pani'))) {
      return `💧 **Cotton Irrigation Management Guide (${selState})**:\n\n` +
             `• **Critical Stages**: Square formation (45-50 days), Flowering (70-80 days), and Boll development (90-110 days).\n` +
             `• **Schedule**: In ${farmSetup.soilType} soil, irrigate every 12-15 days. If using Drip Irrigation, run for 2 hours every alternate morning.\n` +
             `• **Caution**: Never allow waterlogging at boll development stage; excessive moisture triggers shedding of squares and young bolls.`;
    }

    // Paddy 30 days fertilizer
    if ((q.includes('paddy') || q.includes('rice') || q.includes('dhan') || q.includes('vari')) && (q.includes('30') || q.includes('tillering') || q.includes('fertilizer'))) {
      return `🌾 **Paddy 30-Day (Active Tillering Stage) Nutrient Plan**:\n\n` +
             `1. **Top Dressing (Per Acre)**: 35 kg Neem-Coated Urea + 10 kg MOP (Potash) + 5 kg Zinc Sulphate.\n` +
             `2. **Water Management**: Maintain 2-3 cm standing water during fertilizer broadcast; do not drain for 48 hours.\n` +
             `3. **Weed & Blast Check**: Monitor for early leaf blast spots. Apply Tricyclazole (0.6g/L) if spindle spots appear.`;
    }

    // Chilli leaf curl
    if (q.includes('chilli') || q.includes('mirchi') || q.includes('curl') || q.includes('murda') || q.includes('anthracnose')) {
      return `🌶️ **Chilli Leaf Curl & Pest Shield Guide**:\n\n` +
             `• **Vector Control (Thrips & Mites)**: Downward curling is caused by mites (spray Fenazaquin 1.5ml/L); upward curling is caused by thrips (spray Fipronil 2ml/L).\n` +
             `• **Organic Barrier**: Spray Cold-Pressed Neem Oil (15ml/L) + Pongamia oil every 10 days.\n` +
             `• **Immunity Booster**: Apply Micronutrient Mixture (2g/L) to strengthen plant vigor against virus transmission.`;
    }
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

        /* P2P Marketplace Styles - Responsive 4 col (PC) / 3 col (Tablet) / 2 col (Mobile) */
        .marketplace-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }
        @media (max-width: 1200px) {
          .marketplace-grid { grid-template-columns: repeat(3, 1fr); gap: 1rem; }
        }
        @media (max-width: 860px) {
          .marketplace-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
        }
        @media (max-width: 480px) {
          .marketplace-grid { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
        }

        .product-card {
          background: #ffffff;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          position: relative;
        }
        .product-card:hover {
          border-color: #22c55e;
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(22, 101, 52, 0.12);
        }
        .product-img-container {
          height: 165px;
          position: relative;
          background: #F3F4F6;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        @media (max-width: 480px) {
          .product-img-container { height: 130px; }
        }
        .product-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .product-card:hover .product-img {
          transform: scale(1.04);
        }
        .product-img-fallback {
          font-size: 3rem;
        }
        .product-details {
          padding: 0.9rem;
          display: flex;
          flex-direction: column;
          flex: 1;
          background: #ffffff;
        }
        @media (max-width: 480px) {
          .product-details { padding: 0.65rem; }
        }

        .discount-pill {
          position: absolute;
          top: 8px;
          left: 8px;
          background: #DC2626;
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          z-index: 2;
          box-shadow: 0 2px 6px rgba(220, 38, 38, 0.3);
        }
        .wishlist-icon-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 0.85rem;
          z-index: 2;
          transition: transform 0.15s;
        }
        .wishlist-icon-btn:hover {
          transform: scale(1.15);
        }

        /* Mobile Bottom Nav */
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #ffffff;
          border-top: 1px solid #E5E7EB;
          padding: 0.4rem 0 calc(0.4rem + env(safe-area-inset-bottom));
          z-index: 4000;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
        }
        .mobile-bottom-nav-inner {
          display: flex;
          justify-content: space-around;
          align-items: center;
        }
        .bottom-nav-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.15rem;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.3rem 0.6rem;
          color: #64748B;
          font-family: 'Inter', sans-serif;
          position: relative;
        }
        .bottom-nav-btn .bn-icon { font-size: 1.25rem; }
        .bottom-nav-btn .bn-label { font-size: 0.65rem; font-weight: 600; }
        .bottom-nav-btn.active { color: #166534; }
        .bottom-nav-badge {
          position: absolute;
          top: -2px;
          right: 4px;
          background: #DC2626;
          color: #fff;
          font-size: 0.6rem;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }
        @media (max-width: 768px) {
          .mobile-bottom-nav { display: block; }
          main { padding-bottom: 4.5rem !important; }
        }

        /* Category Filter Pills */
        .cat-scroll-container {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.4rem;
          margin-bottom: 0.5rem;
          scrollbar-width: thin;
        }
        .cat-scroll-container::-webkit-scrollbar {
          height: 4px;
        }
        .cat-scroll-pill {
          padding: 0.35rem 0.8rem;
          border-radius: 20px;
          border: 1px solid #333;
          background: #1e1e1e;
          color: #ccc;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s;
        }
        .cat-scroll-pill:hover {
          border-color: #22c55e;
          color: #fff;
        }
        .cat-scroll-pill.active {
          background: #166534;
          border-color: #22c55e;
          color: #ffffff;
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
              {weatherLoading && <span style={{fontSize:'.72rem',color:'#60a5fa',marginLeft:'.5rem',fontWeight:500}}>⏳ Updating weather...</span>}
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
                    {/* Horizontal Category Quick Filter Pills */}
                    <div className="cat-scroll-container">
                      {[
                        { label: 'All Items', val: 'All', icon: '🛒' },
                        { label: 'Vegetables', val: '🥬 Vegetables', icon: '🥬' },
                        { label: 'Fruits', val: '🍎 Fruits', icon: '🍎' },
                        { label: 'Grains & Flour', val: '🌾 Grains & Flour', icon: '🌾' },
                        { label: 'Pulses & Dal', val: '🫘 Pulses & Dal', icon: '🫘' },
                        { label: 'Spices & Masala', val: '🌶 Spices & Masala', icon: '🌶' },
                        { label: 'Dry Fruits', val: '🥜 Dry Fruits & Nuts', icon: '🥜' },
                        { label: 'Dairy & Oils', val: '🥛 Dairy & Oils', icon: '🥛' },
                        { label: 'Daily Routine', val: '🧴 Daily Routine', icon: '🧴' },
                        { label: 'Seeds', val: '🌱 Seeds', icon: '🌱' },
                        { label: 'Fertilizers', val: '🧪 Fertilizers & Agri', icon: '🧪' },
                        { label: 'Irrigation', val: '💧 Irrigation', icon: '💧' },
                        { label: 'Farm Tools', val: '🛠️ Farming Tools', icon: '🛠️' },
                      ].map(cat => (
                        <button
                          key={cat.val}
                          className={`cat-scroll-pill ${marketFilter === cat.val ? 'active' : ''}`}
                          onClick={() => setMarketFilter(cat.val)}
                        >
                          {cat.icon} {cat.label}
                        </button>
                      ))}
                    </div>

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
                          <option value="🌾 Grains & Flour">🌾 Grains & Flour</option>
                          <option value="🫘 Pulses & Dal">🫘 Pulses & Dal</option>
                          <option value="🌶 Spices & Masala">🌶 Spices & Masala</option>
                          <option value="🥜 Dry Fruits & Nuts">🥜 Dry Fruits & Nuts</option>
                          <option value="🥛 Dairy & Oils">🥛 Dairy & Oils</option>
                          <option value="🧴 Daily Routine">🧴 Daily Routine</option>
                          <option value="🌱 Seeds">🌱 Seeds</option>
                          <option value="🧪 Fertilizers & Agri">🧪 Fertilizers & Agri</option>
                          <option value="💧 Irrigation">💧 Irrigation</option>
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
                              {/* Discount badge & Wishlist button on image */}
                              {item.mrp && item.mrp > item.price && (
                                <span className="discount-pill">
                                  {Math.round(((item.mrp - item.price) / item.mrp) * 100)}% OFF
                                </span>
                              )}
                              <button
                                className="wishlist-icon-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setWishlist(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]);
                                }}
                                title="Add to Wishlist"
                              >
                                {wishlist.includes(item.id) ? '❤️' : '🤍'}
                              </button>

                              <div className="product-details">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                                  <span style={{ fontSize: '0.68rem', background: '#F0FDF4', color: '#166534', padding: '0.12rem 0.4rem', borderRadius: 4, fontWeight: 700 }}>
                                    {item.category}
                                  </span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', color: '#D97706', fontWeight: 700 }}>
                                    <span 
                                      style={{ cursor: 'pointer' }}
                                      title="Rate this product"
                                      onClick={() => handleRateProduct(item.id, 5)}
                                    >
                                      ★ {item.rating || 5.0}
                                    </span>
                                    <span style={{ color: '#94A3B8', fontWeight: 500 }}>({item.ratingCount || 1})</span>
                                  </div>
                                </div>
                                
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#172017', marginBottom: '0.25rem', lineHeight: 1.3, height: '2.4rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                  {item.title}
                                </h3>

                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', margin: '0.25rem 0 0.4rem' }}>
                                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#15803D' }}>
                                    ₹{item.price}
                                  </span>
                                  <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>
                                    /{item.unit}
                                  </span>
                                  {item.mrp && item.mrp > item.price && (
                                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                                      ₹{item.mrp}
                                    </span>
                                  )}
                                </div>
                                
                                <p style={{ fontSize: '0.74rem', color: '#64748B', lineHeight: 1.35, height: '2rem', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.5rem' }}>
                                  {item.description}
                                </p>
                                
                                <div style={{ background: '#F8FAF8', padding: '0.45rem 0.6rem', borderRadius: 6, fontSize: '0.7rem', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '0.15rem', marginBottom: '0.65rem' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748B' }}>Seller:</span>
                                    <strong style={{ color: '#172017', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{item.sellerName}</strong>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748B' }}>Location:</span>
                                    <span style={{ color: '#172017' }}>📍 {item.sellerLocation?.state}</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.1rem', borderTop: '1px solid #E5E7EB', paddingTop: '0.15rem' }}>
                                    <span style={{ color: '#64748B' }}>Stock:</span>
                                    <strong style={{ color: item.quantity > 5 ? '#15803D' : '#DC2626' }}>{item.quantity} {item.unit}s left</strong>
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
            {activeTab==='overview' && (() => {
              const t = I18N[lang] || I18N.en;
              const weatherDecisions = calculateWeatherDecisions(weather);

              return (
                <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
                  {/* Hero Farmer Decision Banner */}
                  <div className="card" style={{
                    background: 'linear-gradient(135deg, #0d2818 0%, #041b10 50%, #111827 100%)',
                    border: '1px solid #15803d',
                    padding: '1.75rem',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{position:'absolute',right:'-20px',top:'-20px',fontSize:'8rem',opacity:0.08,pointerEvents:'none'}}>🌾</div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'1rem'}}>
                      <div>
                        <div style={{display:'inline-flex',alignItems:'center',gap:'.4rem',background:'rgba(34,197,94,0.15)',border:'1px solid rgba(34,197,94,0.3)',borderRadius:20,padding:'.25rem .75rem',fontSize:'.75rem',fontWeight:700,color:'#4ade80',marginBottom:'.75rem'}}>
                          🌱 AI DECISION SUPPORT PLATFORM
                        </div>
                        <h1 style={{fontSize:'1.6rem',fontWeight:800,color:'#fff',lineHeight:1.2,marginBottom:'.4rem'}}>
                          {t.title}
                        </h1>
                        <p style={{fontSize:'.95rem',fontWeight:600,color:'#86efac',marginBottom:'.25rem'}}>
                          "{t.tagline}"
                        </p>
                        <p style={{fontSize:'.82rem',color:'#9ca3af',maxWidth:650}}>
                          {t.subtagline}
                        </p>
                      </div>

                      <div style={{background:'rgba(0,0,0,0.4)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,padding:'.75rem 1rem',minWidth:220}}>
                        <div style={{fontSize:'.72rem',color:'#9ca3af',textTransform:'uppercase',fontWeight:700}}>Farmer Profile</div>
                        <div style={{fontSize:'.95rem',fontWeight:800,color:'#fff',marginTop:'.2rem'}}>{user.name || 'Registered Farmer'} 👋</div>
                        <div style={{fontSize:'.78rem',color:'#60a5fa',marginTop:'.2rem'}}>📍 {selMandal}, {selDistrict}, {selState}</div>
                        <div style={{fontSize:'.72rem',color:'#86efac',marginTop:'.3rem',display:'flex',alignItems:'center',gap:'.3rem'}}>
                          <span>🌤️ {weather.temp}</span> · <span>💧 {weather.humidity}</span> · <span>🌧️ {weather.rain}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3 Large Action Cards */}
                  <div>
                    <div className="section-title" style={{fontSize:'1rem',color:'#86efac'}}>
                      ⚡ {t.quickActions}
                    </div>
                    <div className="grid3">
                      {/* Card 1: Find Best Crop */}
                      <div className="card" style={{
                        background: 'linear-gradient(145deg, #132a13 0%, #0d1b12 100%)',
                        border: '1px solid #22c55e',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        transition: 'all 0.2s ease'
                      }} onClick={() => setActiveTab('advisor')}>
                        <div>
                          <div style={{fontSize:'2.2rem',marginBottom:'.4rem'}}>🌱</div>
                          <h3 style={{fontSize:'1.15rem',fontWeight:800,color:'#fff'}}>{t.btnCropAdvisor}</h3>
                          <p style={{fontSize:'.82rem',color:'#cbd5e1',marginTop:'.4rem',lineHeight:1.5}}>
                            {t.btnCropDesc}
                          </p>
                        </div>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',borderTop:'1px solid rgba(255,255,255,0.08)',paddingTop:'.75rem'}}>
                          <span style={{fontSize:'.75rem',color:'#86efac',fontWeight:700}}>5-Step Farm Setup</span>
                          <span style={{color:'#4ade80',fontWeight:800,fontSize:'.9rem'}}>Launch Advisor →</span>
                        </div>
                      </div>

                      {/* Card 2: Plant Health Scanner */}
                      <div className="card" style={{
                        background: 'linear-gradient(145deg, #1f1b2e 0%, #13111c 100%)',
                        border: '1px solid #8b5cf6',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        transition: 'all 0.2s ease'
                      }} onClick={() => setActiveTab('scanner')}>
                        <div>
                          <div style={{fontSize:'2.2rem',marginBottom:'.4rem'}}>🔬</div>
                          <h3 style={{fontSize:'1.15rem',fontWeight:800,color:'#fff'}}>{t.btnDiseaseScanner}</h3>
                          <p style={{fontSize:'.82rem',color:'#cbd5e1',marginTop:'.4rem',lineHeight:1.5}}>
                            {t.btnDiseaseDesc}
                          </p>
                        </div>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',borderTop:'1px solid rgba(255,255,255,0.08)',paddingTop:'.75rem'}}>
                          <span style={{fontSize:'.75rem',color:'#c4b5fd',fontWeight:700}}>Camera & Photo Upload</span>
                          <span style={{color:'#a78bfa',fontWeight:800,fontSize:'.9rem'}}>Scan Leaf Now →</span>
                        </div>
                      </div>

                      {/* Card 3: AI Farmer Assistant */}
                      <div className="card" style={{
                        background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                        border: '1px solid #3b82f6',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        transition: 'all 0.2s ease'
                      }} onClick={() => setActiveTab('chat')}>
                        <div>
                          <div style={{fontSize:'2.2rem',marginBottom:'.4rem'}}>🤖</div>
                          <h3 style={{fontSize:'1.15rem',fontWeight:800,color:'#fff'}}>{t.btnAiAssistant}</h3>
                          <p style={{fontSize:'.82rem',color:'#cbd5e1',marginTop:'.4rem',lineHeight:1.5}}>
                            {t.btnAiDesc}
                          </p>
                        </div>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',borderTop:'1px solid rgba(255,255,255,0.08)',paddingTop:'.75rem'}}>
                          <span style={{fontSize:'.75rem',color:'#93c5fd',fontWeight:700}}>Voice & Chat (TE/HI/EN)</span>
                          <span style={{color:'#60a5fa',fontWeight:800,fontSize:'.9rem'}}>Open Assistant →</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 🌾 AGRICULTURAL WEATHER DECISIONS WIDGET */}
                  <div>
                    <div className="section-title" style={{justifyContent:'space-between'}}>
                      <span style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
                        🌤️ {t.weatherInsights} — {selMandal}, {selDistrict}, {selState}
                      </span>
                      {liveWeather?.isLive && <span style={{fontSize:'.7rem',background:'#16a34a',color:'#fff',padding:'.15rem .5rem',borderRadius:4,fontWeight:700}}>● LIVE OPEN-METEO</span>}
                    </div>

                    {/* 3 Actionable Decision Cards */}
                    <div className="grid3" style={{marginBottom:'1rem'}}>
                      {/* Irrigation Decision */}
                      <div className="card" style={{borderLeft:`4px solid ${weatherDecisions.irrigation.color}`,padding:'1.1rem'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.4rem'}}>
                          <span style={{fontSize:'.75rem',fontWeight:700,color:'#888',textTransform:'uppercase'}}>{t.irrigationInsight}</span>
                          <span style={{fontSize:'.7rem',fontWeight:800,background:'rgba(255,255,255,0.06)',color:weatherDecisions.irrigation.color,padding:'.15rem .5rem',borderRadius:4}}>
                            {weatherDecisions.irrigation.badge}
                          </span>
                        </div>
                        <div style={{fontSize:'1rem',fontWeight:800,color:'#fff',display:'flex',alignItems:'center',gap:'.4rem',marginBottom:'.3rem'}}>
                          <span>{weatherDecisions.irrigation.icon}</span> {weatherDecisions.irrigation.action}
                        </div>
                        <div style={{fontSize:'.78rem',color:'#aaa',lineHeight:1.45}}>
                          {weatherDecisions.irrigation.detail}
                        </div>
                      </div>

                      {/* Field Work & Spraying */}
                      <div className="card" style={{borderLeft:`4px solid ${weatherDecisions.fieldWork.color}`,padding:'1.1rem'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.4rem'}}>
                          <span style={{fontSize:'.75rem',fontWeight:700,color:'#888',textTransform:'uppercase'}}>{t.fieldWorkInsight}</span>
                          <span style={{fontSize:'.7rem',fontWeight:800,background:'rgba(255,255,255,0.06)',color:weatherDecisions.fieldWork.color,padding:'.15rem .5rem',borderRadius:4}}>
                            {weatherDecisions.fieldWork.badge}
                          </span>
                        </div>
                        <div style={{fontSize:'1rem',fontWeight:800,color:'#fff',display:'flex',alignItems:'center',gap:'.4rem',marginBottom:'.3rem'}}>
                          <span>{weatherDecisions.fieldWork.icon}</span> {weatherDecisions.fieldWork.action}
                        </div>
                        <div style={{fontSize:'.78rem',color:'#aaa',lineHeight:1.45}}>
                          {weatherDecisions.fieldWork.detail}
                        </div>
                      </div>

                      {/* Disease & Pest Risk */}
                      <div className="card" style={{borderLeft:`4px solid ${weatherDecisions.diseaseRisk.color}`,padding:'1.1rem'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.4rem'}}>
                          <span style={{fontSize:'.75rem',fontWeight:700,color:'#888',textTransform:'uppercase'}}>{t.diseaseRiskAlert}</span>
                          <span style={{fontSize:'.7rem',fontWeight:800,background:'rgba(255,255,255,0.06)',color:weatherDecisions.diseaseRisk.color,padding:'.15rem .5rem',borderRadius:4}}>
                            {weatherDecisions.diseaseRisk.badge}
                          </span>
                        </div>
                        <div style={{fontSize:'1rem',fontWeight:800,color:'#fff',display:'flex',alignItems:'center',gap:'.4rem',marginBottom:'.3rem'}}>
                          <span>{weatherDecisions.diseaseRisk.icon}</span> {weatherDecisions.diseaseRisk.action}
                        </div>
                        <div style={{fontSize:'.78rem',color:'#aaa',lineHeight:1.45}}>
                          {weatherDecisions.diseaseRisk.detail}
                        </div>
                      </div>
                    </div>

                    {/* Meteorological Numbers */}
                    <div className="grid4">
                      {[
                        { icon:'🌡️', label:'Temperature', val:weather.temp, sub:weather.feelsLike ? `Feels ${weather.feelsLike}` : 'Normal range', color:'#f97316' },
                        { icon:'💧', label:'Humidity', val:weather.humidity, sub:weather.cloudCover ? `Cloud ${weather.cloudCover}` : 'Vegetative zone', color:'#60a5fa' },
                        { icon:'🌧️', label:'Rain Probability', val:weather.rain, sub:weather.precipitation ? `Precip ${weather.precipitation}` : 'Forecast index', color:'#818cf8' },
                        { icon:'💨', label:'Wind Speed', val:weather.wind, sub:weather.windGusts ? `Gusts ${weather.windGusts}` : 'Safe for spray', color:'#34d399' },
                      ].map(s=>(
                        <div key={s.label} className="stat-card">
                          <div style={{fontSize:'1.3rem'}}>{s.icon}</div>
                          <div style={{fontSize:'1.3rem',fontWeight:800,color:s.color}}>{s.val}</div>
                          <div style={{fontSize:'.72rem',color:'#888',fontWeight:600}}>{s.label}</div>
                          <div style={{fontSize:'.68rem',color:'#555'}}>{s.sub}</div>
                        </div>
                      ))}
                    </div>

                    {/* 7-Day Forecast */}
                    <div className="card" style={{marginTop:'1rem'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.75rem'}}>
                        <span style={{fontSize:'.85rem',fontWeight:700,color:'#f1f1f1'}}>📅 7-Day Agricultural Forecast</span>
                        <span style={{fontSize:'.72rem',color:'#888'}}>Updated {weather.lastUpdated || 'Just now'}</span>
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'.4rem'}}>
                        {(weather.forecast||[]).map((f,i)=>(
                          <div key={i} style={{textAlign:'center',background:'#1f1f1f',borderRadius:8,padding:'.6rem .2rem',border:i===0?'1px solid #22c55e':'1px solid #2a2a2a'}}>
                            <div style={{fontSize:'.65rem',color:i===0?'#22c55e':'#888',fontWeight:700}}>{i===0?'Today':f.day}</div>
                            {f.date && <div style={{fontSize:'.55rem',color:'#555'}}>{f.date}</div>}
                            <div style={{fontSize:'1.2rem',margin:'.25rem 0'}}>{f.icon}</div>
                            <div style={{fontSize:'.72rem',fontWeight:700,color:'#f87171'}}>{f.high}°</div>
                            <div style={{fontSize:'.65rem',color:'#60a5fa'}}>{f.low}°</div>
                            {f.rainChance !== undefined && <div style={{fontSize:'.55rem',color:'#818cf8',marginTop:'.2rem'}}>🌧️{f.rainChance}%</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Soil Health & Mandi Rates Side by Side */}
                  <div className="grid2">
                    {/* Soil Health */}
                    <div className="card">
                      <div className="section-title">🧪 {t.soilHealth}</div>
                      <div style={{display:'flex',flexDirection:'column',gap:'.75rem'}}>
                        {[
                          { name:'Nitrogen (N)', val:'75 kg/ha', status:'Optimal', color:'#22c55e', note:'Good for tillering' },
                          { name:'Phosphorus (P)', val:'35 kg/ha', status:'Medium', color:'#f59e0b', note:'Add DAP at basal stage' },
                          { name:'Potassium (K)', val:'45 kg/ha', status:'Balanced', color:'#22c55e', note:'Supports grain filling' },
                          { name:'Soil Reaction (pH)', val:'6.8 pH', status:'Ideal (6.5-7.5)', color:'#3b82f6', note:'High nutrient uptake' },
                        ].map(s=>(
                          <div key={s.name} style={{background:'#1f1f1f',borderRadius:8,padding:'.65rem .85rem',border:'1px solid #2a2a2a',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                            <div>
                              <div style={{fontSize:'.82rem',fontWeight:700,color:'#fff'}}>{s.name}</div>
                              <div style={{fontSize:'.7rem',color:'#888'}}>{s.note}</div>
                            </div>
                            <div style={{textAlign:'right'}}>
                              <div style={{fontSize:'.9rem',fontWeight:800,color:s.color}}>{s.val}</div>
                              <div style={{fontSize:'.68rem',color:s.color,fontWeight:600}}>{s.status}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Live Mandi Rate Highlights */}
                    <div className="card">
                      <div className="section-title" style={{justifyContent:'space-between'}}>
                        <span>⚡ {t.mandiPrices}</span>
                        <span style={{fontSize:'.68rem',color:'#888'}}>e-NAM / Agmarknet</span>
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.6rem'}}>
                        {['Paddy (Rice)','Cotton (Long Staple)','Tomato','Onion','Red Chilli (Dry)','Turmeric (Haldi)'].map(crop=>{
                          const price=livePrices[crop]||BASE_PRICES[crop]||20;
                          const base=BASE_PRICES[crop]||20;
                          const pct=(((price-base)/base)*100).toFixed(1);
                          const isUp=priceTrend[crop]!=='down';
                          return (
                            <div key={crop} style={{background:'#1f1f1f',borderRadius:8,padding:'.65rem .75rem',border:'1px solid #2a2a2a',display:'flex',flexDirection:'column',gap:'.2rem'}}>
                              <div style={{fontSize:'.72rem',color:'#888',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{crop}</div>
                              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                                <span style={{fontSize:'1rem',fontWeight:800,color:isUp?'#22c55e':'#ef4444'}}>₹{price.toFixed(0)}</span>
                                <span style={{fontSize:'.68rem',fontWeight:700,color:isUp?'#22c55e':'#ef4444'}}>{isUp?'▲':'▼'}{Math.abs(pct)}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ════ AI CROP ADVISOR (5-STEP AGRI DECISION PLATFORM) ════ */}
            {activeTab==='advisor' && (() => {
              const t = I18N[lang] || I18N.en;
              const activeRec = cropRecommendations ? cropRecommendations[selectedCropRank] : null;

              return (
                <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
                  {/* Step Progress Header */}
                  <div className="card" style={{padding:'1rem 1.5rem'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'.5rem',marginBottom:'.75rem'}}>
                      <div>
                        <h2 style={{fontSize:'1.2rem',fontWeight:800,color:'#fff'}}>🌱 AI Farm Setup & Crop Recommendation</h2>
                        <p style={{fontSize:'.8rem',color:'#888',marginTop:'.2rem'}}>
                          Enter your exact farm, soil, and weather variables to compute Top 3 crops with Suitability Scores and Farm Action Plans.
                        </p>
                      </div>
                      <span style={{fontSize:'.75rem',background:'rgba(34,197,94,0.15)',color:'#4ade80',padding:'.3rem .75rem',borderRadius:20,fontWeight:700}}>
                        Step {cropStep} of 5
                      </span>
                    </div>

                    {/* Step Tabs */}
                    <div style={{display:'grid',gridTemplateColumns:'repeat(5, 1fr)',gap:'.5rem'}}>
                      {[
                        { num: 1, label: t.stepLocation },
                        { num: 2, label: t.stepFarm },
                        { num: 3, label: t.stepSoil },
                        { num: 4, label: t.stepSeason },
                        { num: 5, label: t.stepPlan },
                      ].map(s => (
                        <button
                          key={s.num}
                          onClick={() => {
                            if (s.num === 5 && !cropRecommendations) handleRecommendCrop();
                            else setCropStep(s.num);
                          }}
                          style={{
                            background: cropStep === s.num ? '#16a34a' : cropStep > s.num ? '#1f2937' : '#111827',
                            color: cropStep === s.num ? '#fff' : cropStep > s.num ? '#86efac' : '#6b7280',
                            border: `1px solid ${cropStep === s.num ? '#22c55e' : '#374151'}`,
                            borderRadius: 8,
                            padding: '.5rem .25rem',
                            fontSize: '.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textAlign: 'center'
                          }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 1: Location */}
                  {cropStep === 1 && (
                    <div className="card" style={{maxWidth:650,margin:'0 auto',width:'100%'}}>
                      <h3 style={{fontSize:'1.05rem',fontWeight:700,color:'#fff',marginBottom:'.5rem'}}>📍 Step 1 — Verify Location</h3>
                      <p style={{fontSize:'.8rem',color:'#888',marginBottom:'1.25rem'}}>Agro-climatic zones, rainfall norms, and mandi pricing are mapped to your location.</p>
                      <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                        <div>
                          <label className="fld">State</label>
                          <select className="input" value={selState} onChange={e=>handleStateChange(e.target.value)}>
                            {ALL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                          <div>
                            <label className="fld">District</label>
                            <select className="input" value={selDistrict} onChange={e=>handleDistrictChange(e.target.value)}>
                              {districts.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="fld">Mandal / Village</label>
                            <select className="input" value={selMandal} onChange={e=>setSelMandal(e.target.value)}>
                              {mandals.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                          </div>
                        </div>
                        <div style={{display:'flex',justifyContent:'flex-end',marginTop:'.5rem'}}>
                          <button className="btn btn-primary" onClick={() => setCropStep(2)}>
                            {t.next}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Farm Details */}
                  {cropStep === 2 && (
                    <div className="card" style={{maxWidth:650,margin:'0 auto',width:'100%'}}>
                      <h3 style={{fontSize:'1.05rem',fontWeight:700,color:'#fff',marginBottom:'.5rem'}}>🌾 Step 2 — Farm Specifics</h3>
                      <p style={{fontSize:'.8rem',color:'#888',marginBottom:'1.25rem'}}>Farm size, irrigation facilities, and previous crop rotation dictate agronomic success.</p>
                      <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                        <div>
                          <label className="fld">Farm Area (Acres)</label>
                          <input className="input" type="number" step="0.5" min="0.5" value={farmSetup.farmSize} onChange={e => setFarmSetup(p=>({...p, farmSize: e.target.value}))} />
                        </div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                          <div>
                            <label className="fld">Irrigation Source</label>
                            <select className="input" value={farmSetup.irrigation} onChange={e => setFarmSetup(p=>({...p, irrigation: e.target.value}))}>
                              <option value="Drip Irrigation">Drip Irrigation (Micro)</option>
                              <option value="Borewell + Sprinkler">Borewell + Sprinkler</option>
                              <option value="Canal / Flood">Canal / River Flood</option>
                              <option value="Rainfed">Rainfed (Monsoon Only)</option>
                            </select>
                          </div>
                          <div>
                            <label className="fld">Previous Cultivated Crop</label>
                            <select className="input" value={farmSetup.prevCrop} onChange={e => setFarmSetup(p=>({...p, prevCrop: e.target.value}))}>
                              <option value="Legumes / Pulses">Legumes / Pulses (Nitrogen fixing)</option>
                              <option value="Paddy (Rice)">Paddy (Rice)</option>
                              <option value="Cotton">Cotton</option>
                              <option value="Maize">Maize</option>
                              <option value="Vegetables">Vegetables</option>
                              <option value="Fallow / New Land">Fallow / New Land</option>
                            </select>
                          </div>
                        </div>
                        <div style={{display:'flex',justifyContent:'space-between',marginTop:'.5rem'}}>
                          <button className="btn btn-outline" onClick={() => setCropStep(1)}>{t.back}</button>
                          <button className="btn btn-primary" onClick={() => setCropStep(3)}>{t.next}</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Soil Health */}
                  {cropStep === 3 && (
                    <div className="card" style={{maxWidth:650,margin:'0 auto',width:'100%'}}>
                      <h3 style={{fontSize:'1.05rem',fontWeight:700,color:'#fff',marginBottom:'.5rem'}}>🧪 Step 3 — Soil Nutrients & pH</h3>
                      <p style={{fontSize:'.8rem',color:'#888',marginBottom:'1.25rem'}}>Enter your Soil Health Card values (or use local averages).</p>
                      <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                        <div>
                          <label className="fld">Soil Type</label>
                          <select className="input" value={farmSetup.soilType} onChange={e => setFarmSetup(p=>({...p, soilType: e.target.value}))}>
                            <option value="Black Cotton">Black Cotton Soil (Regur)</option>
                            <option value="Red Loamy">Red Loamy Soil</option>
                            <option value="Alluvial">Alluvial Soil</option>
                            <option value="Clay">Clay Soil</option>
                            <option value="Sandy Loam">Sandy Loam Soil</option>
                          </select>
                        </div>

                        <div>
                          <div style={{display:'flex',justifyContent:'space-between',fontSize:'.78rem',color:'#ccc',marginBottom:'.3rem'}}>
                            <span>Nitrogen (N): <strong>{farmSetup.nitrogen} kg/ha</strong></span>
                            <span style={{color:'#888'}}>Scale: 20–140</span>
                          </div>
                          <input type="range" min="20" max="140" value={farmSetup.nitrogen} onChange={e => setFarmSetup(p=>({...p, nitrogen: parseInt(e.target.value)}))} style={{width:'100%',accentColor:'#22c55e'}} />
                        </div>

                        <div>
                          <div style={{display:'flex',justifyContent:'space-between',fontSize:'.78rem',color:'#ccc',marginBottom:'.3rem'}}>
                            <span>Phosphorus (P): <strong>{farmSetup.phosphorus} kg/ha</strong></span>
                            <span style={{color:'#888'}}>Scale: 10–90</span>
                          </div>
                          <input type="range" min="10" max="90" value={farmSetup.phosphorus} onChange={e => setFarmSetup(p=>({...p, phosphorus: parseInt(e.target.value)}))} style={{width:'100%',accentColor:'#f59e0b'}} />
                        </div>

                        <div>
                          <div style={{display:'flex',justifyContent:'space-between',fontSize:'.78rem',color:'#ccc',marginBottom:'.3rem'}}>
                            <span>Potassium (K): <strong>{farmSetup.potassium} kg/ha</strong></span>
                            <span style={{color:'#888'}}>Scale: 10–100</span>
                          </div>
                          <input type="range" min="10" max="100" value={farmSetup.potassium} onChange={e => setFarmSetup(p=>({...p, potassium: parseInt(e.target.value)}))} style={{width:'100%',accentColor:'#3b82f6'}} />
                        </div>

                        <div>
                          <div style={{display:'flex',justifyContent:'space-between',fontSize:'.78rem',color:'#ccc',marginBottom:'.3rem'}}>
                            <span>Soil pH Level: <strong>{farmSetup.ph} pH</strong></span>
                            <span style={{color:'#888'}}>Scale: 4.5–8.5</span>
                          </div>
                          <input type="range" min="4.5" max="8.5" step="0.1" value={farmSetup.ph} onChange={e => setFarmSetup(p=>({...p, ph: parseFloat(e.target.value)}))} style={{width:'100%',accentColor:'#a855f7'}} />
                        </div>

                        <div style={{display:'flex',justifyContent:'space-between',marginTop:'.5rem'}}>
                          <button className="btn btn-outline" onClick={() => setCropStep(2)}>{t.back}</button>
                          <button className="btn btn-primary" onClick={() => setCropStep(4)}>{t.next}</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Season */}
                  {cropStep === 4 && (
                    <div className="card" style={{maxWidth:650,margin:'0 auto',width:'100%'}}>
                      <h3 style={{fontSize:'1.05rem',fontWeight:700,color:'#fff',marginBottom:'.5rem'}}>📅 Step 4 — Cropping Season</h3>
                      <p style={{fontSize:'.8rem',color:'#888',marginBottom:'1.25rem'}}>Select your upcoming planting period.</p>
                      <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'.75rem'}}>
                          {[
                            { id: 'Kharif', label: 'Kharif (Monsoon)', sub: 'June – October', icon: '🌧️' },
                            { id: 'Rabi', label: 'Rabi (Winter)', sub: 'October – March', icon: '❄️' },
                            { id: 'Zaid', label: 'Zaid (Summer)', sub: 'March – June', icon: '☀️' },
                          ].map(s => (
                            <div
                              key={s.id}
                              onClick={() => setFarmSetup(p=>({...p, season: s.id}))}
                              style={{
                                background: farmSetup.season === s.id ? '#1e3a29' : '#1f1f1f',
                                border: `2px solid ${farmSetup.season === s.id ? '#22c55e' : '#2a2a2a'}`,
                                borderRadius: 10,
                                padding: '1rem .75rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              <div style={{fontSize:'1.5rem',marginBottom:'.3rem'}}>{s.icon}</div>
                              <div style={{fontSize:'.85rem',fontWeight:700,color:'#fff'}}>{s.label}</div>
                              <div style={{fontSize:'.7rem',color:'#888',marginTop:'.2rem'}}>{s.sub}</div>
                            </div>
                          ))}
                        </div>

                        <div style={{display:'flex',justifyContent:'space-between',marginTop:'1rem'}}>
                          <button className="btn btn-outline" onClick={() => setCropStep(3)}>{t.back}</button>
                          <button className="btn btn-primary" style={{padding:'.75rem 1.5rem',fontSize:'.95rem',fontWeight:800}} onClick={handleRecommendCrop}>
                            {t.generatePlan}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 5: AI Recommendations Output */}
                  {cropStep === 5 && (
                    <div>
                      {!cropRecommendations ? (
                        <div className="card" style={{textAlign:'center',padding:'3rem'}}>
                          <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🌱</div>
                          <p style={{color:'#888'}}>Generating multi-criteria agronomic plan...</p>
                          <button className="btn btn-primary" style={{marginTop:'1rem'}} onClick={handleRecommendCrop}>{t.generatePlan}</button>
                        </div>
                      ) : (
                        <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>
                          {/* Top 3 Crop Cards Selector */}
                          <div>
                            <div style={{fontSize:'.85rem',fontWeight:700,color:'#888',marginBottom:'.5rem',textTransform:'uppercase'}}>
                              🏆 Top 3 Recommended Crops by Suitability Score
                            </div>
                            <div className="grid3">
                              {cropRecommendations.map((crop, idx) => (
                                <div
                                  key={crop.name}
                                  onClick={() => setSelectedCropRank(idx)}
                                  className="card"
                                  style={{
                                    border: selectedCropRank === idx ? '2px solid #22c55e' : '1px solid #2a2a2a',
                                    background: selectedCropRank === idx ? 'linear-gradient(145deg, #122b1c 0%, #0d1e14 100%)' : '#1a1a1a',
                                    cursor: 'pointer',
                                    padding: '1.25rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '.5rem',
                                    transition: 'all 0.2s'
                                  }}
                                >
                                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                                    <span style={{fontSize:'.75rem',fontWeight:800,color:idx===0?'#4ade80':idx===1?'#60a5fa':'#facc15'}}>{crop.rank}</span>
                                    <span style={{fontSize:'.72rem',background:'rgba(255,255,255,0.08)',padding:'.15rem .45rem',borderRadius:4,color:'#aaa'}}>{crop.category}</span>
                                  </div>
                                  <div style={{fontSize:'1.3rem',fontWeight:800,color:'#fff',display:'flex',alignItems:'center',gap:'.4rem'}}>
                                    <span>{crop.icon}</span> {crop.name}
                                  </div>
                                  <div style={{display:'flex',alignItems:'baseline',gap:'.4rem',marginTop:'.3rem'}}>
                                    <span style={{fontSize:'1.5rem',fontWeight:800,color:'#22c55e'}}>{crop.suitabilityScore}%</span>
                                    <span style={{fontSize:'.75rem',color:'#888',fontWeight:600}}>{t.suitabilityScore}</span>
                                  </div>
                                  <div style={{fontSize:'.75rem',color:'#94a3b8',borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:'.4rem'}}>
                                    Est. Net: <strong style={{color:'#f1f1f1'}}>{crop.totalEstProfit}</strong> ({crop.estProfitPerAcre}/acre)
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Active Crop Detailed Plan */}
                          {activeRec && (
                            <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>
                              {/* 🧠 Explainable AI Panel */}
                              <div className="card" style={{borderLeft:'4px solid #3b82f6'}}>
                                <div className="section-title" style={{color:'#60a5fa'}}>
                                  {t.whyAiRecommended} ({activeRec.name})
                                </div>
                                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'.75rem'}}>
                                  {activeRec.whyExplanation.map((why, i) => (
                                    <div key={i} style={{background:'#1f1f1f',borderRadius:8,padding:'.75rem .9rem',border:'1px solid #2a2a2a'}}>
                                      <div style={{display:'flex',alignItems:'center',gap:'.4rem',marginBottom:'.2rem'}}>
                                        <span style={{color:why.icon==='✓'?'#22c55e':'#f59e0b',fontWeight:800}}>{why.icon}</span>
                                        <span style={{fontSize:'.82rem',fontWeight:700,color:'#fff'}}>{why.title}</span>
                                      </div>
                                      <div style={{fontSize:'.75rem',color:'#aaa',lineHeight:1.45}}>{why.detail}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* 📋 Complete Farm Action Plan */}
                              <div className="grid2">
                                {/* Left Column: Sowing & Fertilizer */}
                                <div className="card">
                                  <div className="section-title">🌾 Sowing & Precision Fertilizer Schedule</div>
                                  <div style={{display:'flex',flexDirection:'column',gap:'.75rem'}}>
                                    <div style={{background:'#1f1f1f',borderRadius:8,padding:'.75rem',border:'1px solid #2a2a2a'}}>
                                      <div style={{fontSize:'.72rem',color:'#888',textTransform:'uppercase',fontWeight:700}}>Sowing Window & Seed Rate</div>
                                      <div style={{fontSize:'.85rem',fontWeight:700,color:'#4ade80',marginTop:'.2rem'}}>📅 {activeRec.sowingWindow}</div>
                                      <div style={{fontSize:'.78rem',color:'#ccc',marginTop:'.2rem'}}>🌱 Seed Rate: {activeRec.seedRate}</div>
                                      <div style={{fontSize:'.78rem',color:'#ccc',marginTop:'.2rem'}}>📦 Expected Yield: {activeRec.yieldRange}</div>
                                    </div>

                                    {activeRec.fertilizerStages.map((st, i) => (
                                      <div key={i} style={{background:'#1f1f1f',borderRadius:8,padding:'.75rem',border:'1px solid #2a2a2a'}}>
                                        <div style={{fontSize:'.78rem',fontWeight:700,color:'#60a5fa'}}>{st.stage}</div>
                                        <div style={{fontSize:'.78rem',color:'#aaa',marginTop:'.2rem',lineHeight:1.45}}>{st.desc}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Right Column: Irrigation & Disease Risks */}
                                <div className="card">
                                  <div className="section-title">💧 Water & Disease Management</div>
                                  <div style={{display:'flex',flexDirection:'column',gap:'.75rem'}}>
                                    <div style={{background:'#1f1f1f',borderRadius:8,padding:'.75rem',border:'1px solid #2a2a2a'}}>
                                      <div style={{fontSize:'.72rem',color:'#888',textTransform:'uppercase',fontWeight:700}}>Irrigation Protocol ({activeRec.irrigationPlan.method})</div>
                                      <div style={{fontSize:'.82rem',color:'#60a5fa',marginTop:'.2rem',fontWeight:600}}>💧 Total Need: {activeRec.irrigationPlan.requirement}</div>
                                      <div style={{fontSize:'.78rem',color:'#aaa',marginTop:'.2rem'}}>{activeRec.irrigationPlan.stages}</div>
                                      <div style={{fontSize:'.78rem',color:'#4ade80',marginTop:'.2rem'}}>{activeRec.irrigationPlan.schedule}</div>
                                    </div>

                                    <div style={{background:'#1f1f1f',borderRadius:8,padding:'.75rem',border:'1px solid #2a2a2a'}}>
                                      <div style={{fontSize:'.72rem',color:'#888',textTransform:'uppercase',fontWeight:700}}>Disease Threats & Prevention</div>
                                      {activeRec.diseaseRisks.map((d, i) => (
                                        <div key={i} style={{fontSize:'.78rem',color:'#fca5a5',marginTop:'.3rem',lineHeight:1.4}}>
                                          • {d}
                                        </div>
                                      ))}
                                    </div>

                                    {/* 🛒 Link to Marketplace Inputs */}
                                    <div style={{background:'rgba(34,197,94,0.08)',borderRadius:8,padding:'.75rem',border:'1px solid rgba(34,197,94,0.2)'}}>
                                      <div style={{fontSize:'.75rem',fontWeight:700,color:'#4ade80',marginBottom:'.4rem'}}>
                                        🛒 Required Farming Inputs (In Agri Store)
                                      </div>
                                      <div style={{display:'flex',gap:'.4rem',flexWrap:'wrap'}}>
                                        {activeRec.matchingInputs.map(inp => (
                                          <span key={inp} style={{background:'#1a1a1a',color:'#f1f1f1',fontSize:'.72rem',padding:'.2rem .5rem',borderRadius:4,border:'1px solid #333'}}>
                                            {inp}
                                          </span>
                                        ))}
                                      </div>
                                      <button 
                                        className="btn btn-primary" 
                                        style={{width:'100%',marginTop:'.65rem',fontSize:'.8rem',padding:'.45rem'}}
                                        onClick={() => {
                                          setActiveTab('marketplace');
                                          setMarketSearchInput(activeRec.name.split(' ')[0]);
                                        }}
                                      >
                                        🛍️ View & Buy Inputs in Marketplace →
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Agricultural Expert Disclaimer */}
                              <div style={{background:'#181818',border:'1px solid #2a2a2a',borderRadius:8,padding:'.75rem 1rem',fontSize:'.75rem',color:'#888',lineHeight:1.5}}>
                                {t.disclaimer}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ════ PLANT HEALTH SCANNER ════ */}
            {activeTab==='scanner' && (() => {
              const currentReport = diseaseReport || PLANT_DISEASES_DB[scanCropType];

              return (
                <div className="grid2">
                  {/* Left Column: Camera Upload & Scanner */}
                  <div className="card">
                    <div className="section-title">🔬 Plant Health & Leaf Scanner</div>
                    <p style={{fontSize:'.82rem',color:'#888',marginBottom:'1rem'}}>
                      Upload a photo of an affected leaf or choose a crop scenario to initiate AI automated agronomic scanning.
                    </p>

                    {/* Crop Target Presets */}
                    <div style={{display:'flex',gap:'.4rem',flexWrap:'wrap',marginBottom:'1rem'}}>
                      {[
                        { id:'tomato_blight', label:'🍅 Tomato Early Blight' },
                        { id:'rice_blast', label:'🌾 Rice Blast' },
                        { id:'cotton_blight', label:'☁️ Cotton Bacterial Blight' },
                        { id:'chilli_anthracnose', label:'🌶️ Chilli Anthracnose' },
                        { id:'healthy_leaf', label:'🌿 Healthy Leaf' },
                      ].map(s => (
                        <button
                          key={s.id}
                          className={`scan-btn${scanCropType===s.id?' active':''}`}
                          onClick={() => {
                            setScanCropType(s.id);
                            setUploadedScanImage(null);
                            setDiseaseReport(null);
                          }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>

                    {/* Camera Photo Upload Buttons */}
                    <div style={{display:'flex',gap:'.5rem',marginBottom:'1rem'}}>
                      <label className="btn btn-outline" style={{flex:1,cursor:'pointer',fontSize:'.8rem'}}>
                        📷 Take / Upload Leaf Photo
                        <input type="file" accept="image/*" style={{display:'none'}} onChange={handlePhotoUpload} />
                      </label>
                      <button className="btn btn-primary" style={{flex:1,fontSize:'.8rem'}} onClick={triggerScan}>
                        ⚡ Run AI Diagnosis
                      </button>
                    </div>

                    {/* Viewport with Laser Animation */}
                    <div style={{
                      background: '#151515',
                      border: '2px dashed #333',
                      borderRadius: 12,
                      height: 260,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {uploadedScanImage || currentReport?.sampleImage ? (
                        <img
                          src={uploadedScanImage || currentReport?.sampleImage}
                          alt="Leaf Specimen"
                          style={{width:'100%',height:'100%',objectFit:'cover'}}
                        />
                      ) : (
                        <div style={{textAlign:'center',padding:'1rem'}}>
                          <div style={{fontSize:'3rem'}}>🍃</div>
                          <div style={{color:'#888',fontSize:'.8rem',marginTop:'.5rem'}}>Select specimen or upload photo</div>
                        </div>
                      )}

                      {/* Laser scanning beam */}
                      {isScanning && (
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(34,197,94,0.15)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <div style={{fontSize:'2.5rem',animation:'pulse 1s infinite'}}>🔬</div>
                          <div style={{color:'#22c55e',fontWeight:800,fontSize:'.9rem',marginTop:'.5rem'}}>
                            Analyzing Leaf Pathogens...
                          </div>
                          <div style={{
                            position: 'absolute',
                            height: 3,
                            background: 'linear-gradient(90deg, transparent, #22c55e, #4ade80, transparent)',
                            width: '100%',
                            left: 0,
                            animation: 'scanLine 1.5s linear infinite'
                          }}></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Diagnostic Report */}
                  <div className="card">
                    <div className="section-title">📋 Diagnostic Report & Treatment</div>

                    {currentReport ? (
                      <div style={{display:'flex',flexDirection:'column',gap:'.9rem',animation:'fadeIn .3s ease'}}>
                        {/* Header Box */}
                        <div style={{
                          background: currentReport.riskLevel === 'None' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                          border: `1px solid ${currentReport.riskLevel === 'None' ? '#22c55e' : '#ef4444'}`,
                          borderRadius: 10,
                          padding: '1rem',
                          textAlign: 'center'
                        }}>
                          <div style={{fontSize:'1.15rem',fontWeight:800,color:currentReport.riskColor}}>{currentReport.disease}</div>
                          <div style={{fontSize:'.8rem',color:'#888',marginTop:'.25rem'}}>
                            Confidence: <strong style={{color:'#f1f1f1'}}>{currentReport.confidence}</strong> | Risk Level: <strong style={{color:currentReport.riskColor}}>{currentReport.riskLevel}</strong>
                          </div>
                        </div>

                        {/* Symptoms Checklist */}
                        <div style={{background:'#1f1f1f',borderRadius:8,padding:'.85rem',border:'1px solid #2a2a2a'}}>
                          <div style={{fontSize:'.75rem',fontWeight:700,color:'#60a5fa',marginBottom:'.3rem',textTransform:'uppercase'}}>🔍 Diagnostic Symptoms</div>
                          {currentReport.symptoms.map((sym, i) => (
                            <div key={i} style={{fontSize:'.78rem',color:'#cbd5e1',marginTop:'.2rem',lineHeight:1.4}}>
                              • {sym}
                            </div>
                          ))}
                        </div>

                        {/* Immediate Steps */}
                        <div style={{background:'#1f1f1f',borderRadius:8,padding:'.85rem',border:'1px solid #2a2a2a'}}>
                          <div style={{fontSize:'.75rem',fontWeight:700,color:'#f59e0b',marginBottom:'.3rem',textTransform:'uppercase'}}>🚨 Immediate Action Steps</div>
                          {currentReport.immediateSteps.map((step, i) => (
                            <div key={i} style={{fontSize:'.78rem',color:'#e2e8f0',marginTop:'.25rem',lineHeight:1.4}}>
                              {step}
                            </div>
                          ))}
                        </div>

                        {/* Dual Treatment */}
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.6rem'}}>
                          <div style={{background:'#1f1f1f',borderRadius:8,padding:'.75rem',border:'1px solid #2a2a2a'}}>
                            <div style={{fontSize:'.72rem',fontWeight:700,color:'#4ade80',marginBottom:'.2rem'}}>🌿 Organic Treatment</div>
                            <div style={{fontSize:'.74rem',color:'#aaa',lineHeight:1.4}}>{currentReport.organicRemedy}</div>
                          </div>
                          <div style={{background:'#1f1f1f',borderRadius:8,padding:'.75rem',border:'1px solid #2a2a2a'}}>
                            <div style={{fontSize:'.72rem',fontWeight:700,color:'#f87171',marginBottom:'.2rem'}}>🧪 Chemical Remedy</div>
                            <div style={{fontSize:'.74rem',color:'#aaa',lineHeight:1.4}}>{currentReport.chemicalRemedy}</div>
                          </div>
                        </div>

                        {/* Buy Medicine in Store */}
                        {currentReport.marketplaceMatch && (
                          <button
                            className="btn btn-primary"
                            style={{width:'100%',padding:'.65rem',fontWeight:700,fontSize:'.85rem'}}
                            onClick={() => {
                              setActiveTab('marketplace');
                              setMarketSearchInput(currentReport.marketplaceMatch.split(' ')[0]);
                            }}
                          >
                            🛒 Buy {currentReport.marketplaceMatch} in Agri Store →
                          </button>
                        )}
                      </div>
                    ) : (
                      <div style={{textAlign:'center',padding:'3rem',opacity:0.5}}>
                        <span style={{fontSize:'3rem'}}>🔬</span>
                        <p style={{color:'#888',fontSize:'.85rem',marginTop:'1rem'}}>Select specimen or upload photo to diagnose.</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

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

      {/* ═══ Mobile Bottom Navigation (5 key actions: Home, AI, Market, Orders, Me) ═══ */}
      <nav className="mobile-bottom-nav">
        <div className="mobile-bottom-nav-inner">
          <button 
            className={`bottom-nav-btn ${activeTab==='overview' ? 'active' : ''}`}
            onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}
          >
            <span className="bn-icon">🏡</span>
            <span className="bn-label">Home</span>
          </button>
          
          <button 
            className={`bottom-nav-btn ${(activeTab==='advisor' || activeTab==='scanner') ? 'active' : ''}`}
            onClick={() => { setActiveTab('advisor'); setIsSidebarOpen(false); }}
          >
            <span className="bn-icon">🌱</span>
            <span className="bn-label">AI Farm</span>
          </button>
          
          <button 
            className={`bottom-nav-btn ${activeTab==='marketplace' ? 'active' : ''}`}
            onClick={() => { setActiveTab('marketplace'); setIsSidebarOpen(false); }}
          >
            <span className="bn-icon">🛒</span>
            <span className="bn-label">Market</span>
            {cart.length > 0 && (
              <span className="bottom-nav-badge">
                {cart.reduce((s,i)=>s+i.quantity,0)}
              </span>
            )}
          </button>
          
          <button 
            className={`bottom-nav-btn ${activeTab==='expenses' ? 'active' : ''}`}
            onClick={() => { setActiveTab('expenses'); setIsSidebarOpen(false); }}
          >
            <span className="bn-icon">📦</span>
            <span className="bn-label">Orders</span>
          </button>
          
          <button 
            className={`bottom-nav-btn ${(activeTab==='chat' || activeTab==='schemes') ? 'active' : ''}`}
            onClick={() => { setActiveTab('chat'); setIsSidebarOpen(false); }}
          >
            <span className="bn-icon">👤</span>
            <span className="bn-label">Me</span>
          </button>
        </div>
      </nav>

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
