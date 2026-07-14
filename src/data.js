// ════════════════════════════════════════════════════════════════════════════
// SMART CROP ADVISOR AI — MASTER DATA FILE
// ════════════════════════════════════════════════════════════════════════════

// ── 1. COMPLETE COMMODITY DATABASE ──────────────────────────────────────────
export const COMMODITY_CATEGORIES = {
  '🥬 Leafy Vegetables': [
    'Spinach','Fenugreek Leaves (Methi)','Coriander Leaves','Curry Leaves','Mint (Pudina)',
    'Amaranth Leaves','Drumstick Leaves','Radish Leaves','Cabbage','Lettuce','Kale','Celery',
    'Dill Leaves','Sorrel','Bathua (Chenopodium)','Water Spinach (Kangkong)','Mustard Leaves'
  ],
  '🍆 Other Vegetables': [
    'Tomato','Onion','Potato','Brinjal (Eggplant)','Okra (Bhindi)','Cauliflower','Carrot',
    'Bitter Gourd (Karela)','Ridge Gourd','Capsicum','Green Chilli','Garlic','Ginger','Radish',
    'Beetroot','Turnip','Sweet Potato','Yam (Suran)','Colocasia (Arbi)','Pumpkin','Bottle Gourd',
    'Snake Gourd','Ash Gourd (Petha)','Pointed Gourd (Parwal)','Ivy Gourd (Tindora)','Drumstick',
    'Raw Banana','Green Peas','Cluster Beans (Guar)','French Beans','Broad Beans',
    'Knol Khol (Kohlrabi)','Celery','Leek','Asparagus','Mushroom (Button)','Mushroom (Oyster)',
    'Baby Corn','Corn on Cob','Cherry Tomato','Zucchini','Broccoli'
  ],
  '🍎 Fresh Fruits': [
    'Mango','Banana','Papaya','Grapes (Green)','Grapes (Black)','Pomegranate','Watermelon',
    'Guava','Orange','Lemon','Lime','Apple (Shimla)','Apple (Kashmiri)','Pear','Peach',
    'Plum','Apricot','Litchi','Jackfruit','Pineapple','Coconut (Tender)','Coconut (Dry)',
    'Chickoo (Sapota)','Custard Apple','Fig (Anjeer Fresh)','Strawberry','Kiwi','Dragon Fruit',
    'Avocado','Passion Fruit','Mulberry','Star Fruit (Carambola)','Persimmon','Tamarind (Fresh)',
    'Wood Apple (Bael)','Jamun (Java Plum)','Ber (Indian Jujube)','Amla (Indian Gooseberry)',
    'Kokum','Palmyra Palm Fruit'
  ],
  '🥜 Dry Fruits & Nuts': [
    'Almonds (Badam)','Cashews (Kaju)','Walnuts (Akhrot)','Pistachios (Pista)','Raisins (Kishmish)',
    'Dates (Khajoor)','Figs (Anjeer Dry)','Apricot (Dry Khubani)','Prunes','Cranberry (Dry)',
    'Pine Nuts (Chilgoza)','Macadamia','Hazelnuts','Pecans','Brazil Nuts','Lotus Seeds (Makhana)',
    'Chestnut','Coconut (Desiccated)','Groundnut (Roasted)','Fox Nuts','Dried Mango (Aamchur)',
    'Dried Pomegranate Seeds (Anardana)','Dried Kokum','Tamarind (Dry)','Dried Lemon Peel'
  ],
  '🌾 Grains & Cereals': [
    'Paddy (Rice)','Wheat','Maize (Corn)','Jowar (Sorghum)','Bajra (Pearl Millet)','Ragi (Finger Millet)',
    'Barley','Oats','Sorghum','Kodo Millet','Little Millet (Kutki)','Foxtail Millet (Kangni)',
    'Barnyard Millet (Sanwa)','Proso Millet','Amaranth Grain','Buckwheat (Kuttu)',
    'Rice (Basmati)','Rice (Sona Masuri)','Rice (IR-36)','Rice (Ponni)','Poha (Flattened Rice)',
    'Wheat Semolina (Rava)','Wheat Flour (Atta)','Refined Flour (Maida)'
  ],
  '🫘 Pulses & Legumes': [
    'Chickpea (Chana)','Toor Dal (Arhar)','Moong Dal (Green)','Moong Dal (Yellow)','Urad Dal (Black)',
    'Urad Dal (White)','Masoor Dal (Red Lentil)','Chana Dal','Rajma (Kidney Beans)','Moth Beans',
    'Horse Gram (Kulthi)','Cowpea (Lobia)','Field Peas','Cluster Beans (Guar Seed)','Soybean',
    'Pigeon Pea','Val Beans','Dolichos Beans','Lima Beans','Broad Beans (Fava)'
  ],
  '🌶 Spices & Condiments': [
    'Turmeric (Haldi)','Red Chilli (Dry)','Coriander Seeds (Dhania)','Cumin (Jeera)','Black Pepper',
    'Cardamom (Green)','Cardamom (Black)','Cloves','Cinnamon','Nutmeg','Mace (Javitri)',
    'Star Anise','Bay Leaves','Mustard Seeds','Fenugreek Seeds (Methi)','Carom Seeds (Ajwain)',
    'Asafoetida (Hing)','Saffron (Kesar)','Vanilla','Fennel Seeds (Saunf)','Sesame (Til)',
    'Poppy Seeds (Khus Khus)','Curry Leaves (Dry)','Tamarind (Dry)','Dried Mango Powder (Amchur)',
    'Kokum Dry','Pomegranate Seeds Dry (Anardana)','Nigella Seeds (Kalonji)'
  ],
  '🥛 Dairy & Animal Products': [
    'Milk (Cow — per litre)','Milk (Buffalo — per litre)','Curd / Yogurt (per kg)','Ghee (per kg)',
    'Butter (per kg)','Paneer (per kg)','Cream (per litre)','Whey Protein (per kg)',
    'Eggs (Chicken — per dozen)','Eggs (Duck — per dozen)','Eggs (Quail — 20 pcs)',
    'Chicken (Live — per kg)','Chicken (Dressed — per kg)','Mutton (per kg)',
    'Fish (Rohu — per kg)','Fish (Catla — per kg)','Fish (Pomfret — per kg)',
    'Prawn (per kg)','Honey (per kg)','Beeswax (per kg)'
  ],
  '🛢 Oils & Fats': [
    'Groundnut Oil (per litre)','Sunflower Oil (per litre)','Mustard Oil (per litre)',
    'Coconut Oil (per litre)','Sesame Oil (per litre)','Rice Bran Oil (per litre)',
    'Soybean Oil (per litre)','Cottonseed Oil (per litre)','Palm Oil (per litre)',
    'Castor Oil (per litre)','Neem Oil (per litre — for agri)','Vanaspati (per kg)'
  ],
  '🍬 Processed & Daily Life': [
    'Sugar (per kg)','Jaggery (Gur — per kg)','Brown Sugar (per kg)','Honey (per kg)',
    'Salt (Iodised — per kg)','Vinegar (per litre)','Tomato Sauce (per kg)',
    'Tea Leaves (CTC — per kg)','Tea Leaves (Green — per kg)','Coffee Beans (per kg)',
    'Cocoa Powder (per kg)','Rice Flour (per kg)','Besan (Gram Flour — per kg)',
    'Cornflour (per kg)','Arrowroot (per kg)','Tapioca (per kg)','Vermicelli (per kg)',
    'Papad (per kg)','Pickle (Mixed — per kg)'
  ],
  '🌿 Cash Crops & Fiber': [
    'Cotton (Long Staple)','Cotton (Medium Staple)','Sugarcane (per tonne)','Tobacco (Flue Cured)',
    'Tobacco (Burley)','Jute (per quintal)','Flax','Hemp','Rubber (per kg)','Tea (Green Leaf)',
    'Coffee (Cherry)','Cocoa Beans','Indigo','Silk Cocoon (per kg)','Lac (per kg)'
  ],
  '🌱 Oilseeds': [
    'Groundnut (in shell)','Groundnut (bold)','Sunflower Seed','Mustard Seed','Rapeseed',
    'Soybean (Yellow)','Sesame (White)','Sesame (Black)','Castor Seed','Safflower Seed',
    'Linseed (Flaxseed)','Niger Seed','Cottonseed','Palm Kernel'
  ],
  '🧪 Farming Inputs': [
    'Urea (50kg bag)','DAP Fertilizer (50kg)','NPK 10-26-26 (50kg)','NPK 12-32-16 (50kg)',
    'MOP (Potash 50kg)','SSP Single Super Phosphate (50kg)','Zinc Sulphate (per kg)',
    'Boron (per kg)','Magnesium Sulphate (per kg)','Calcium Nitrate (per kg)',
    'BT Cotton Seed (450g pkt)','Paddy Hybrid Seed (5kg)','Tomato Hybrid Seed (10g)',
    'Onion Seed (per kg)','Maize Hybrid Seed (per kg)','Bajra Hybrid Seed (per kg)',
    'Sunflower Hybrid Seed (per kg)','Vegetable Seed Kit (assorted)',
    'Chlorpyrifos (1L)','Cypermethrin (500ml)','Lambda Cyhalothrin (500ml)',
    'Mancozeb Fungicide (1kg)','Carbendazim Fungicide (500g)','Copper Oxychloride (1kg)',
    'Glyphosate Herbicide (1L)','Atrazine Herbicide (1kg)','Pendimethalin (1L)',
    'Neem Oil Pesticide (5L)','Bio Pesticide (Beauveria 1L)','Pheromone Trap (per set)',
    'Tractor Diesel (per litre)','Pump Fuel (per litre)',
    'Drip Tape (per 100m roll)','Sprinkler Set (per unit)','Drip Inline (per 100m)',
    'HDPE Pipe 32mm (per metre)','Micro Tube (per 100m)',
    'Organic Manure (per bag 50kg)','Vermicompost (per 25kg)','Biofertilizer (Rhizobium 200g)'
  ],
};

export const ALL_CROPS = Object.values(COMMODITY_CATEGORIES).flat();

// ── 2. BASE PRICES AT HYDERABAD (₹/unit) ────────────────────────────────────
export const BASE_PRICES = {
  // Leafy Veg
  'Spinach':18,'Fenugreek Leaves (Methi)':25,'Coriander Leaves':30,'Curry Leaves':60,
  'Mint (Pudina)':30,'Amaranth Leaves':15,'Drumstick Leaves':40,'Radish Leaves':10,
  'Cabbage':15,'Lettuce':60,'Kale':80,'Celery':70,'Dill Leaves':35,'Sorrel':25,
  'Bathua (Chenopodium)':20,'Water Spinach (Kangkong)':25,'Mustard Leaves':20,
  // Other Veg
  'Tomato':22,'Onion':28,'Potato':20,'Brinjal (Eggplant)':18,'Okra (Bhindi)':32,
  'Cauliflower':25,'Carrot':28,'Bitter Gourd (Karela)':35,'Ridge Gourd':22,
  'Capsicum':45,'Green Chilli':40,'Garlic':120,'Ginger':80,'Radish':15,'Beetroot':28,
  'Turnip':22,'Sweet Potato':25,'Yam (Suran)':30,'Colocasia (Arbi)':35,
  'Pumpkin':18,'Bottle Gourd':16,'Snake Gourd':20,'Ash Gourd (Petha)':15,
  'Pointed Gourd (Parwal)':35,'Ivy Gourd (Tindora)':30,'Drumstick':45,
  'Raw Banana':22,'Green Peas':55,'Cluster Beans (Guar)':30,'French Beans':50,
  'Broad Beans':40,'Knol Khol (Kohlrabi)':20,'Leek':50,'Asparagus':120,
  'Mushroom (Button)':120,'Mushroom (Oyster)':150,'Baby Corn':80,'Corn on Cob':20,
  'Cherry Tomato':80,'Zucchini':40,'Broccoli':90,
  // Fruits
  'Mango':60,'Banana':28,'Papaya':22,'Grapes (Green)':80,'Grapes (Black)':90,
  'Pomegranate':90,'Watermelon':12,'Guava':35,'Orange':55,'Lemon':60,'Lime':50,
  'Apple (Shimla)':140,'Apple (Kashmiri)':160,'Pear':70,'Peach':80,'Plum':65,
  'Apricot':90,'Litchi':120,'Jackfruit':25,'Pineapple':35,'Coconut (Tender)':30,
  'Coconut (Dry)':25,'Chickoo (Sapota)':40,'Custard Apple':80,'Fig (Anjeer Fresh)':150,
  'Strawberry':200,'Kiwi':180,'Dragon Fruit':250,'Avocado':200,'Passion Fruit':150,
  'Mulberry':80,'Star Fruit (Carambola)':60,'Persimmon':100,'Tamarind (Fresh)':40,
  'Wood Apple (Bael)':30,'Jamun (Java Plum)':60,'Ber (Indian Jujube)':30,
  'Amla (Indian Gooseberry)':45,'Kokum':55,'Palmyra Palm Fruit':25,
  // Dry Fruits
  'Almonds (Badam)':700,'Cashews (Kaju)':900,'Walnuts (Akhrot)':750,
  'Pistachios (Pista)':1200,'Raisins (Kishmish)':300,'Dates (Khajoor)':200,
  'Figs (Anjeer Dry)':400,'Apricot (Dry Khubani)':350,'Prunes':250,'Cranberry (Dry)':400,
  'Pine Nuts (Chilgoza)':2000,'Macadamia':1500,'Hazelnuts':600,'Pecans':800,
  'Brazil Nuts':900,'Lotus Seeds (Makhana)':700,'Chestnut':200,
  'Coconut (Desiccated)':120,'Groundnut (Roasted)':80,'Fox Nuts':650,
  'Dried Mango (Aamchur)':180,'Dried Pomegranate Seeds (Anardana)':350,
  'Dried Kokum':200,'Tamarind (Dry)':80,'Dried Lemon Peel':200,
  // Grains
  'Paddy (Rice)':22,'Wheat':24,'Maize (Corn)':18,'Jowar (Sorghum)':22,
  'Bajra (Pearl Millet)':20,'Ragi (Finger Millet)':35,'Barley':25,'Oats':45,
  'Sorghum':22,'Kodo Millet':35,'Little Millet (Kutki)':40,'Foxtail Millet (Kangni)':38,
  'Barnyard Millet (Sanwa)':42,'Proso Millet':38,'Amaranth Grain':60,
  'Buckwheat (Kuttu)':80,'Rice (Basmati)':85,'Rice (Sona Masuri)':50,
  'Rice (IR-36)':35,'Rice (Ponni)':45,'Poha (Flattened Rice)':55,
  'Wheat Semolina (Rava)':40,'Wheat Flour (Atta)':38,'Refined Flour (Maida)':35,
  // Pulses
  'Chickpea (Chana)':65,'Toor Dal (Arhar)':110,'Moong Dal (Green)':95,
  'Moong Dal (Yellow)':100,'Urad Dal (Black)':105,'Urad Dal (White)':110,
  'Masoor Dal (Red Lentil)':85,'Chana Dal':75,'Rajma (Kidney Beans)':130,
  'Moth Beans':80,'Horse Gram (Kulthi)':55,'Cowpea (Lobia)':70,
  'Field Peas':60,'Cluster Beans (Guar Seed)':45,'Soybean':48,
  'Pigeon Pea':100,'Val Beans':65,'Dolichos Beans':60,'Lima Beans':80,'Broad Beans (Fava)':55,
  // Spices
  'Turmeric (Haldi)':90,'Red Chilli (Dry)':120,'Coriander Seeds (Dhania)':55,
  'Cumin (Jeera)':280,'Black Pepper':480,'Cardamom (Green)':1800,'Cardamom (Black)':800,
  'Cloves':1100,'Cinnamon':400,'Nutmeg':600,'Mace (Javitri)':900,
  'Star Anise':500,'Bay Leaves':200,'Mustard Seeds':55,'Fenugreek Seeds (Methi)':65,
  'Carom Seeds (Ajwain)':120,'Asafoetida (Hing)':1500,'Saffron (Kesar)':30000,
  'Vanilla':4000,'Fennel Seeds (Saunf)':90,'Sesame (Til)':140,
  'Poppy Seeds (Khus Khus)':800,'Curry Leaves (Dry)':300,
  'Dried Mango Powder (Amchur)':180,'Kokum Dry':200,
  'Pomegranate Seeds Dry (Anardana)':350,'Nigella Seeds (Kalonji)':150,
  // Dairy
  'Milk (Cow — per litre)':52,'Milk (Buffalo — per litre)':58,'Curd / Yogurt (per kg)':60,
  'Ghee (per kg)':580,'Butter (per kg)':480,'Paneer (per kg)':320,'Cream (per litre)':180,
  'Whey Protein (per kg)':800,'Eggs (Chicken — per dozen)':68,'Eggs (Duck — per dozen)':80,
  'Eggs (Quail — 20 pcs)':90,'Chicken (Live — per kg)':95,'Chicken (Dressed — per kg)':145,
  'Mutton (per kg)':680,'Fish (Rohu — per kg)':180,'Fish (Catla — per kg)':200,
  'Fish (Pomfret — per kg)':350,'Prawn (per kg)':450,'Honey (per kg)':280,'Beeswax (per kg)':400,
  // Oils
  'Groundnut Oil (per litre)':175,'Sunflower Oil (per litre)':140,'Mustard Oil (per litre)':155,
  'Coconut Oil (per litre)':180,'Sesame Oil (per litre)':200,'Rice Bran Oil (per litre)':130,
  'Soybean Oil (per litre)':125,'Cottonseed Oil (per litre)':118,'Palm Oil (per litre)':100,
  'Castor Oil (per litre)':110,'Neem Oil (per litre — for agri)':80,'Vanaspati (per kg)':115,
  // Processed
  'Sugar (per kg)':40,'Jaggery (Gur — per kg)':55,'Brown Sugar (per kg)':60,
  'Salt (Iodised — per kg)':18,'Vinegar (per litre)':45,'Tomato Sauce (per kg)':80,
  'Tea Leaves (CTC — per kg)':280,'Tea Leaves (Green — per kg)':400,'Coffee Beans (per kg)':550,
  'Cocoa Powder (per kg)':350,'Rice Flour (per kg)':40,'Besan (Gram Flour — per kg)':80,
  'Cornflour (per kg)':55,'Arrowroot (per kg)':90,'Tapioca (per kg)':35,
  'Vermicelli (per kg)':60,'Papad (per kg)':130,'Pickle (Mixed — per kg)':120,
  // Cash Crops
  'Cotton (Long Staple)':65,'Cotton (Medium Staple)':58,'Sugarcane (per tonne)':3000,
  'Tobacco (Flue Cured)':220,'Tobacco (Burley)':180,'Jute (per quintal)':5500,
  'Flax':90,'Hemp':250,'Rubber (per kg)':155,'Tea (Green Leaf)':18,
  'Coffee (Cherry)':45,'Cocoa Beans':250,'Indigo':800,'Silk Cocoon (per kg)':350,'Lac (per kg)':300,
  // Oilseeds
  'Groundnut (in shell)':55,'Groundnut (bold)':65,'Sunflower Seed':48,'Mustard Seed':55,
  'Rapeseed':50,'Soybean (Yellow)':48,'Sesame (White)':140,'Sesame (Black)':130,
  'Castor Seed':65,'Safflower Seed':45,'Linseed (Flaxseed)':60,'Niger Seed':70,
  'Cottonseed':35,'Palm Kernel':45,
  // Farming Inputs
  'Urea (50kg bag)':1400,'DAP Fertilizer (50kg)':1350,'NPK 10-26-26 (50kg)':1600,
  'NPK 12-32-16 (50kg)':1580,'MOP (Potash 50kg)':900,'SSP Single Super Phosphate (50kg)':480,
  'Zinc Sulphate (per kg)':80,'Boron (per kg)':150,'Magnesium Sulphate (per kg)':45,
  'Calcium Nitrate (per kg)':55,'BT Cotton Seed (450g pkt)':800,'Paddy Hybrid Seed (5kg)':480,
  'Tomato Hybrid Seed (10g)':120,'Onion Seed (per kg)':350,'Maize Hybrid Seed (per kg)':380,
  'Bajra Hybrid Seed (per kg)':280,'Sunflower Hybrid Seed (per kg)':320,
  'Vegetable Seed Kit (assorted)':250,'Chlorpyrifos (1L)':380,'Cypermethrin (500ml)':280,
  'Lambda Cyhalothrin (500ml)':320,'Mancozeb Fungicide (1kg)':320,'Carbendazim Fungicide (500g)':180,
  'Copper Oxychloride (1kg)':280,'Glyphosate Herbicide (1L)':220,'Atrazine Herbicide (1kg)':180,
  'Pendimethalin (1L)':280,'Neem Oil Pesticide (5L)':620,'Bio Pesticide (Beauveria 1L)':350,
  'Pheromone Trap (per set)':120,'Tractor Diesel (per litre)':92,'Pump Fuel (per litre)':92,
  'Drip Tape (per 100m roll)':280,'Sprinkler Set (per unit)':580,'Drip Inline (per 100m)':420,
  'HDPE Pipe 32mm (per metre)':28,'Micro Tube (per 100m)':180,
  'Organic Manure (per bag 50kg)':350,'Vermicompost (per 25kg)':280,
  'Biofertilizer (Rhizobium 200g)':80,
};

// ── 3. INDIA STATES, DISTRICTS & MANDALS ────────────────────────────────────
export const INDIA_LOCATIONS = {
  'Telangana': {
    'Hyderabad': ['Secunderabad','Kukatpally','LB Nagar','Malakpet','Charminar','Uppal','Musheerabad'],
    'Warangal': ['Hanamkonda','Kazipet','Warangal Urban','Narsampet','Parkal','Bhupalpally'],
    'Nizamabad': ['Nizamabad Urban','Armoor','Bodhan','Banswada','Kamareddy','Balkonda'],
    'Karimnagar': ['Karimnagar Urban','Sircilla','Manthani','Jagtial','Peddapalli','Manakondur'],
    'Khammam': ['Khammam Urban','Kothagudem','Bhadrachalam','Yellandu','Palvoncha'],
    'Nalgonda': ['Nalgonda Urban','Miryalaguda','Suryapet','Devarakonda','Nakrekal'],
    'Medak': ['Medak Town','Sangareddy','Siddipet','Jogipet','Zaheerabad','Narayankhed'],
    'Ranga Reddy': ['Chevella','Vikarabad','Tandur','Maheshwaram','Rajendranagar','Ibrahimpatnam'],
    'Mahbubnagar': ['Mahbubnagar Town','Wanaparthy','Gadwal','Kalwakurthy','Shadnagar'],
    'Adilabad': ['Adilabad Town','Nirmal','Mancherial','Bellampalli','Utnoor'],
  },
  'Andhra Pradesh': {
    'Visakhapatnam': ['Visakhapatnam Urban','Gajuwaka','Bheemunipatnam','Anakapalle','Paderu','Narsipatnam'],
    'Vijayawada': ['Krishna Urban','Machilipatnam','Gudivada','Nuzvid','Bandar'],
    'Guntur': ['Guntur Urban','Tenali','Narasaraopet','Bapatla','Ponnur','Macherla'],
    'Kurnool': ['Kurnool Urban','Nandyal','Adoni','Yemmiganur','Dhone','Alur'],
    'Nellore': ['Nellore Urban','Kavali','Gudur','Sullurpeta','Atmakur'],
    'Kadapa': ['Kadapa Urban','Proddatur','Badvel','Rajampet','Pulivendula','Jammalamadugu'],
    'Chittoor': ['Chittoor Urban','Tirupati','Madanapalle','Punganur','Palamaner'],
    'Anantapur': ['Anantapur Urban','Guntakal','Hindupur','Dharmavaram','Tadipatri'],
    'Srikakulam': ['Srikakulam Urban','Narasannapeta','Palasa','Tekkali','Amadalavalasa'],
    'East Godavari': ['Rajahmundry','Kakinada','Amalapuram','Tuni','Rampachodavaram'],
  },
  'Maharashtra': {
    'Mumbai': ['Borivali','Andheri','Bandra','Dadar','Kurla','Worli','Colaba'],
    'Pune': ['Pune City','Pimpri-Chinchwad','Haveli','Baramati','Indapur','Bhor'],
    'Nashik': ['Nashik City','Malegaon','Nandgaon','Manmad','Igatpuri','Dindori'],
    'Nagpur': ['Nagpur City','Kamptee','Ramtek','Bhandara','Hingna','Parseoni'],
    'Aurangabad': ['Aurangabad City','Paithan','Kannad','Gangapur','Vaijapur'],
    'Solapur': ['Solapur City','Pandharpur','Barshi','Akkalkot','Mangalvedha'],
    'Kolhapur': ['Kolhapur City','Ichalkaranji','Karveer','Hatkanangle','Kagal'],
    'Amravati': ['Amravati City','Achalpur','Warud','Morshi','Daryapur'],
    'Sangli': ['Sangli City','Miraj','Vita','Islampur','Atpadi','Jath'],
    'Satara': ['Satara City','Karad','Wai','Phaltan','Mahabaleshwar'],
  },
  'Karnataka': {
    'Bengaluru Urban': ['Bengaluru City','Anekal','Hoskote','Devanahalli','Doddaballapur'],
    'Mysuru': ['Mysuru City','Nanjangud','Hunsur','Periyapatna','K.R. Nagar'],
    'Hubli-Dharwad': ['Hubli City','Dharwad City','Kundgol','Navalgund','Kalghatgi'],
    'Belagavi': ['Belagavi City','Chikodi','Gokak','Athani','Khanapur','Bailhongal'],
    'Mangaluru': ['Mangaluru City','Udupi','Bantwal','Sullia','Puttur','Belthangady'],
    'Kalaburagi': ['Kalaburagi City','Shorapur','Yadgir','Afzalpur','Chincholi'],
    'Ballari': ['Ballari City','Siruguppa','Hadagali','Hagaribommanahalli'],
    'Shivamogga': ['Shivamogga City','Sagar','Soraba','Shikaripura','Bhadravathi'],
    'Tumakuru': ['Tumakuru City','Tiptur','Madhugiri','Chikkanayakanahalli'],
    'Vijayapura': ['Vijayapura City','Indi','Muddebihal','Sindagi','Basavana Bagewadi'],
  },
  'Tamil Nadu': {
    'Chennai': ['Ambattur','Avadi','Sholinganallur','Tambaram','Perungalathur','Thiruvottiyur'],
    'Coimbatore': ['Coimbatore City','Pollachi','Mettupalayam','Annur','Sulur'],
    'Madurai': ['Madurai City','Melur','Usilampatti','Tirumangalam','Peraiyur'],
    'Salem': ['Salem City','Omalur','Mettur','Attur','Yercaud','Sankari'],
    'Tirunelveli': ['Tirunelveli City','Palayamkottai','Thoothukudi','Kovilpatti'],
    'Trichy': ['Trichy City','Srirangam','Musiri','Lalgudi','Thuraiyur'],
    'Vellore': ['Vellore City','Arani','Arcot','Gudiyatham','Ambur','Vaniyambadi'],
    'Erode': ['Erode City','Bhavani','Gobichettipalayam','Sathyamangalam'],
    'Tiruppur': ['Tiruppur City','Dharapuram','Palladam','Udumalaipettai'],
    'Thanjavur': ['Thanjavur City','Kumbakonam','Papanasam','Pattukottai'],
  },
  'Uttar Pradesh': {
    'Lucknow': ['Lucknow City','Bakshi Ka Talab','Chinhat','Malihabad','Gosaiganj'],
    'Kanpur': ['Kanpur Nagar','Kanpur Dehat','Bilhaur','Ghatampur','Sarbananda'],
    'Agra': ['Agra City','Firozabad','Etmadpur','Fatehabad','Bah'],
    'Varanasi': ['Varanasi City','Pindra','Arajiline','Harahua','Kashi Vidyapeeth'],
    'Allahabad': ['Prayagraj City','Phulpur','Handia','Meja','Holagarh'],
    'Meerut': ['Meerut City','Modinagar','Hapur','Garhmukteshwar','Bulandshahr'],
    'Mathura': ['Mathura City','Vrindavan','Govardhan','Baldeo','Mant'],
    'Aligarh': ['Aligarh City','Hathras','Iglas','Atrauli','Khair'],
    'Bareilly': ['Bareilly City','Pilibhit','Faridpur','Nawabganj','Baheri'],
    'Gorakhpur': ['Gorakhpur City','Chauri-Chaura','Deoria','Basti','Maharajganj'],
  },
  'Punjab': {
    'Ludhiana': ['Ludhiana City','Jagraon','Samrala','Khanna','Raikot'],
    'Amritsar': ['Amritsar City','Ajnala','Baba Bakala','Majitha','Rayya'],
    'Jalandhar': ['Jalandhar City','Phillaur','Nakodar','Shahkot','Lohian'],
    'Patiala': ['Patiala City','Rajpura','Nabha','Sangrur','Fatehgarh Sahib'],
    'Bathinda': ['Bathinda City','Rampura Phul','Nathana','Maur','Bhagta Bhai Ka'],
    'Hoshiarpur': ['Hoshiarpur City','Mukerian','Dasuya','Garhshankar','Tanda'],
    'Gurdaspur': ['Gurdaspur City','Batala','Dhariwal','Dinanagar','Dera Baba Nanak'],
    'Mohali': ['Mohali City','Kharar','Kurali','Morinda','Rupnagar'],
    'Firozpur': ['Firozpur City','Zira','Guru Har Sahai','Fazilka','Jalalabad'],
    'Moga': ['Moga City','Baghapurana','Nihal Singh Wala','Dharamkot'],
  },
  'Gujarat': {
    'Ahmedabad': ['Ahmedabad City','Dholka','Dhandhuka','Sanand','Bavla'],
    'Surat': ['Surat City','Bardoli','Olpad','Kamrej','Choryasi','Palsana'],
    'Vadodara': ['Vadodara City','Padra','Karjan','Shinor','Waghodiya'],
    'Rajkot': ['Rajkot City','Gondal','Jetpur','Dhoraji','Jasdan'],
    'Bhavnagar': ['Bhavnagar City','Sihor','Mahuva','Palitana','Talaja'],
    'Junagadh': ['Junagadh City','Veraval','Keshod','Mangrol','Vanthali'],
    'Gandhinagar': ['Gandhinagar City','Kalol','Dehgam','Mansa','Bechraji'],
    'Anand': ['Anand City','Kheda','Nadiad','Petlad','Borsad'],
    'Mehsana': ['Mehsana City','Visnagar','Kheralu','Unjha','Satlasana'],
    'Kutch': ['Bhuj','Mundra','Gandhidham','Anjar','Nakhatrana'],
  },
  'Rajasthan': {
    'Jaipur': ['Jaipur City','Sanganer','Amber','Chomu','Dudu','Phulera'],
    'Jodhpur': ['Jodhpur City','Phalodi','Bilara','Shergarh','Osian'],
    'Kota': ['Kota City','Baran','Bundi','Ramganjmandi','Ladpura'],
    'Ajmer': ['Ajmer City','Pushkar','Kishangarh','Beawar','Nasirabad'],
    'Udaipur': ['Udaipur City','Nathdwara','Rajsamand','Kherwara','Vallabhnagar'],
    'Bikaner': ['Bikaner City','Nokha','Kolayat','Lunkaransar','Deshnok'],
    'Alwar': ['Alwar City','Bharatpur','Deeg','Nagar','Kathumar'],
    'Sikar': ['Sikar City','Fatehpur','Laxmangarh','Dhod','Neem Ka Thana'],
    'Nagaur': ['Nagaur City','Merta','Ladnun','Nawa','Kuchaman'],
    'Jhalawar': ['Jhalawar City','Jhalarapatan','Khanpur','Manoharthana'],
  },
  'Madhya Pradesh': {
    'Bhopal': ['Bhopal City','Huzur','Berasia','Phanda','Sehore'],
    'Indore': ['Indore City','Mhow','Sanwer','Depalpur','Hatod'],
    'Gwalior': ['Gwalior City','Morena','Bhind','Dabra','Ambah'],
    'Jabalpur': ['Jabalpur City','Katni','Narsinghpur','Mandla','Umaria'],
    'Ujjain': ['Ujjain City','Nagda','Dewas','Shajapur','Ratlam'],
    'Sagar': ['Sagar City','Damoh','Chhatarpur','Tikamgarh','Lalitpur'],
    'Rewa': ['Rewa City','Satna','Sidhi','Singrauli','Maihar'],
    'Vidisha': ['Vidisha City','Sironj','Ganj Basoda','Kurwai','Nateran'],
    'Chhindwara': ['Chhindwara City','Seoni','Betul','Hoshangabad','Itarsi'],
    'Khargone': ['Khargone City','Barwani','Dhar','Jhabua','Alirajpur'],
  },
  'West Bengal': {
    'Kolkata': ['Kolkata City','Howrah','North 24 Parganas','South 24 Parganas','Barrackpore'],
    'Bardhaman': ['Bardhaman City','Durgapur','Asansol','Raniganj','Kalna'],
    'Nadia': ['Krishnanagar','Ranaghat','Kalyani','Chakdaha','Tehatta'],
    'Murshidabad': ['Berhampore','Lalbagh','Jangipur','Domkal','Raghunathganj'],
    'Hooghly': ['Chinsurah','Serampore','Chandannagar','Arambagh','Tarakeswar'],
    'Malda': ['Malda Town','English Bazar','Old Malda','Gajole','Bamangola'],
    'Jalpaiguri': ['Jalpaiguri City','Mal','Alipurduar','Nagrakata','Rajganj'],
    'Birbhum': ['Suri','Bolpur','Rampurhat','Saithia','Nalhati'],
    'Bankura': ['Bankura City','Bishnupur','Khatra','Onda','Indas'],
    'Medinipur': ['Midnapore City','Kharagpur','Jhargram','Panskura','Contai'],
  },
  'Bihar': {
    'Patna': ['Patna City','Danapur','Phulwari','Maner','Masaurhi'],
    'Gaya': ['Gaya City','Bodh Gaya','Sherghati','Imamganj','Belaganj'],
    'Muzaffarpur': ['Muzaffarpur City','Sitamarhi','Sheohar','Hajipur','Vaishali'],
    'Bhagalpur': ['Bhagalpur City','Banka','Kahalgaon','Sultanganj','Naugachia'],
    'Darbhanga': ['Darbhanga City','Madhubani','Samastipur','Begusarai','Lakhisarai'],
    'Arrah': ['Arrah City','Buxar','Jagdishpur','Dumraon','Brahmpur'],
    'Purnia': ['Purnia City','Katihar','Kishanganj','Araria','Supaul'],
    'Munger': ['Munger City','Jamui','Lakhisarai','Sheikhpura','Khagaria'],
    'Rohtas': ['Sasaram','Bikramganj','Nokha','Dinara','Kargahar'],
    'Aurangabad': ['Aurangabad City (Bihar)','Nabinagar','Rafiganj','Daudnagar'],
  },
  'Odisha': {
    'Bhubaneswar': ['Bhubaneswar City','Khordha','Puri','Nayagarh','Ganjam'],
    'Cuttack': ['Cuttack City','Jagatsinghpur','Kendrapara','Jajpur','Dhenkanal'],
    'Sambalpur': ['Sambalpur City','Bargarh','Jharsuguda','Sundergarh','Deogarh'],
    'Berhampur': ['Berhampur City','Chhatrapur','Polasara','Kukudakhandi'],
    'Rourkela': ['Rourkela City','Sundargarh','Bonai','Rajgangpur','Birmitrapur'],
    'Balasore': ['Balasore City','Bhadrak','Jaleswar','Soro','Nilagiri'],
    'Baripada': ['Baripada City','Mayurbhanj','Udala','Raruan','Rairangpur'],
    'Bolangir': ['Bolangir City','Titlagarh','Kantabanji','Patnagarh','Sonepur'],
    'Koraput': ['Koraput City','Jeypore','Malkangiri','Nabarangpur','Rayagada'],
    'Angul': ['Angul City','Athamallik','Talcher','Banarpal','Pallahara'],
  },
  'Kerala': {
    'Thiruvananthapuram': ['Thiruvananthapuram City','Neyyattinkara','Attingal','Varkala','Nedumangad'],
    'Kochi (Ernakulam)': ['Kochi City','Aluva','Thrippunithura','Perumbavoor','Muvattupuzha'],
    'Kozhikode': ['Kozhikode City','Vadakara','Koyilandy','Ramanattukara','Perambra'],
    'Thrissur': ['Thrissur City','Guruvayur','Irinjalakuda','Chalakudy','Kodungallur'],
    'Palakkad': ['Palakkad City','Ottappalam','Mannarghat','Chittoor','Alathur'],
    'Kollam': ['Kollam City','Punalur','Kottarakkara','Chavara','Karunagappally'],
    'Alappuzha': ['Alappuzha City','Cherthala','Mavelikkara','Kayamkulam','Haripad'],
    'Kottayam': ['Kottayam City','Changanacherry','Pala','Ettumanoor','Vaikom'],
    'Malappuram': ['Malappuram City','Tirur','Perinthalmanna','Manjeri','Ponnani'],
    'Kannur': ['Kannur City','Thalassery','Payyanur','Iritty','Kuthuparamba'],
  },
  'Haryana': {
    'Gurugram': ['Gurugram City','Faridabad','Sohna','Nuh','Pataudi'],
    'Ambala': ['Ambala City','Ambala Cantonment','Naraingarh','Barara','Mullana'],
    'Karnal': ['Karnal City','Panipat','Assandh','Indri','Nilokheri'],
    'Rohtak': ['Rohtak City','Jhajjar','Bahadurgarh','Bhiwani','Charkhi Dadri'],
    'Hisar': ['Hisar City','Sirsa','Fatehabad','Hansi','Adampur'],
    'Sonipat': ['Sonipat City','Gohana','Rai','Kharkhoda','Gannaur'],
    'Yamunanagar': ['Yamunanagar City','Jagadhri','Bilaspur','Sadhaura','Mustafabad'],
    'Kurukshetra': ['Thanesar','Pehowa','Ladwa','Shahabad','Ismailabad'],
    'Kaithal': ['Kaithal City','Guhla','Kalayat','Pundri','Cheeka'],
    'Jind': ['Jind City','Narwana','Safidon','Uchana','Alewa'],
  },
  'Assam': {
    'Guwahati': ['Guwahati City','Kamrup Metro','Dispur','Jalukbari','Azara'],
    'Silchar': ['Silchar City','Cachar','Sonai','Lakhipur','Hailakandi'],
    'Dibrugarh': ['Dibrugarh City','Tinsukia','Doom Dooma','Lahowal','Naharkatia'],
    'Jorhat': ['Jorhat City','Sibsagar','Golaghat','Teok','Mariani'],
    'Nagaon': ['Nagaon City','Morigaon','Hojai','Lumding','Batadrava'],
    'Tezpur': ['Tezpur City','Sonitpur','Biswanath','Gohpur','Bihali'],
    'Barpeta': ['Barpeta Town','Nalbari','Bongaigaon','Kokrajhar','Chirang'],
    'Dhubri': ['Dhubri City','Goalpara','Kamrup','Bilasipara','Gauripur'],
    'Karimganj': ['Karimganj City','Patharkandi','Nilambazar','Badarpur'],
    'Sivasagar': ['Sivasagar City','Nazira','Amguri','Sapekhati','Gaurisagar'],
  },
  'Jharkhand': {
    'Ranchi': ['Ranchi City','Hatia','Kanke','Ormanjhi','Bero'],
    'Dhanbad': ['Dhanbad City','Bokaro','Jharia','Sindri','Chas'],
    'Jamshedpur': ['Jamshedpur City','Chaibasa','Seraikela','Ghatsila','Baharagora'],
    'Hazaribagh': ['Hazaribagh City','Chatra','Giridih','Ramgarh','Koderma'],
    'Dumka': ['Dumka City','Sahibganj','Pakur','Deoghar','Jamtara'],
    'Gumla': ['Gumla City','Simdega','Lohardaga','Khunti','Torpa'],
    'Palamu': ['Daltonganj','Garhwa','Latehar','Medininagar','Bishrampur'],
    'Godda': ['Godda City','Mahagama','Boarijore','Sundarpahari'],
    'Chaibasa': ['Chaibasa City','Chakradharpur','Manoharpur','Jagannathpur'],
    'Khunti': ['Khunti City','Torpa','Murhu','Karra','Adki'],
  },
  'Chhattisgarh': {
    'Raipur': ['Raipur City','Arang','Abhanpur','Tilda','Simga'],
    'Bilaspur': ['Bilaspur City','Mungeli','Takhatpur','Masturi','Kota'],
    'Durg': ['Durg City','Bhilai','Rajnandgaon','Balod','Bemetara'],
    'Korba': ['Korba City','Katghora','Pali','Pendra','Marwahi'],
    'Jagdalpur': ['Jagdalpur City','Kondagaon','Narayanpur','Dantewada','Sukma'],
    'Raigarh': ['Raigarh City','Sarangarh','Gharghoda','Jashpur','Kunkuri'],
    'Ambikapur': ['Ambikapur City','Baikunthpur','Surajpur','Balrampur','Ramanujganj'],
    'Mahasamund': ['Mahasamund City','Basna','Saraipali','Pithaura','Bagbahara'],
    'Dhamtari': ['Dhamtari City','Nagri','Kurud','Magarlod','Sihawa'],
    'Kanker': ['Kanker City','Antagarh','Bhanupratappur','Charama','Narharpur'],
  },
  'Himachal Pradesh': {
    'Shimla': ['Shimla City','Rampur','Rohru','Chopal','Jubbal'],
    'Mandi': ['Mandi City','Sundernagar','Sarkaghat','Jogindernagar','Thunag'],
    'Kangra': ['Dharamshala','Palampur','Nurpur','Dehra','Nagrota Bagwan'],
    'Kullu': ['Kullu City','Manali','Banjar','Anni','Nirmand'],
    'Solan': ['Solan City','Kasauli','Arki','Nalagarh','Baddi'],
    'Una': ['Una City','Gagret','Bangana','Haroli','Amb'],
    'Hamirpur': ['Hamirpur City','Nadaun','Barsar','Sujanpur','Bhoranj'],
    'Bilaspur': ['Bilaspur City (HP)','Ghumarwin','Swarghat','Naina Devi'],
    'Chamba': ['Chamba City','Churah','Tissa','Pangi','Brahmaur'],
    'Kinnaur': ['Reckong Peo','Kalpa','Nichar','Pooh','Moorang'],
  },
  'Uttarakhand': {
    'Dehradun': ['Dehradun City','Rishikesh','Hardwar','Vikasnagar','Chakrata'],
    'Haridwar': ['Haridwar City','Roorkee','Laksar','Manglaur','Narsan'],
    'Nainital': ['Nainital City','Haldwani','Ramnagar','Lalkuan','Bhimtal'],
    'Udham Singh Nagar': ['Rudrapur','Kashipur','Sitarganj','Khatima','Jaspur'],
    'Almora': ['Almora City','Ranikhet','Dwarahat','Salt','Sult'],
    'Pauri Garhwal': ['Pauri City','Kotdwar','Srinagar (UK)','Lansdowne'],
    'Tehri Garhwal': ['Tehri City','Rishikesh','Chamba','Narendranagar'],
    'Chamoli': ['Gopeshwar','Karnaprayag','Joshimath','Pokhari'],
    'Pithoragarh': ['Pithoragarh City','Dharchula','Didihat','Gangolihat'],
    'Bageshwar': ['Bageshwar City','Kapkot','Garur','Kanda'],
  },
};

export const ALL_STATES = Object.keys(INDIA_LOCATIONS);

// ── 4. 18-MANDI DATABASE ─────────────────────────────────────────────────────
export const MANDI_DB = [
  { name:'Hyderabad', state:'Telangana', dist:0, flag:'🏙' },
  { name:'Warangal', state:'Telangana', dist:145, flag:'🌆' },
  { name:'Nizamabad', state:'Telangana', dist:170, flag:'🌄' },
  { name:'Khammam', state:'Telangana', dist:195, flag:'🌿' },
  { name:'Vijayawada', state:'Andhra Pradesh', dist:280, flag:'🌊' },
  { name:'Kurnool', state:'Andhra Pradesh', dist:215, flag:'🏔' },
  { name:'Guntur', state:'Andhra Pradesh', dist:310, flag:'🌶' },
  { name:'Bengaluru', state:'Karnataka', dist:570, flag:'🌟' },
  { name:'Mysuru', state:'Karnataka', dist:620, flag:'🏰' },
  { name:'Pune', state:'Maharashtra', dist:560, flag:'🌸' },
  { name:'Nashik', state:'Maharashtra', dist:620, flag:'🍇' },
  { name:'Nagpur', state:'Maharashtra', dist:500, flag:'🍊' },
  { name:'Delhi (Azadpur)', state:'Delhi', dist:1500, flag:'🏛' },
  { name:'Agra', state:'Uttar Pradesh', dist:1350, flag:'🕌' },
  { name:'Chennai', state:'Tamil Nadu', dist:630, flag:'🌞' },
  { name:'Ahmedabad', state:'Gujarat', dist:1100, flag:'🏗' },
  { name:'Amritsar', state:'Punjab', dist:1750, flag:'🌾' },
  { name:'Kolkata', state:'West Bengal', dist:1600, flag:'🎨' },
];

export const MANDI_MULTIPLIERS = {
  'Hyderabad':1.00,'Warangal':0.98,'Nizamabad':0.96,'Khammam':0.97,
  'Vijayawada':1.05,'Kurnool':0.99,'Guntur':1.08,'Bengaluru':1.25,'Mysuru':1.18,
  'Pune':1.20,'Nashik':1.15,'Nagpur':1.10,'Delhi (Azadpur)':1.30,'Agra':1.22,
  'Chennai':1.15,'Ahmedabad':1.12,'Amritsar':1.18,'Kolkata':1.20,
};

// ── 5. INTERNATIONAL PRICES ──────────────────────────────────────────────────
export const INTL_PRICES = {
  'Tomato':{ Dubai:85,Singapore:110,London:145,USA:130,Germany:160,Japan:200 },
  'Onion':{ Dubai:60,Singapore:90,London:120,USA:100,Germany:115,Japan:180 },
  'Potato':{ Dubai:45,Singapore:65,London:95,USA:85,Germany:88,Japan:140 },
  'Mango':{ Dubai:120,Singapore:180,London:240,USA:200,Germany:220,Japan:350 },
  'Banana':{ Dubai:55,Singapore:80,London:105,USA:95,Germany:90,Japan:160 },
  'Grapes (Green)':{ Dubai:140,Singapore:200,London:260,USA:220,Germany:240,Japan:400 },
  'Pomegranate':{ Dubai:160,Singapore:220,London:280,USA:250,Germany:260,Japan:420 },
  'Paddy (Rice)':{ Dubai:55,Singapore:75,London:90,USA:82,Germany:88,Japan:130 },
  'Wheat':{ Dubai:38,Singapore:50,London:65,USA:58,Germany:62,Japan:95 },
  'Turmeric (Haldi)':{ Dubai:180,Singapore:250,London:310,USA:280,Germany:300,Japan:450 },
  'Red Chilli (Dry)':{ Dubai:220,Singapore:310,London:380,USA:340,Germany:360,Japan:500 },
  'Black Pepper':{ Dubai:480,Singapore:620,London:750,USA:700,Germany:720,Japan:1000 },
  'Cardamom (Green)':{ Dubai:1800,Singapore:2200,London:2600,USA:2400,Germany:2500,Japan:3500 },
  'Almonds (Badam)':{ Dubai:850,Singapore:1100,London:1400,USA:1200,Germany:1350,Japan:1800 },
  'Cashews (Kaju)':{ Dubai:1100,Singapore:1400,London:1800,USA:1600,Germany:1700,Japan:2200 },
  'Saffron (Kesar)':{ Dubai:32000,Singapore:38000,London:45000,USA:42000,Germany:44000,Japan:55000 },
  'Groundnut (bold)':{ Dubai:95,Singapore:130,London:165,USA:148,Germany:155,Japan:220 },
  'Cotton (Long Staple)':{ Dubai:80,Singapore:95,London:110,USA:105,Germany:108,Japan:150 },
};

// ── 6. WEATHER DATA BY STATE ─────────────────────────────────────────────────
export const WEATHER_DATA = {
  'Telangana':{ temp:'32°C',humidity:'72%',rain:'65%',wind:'18 km/h',condition:'Partly Cloudy ⛅',advisory:'Heavy rain expected in next 24 hours. Avoid pesticide spraying.', forecast:[
    {day:'Mon',icon:'🌧',high:31,low:24},{day:'Tue',icon:'⛅',high:33,low:25},{day:'Wed',icon:'☀️',high:36,low:26},
    {day:'Thu',icon:'🌦',high:32,low:24},{day:'Fri',icon:'🌧',high:29,low:23},{day:'Sat',icon:'⛅',high:31,low:24},{day:'Sun',icon:'☀️',high:34,low:25}
  ]},
  'Andhra Pradesh':{ temp:'34°C',humidity:'68%',rain:'45%',wind:'22 km/h',condition:'Sunny ☀️',advisory:'Good weather for harvesting. Irrigation required in 2 days.',forecast:[
    {day:'Mon',icon:'☀️',high:35,low:26},{day:'Tue',icon:'☀️',high:36,low:27},{day:'Wed',icon:'⛅',high:34,low:25},
    {day:'Thu',icon:'🌦',high:31,low:24},{day:'Fri',icon:'☀️',high:33,low:25},{day:'Sat',icon:'☀️',high:35,low:26},{day:'Sun',icon:'⛅',high:33,low:25}
  ]},
  'Maharashtra':{ temp:'29°C',humidity:'75%',rain:'80%',wind:'15 km/h',condition:'Rainy 🌧',advisory:'Monsoon active. Ensure drainage in fields. Delay sowing for 3 days.',forecast:[
    {day:'Mon',icon:'🌧',high:28,low:22},{day:'Tue',icon:'🌧',high:27,low:21},{day:'Wed',icon:'🌦',high:30,low:23},
    {day:'Thu',icon:'⛅',high:31,low:23},{day:'Fri',icon:'🌧',high:28,low:22},{day:'Sat',icon:'🌧',high:27,low:21},{day:'Sun',icon:'🌦',high:29,low:22}
  ]},
  'Karnataka':{ temp:'27°C',humidity:'70%',rain:'55%',wind:'20 km/h',condition:'Overcast 🌥',advisory:'Mild rain expected. Good for transplanting seedlings.',forecast:[
    {day:'Mon',icon:'🌥',high:28,low:20},{day:'Tue',icon:'🌦',high:27,low:19},{day:'Wed',icon:'☀️',high:30,low:21},
    {day:'Thu',icon:'☀️',high:31,low:22},{day:'Fri',icon:'⛅',high:29,low:21},{day:'Sat',icon:'🌦',high:27,low:20},{day:'Sun',icon:'☀️',high:30,low:21}
  ]},
  'Tamil Nadu':{ temp:'35°C',humidity:'65%',rain:'30%',wind:'25 km/h',condition:'Hot & Sunny 🌞',advisory:'High temperature alert. Water crops in early morning or evening only.',forecast:[
    {day:'Mon',icon:'☀️',high:36,low:28},{day:'Tue',icon:'☀️',high:37,low:29},{day:'Wed',icon:'⛅',high:35,low:27},
    {day:'Thu',icon:'☀️',high:36,low:28},{day:'Fri',icon:'🌦',high:33,low:26},{day:'Sat',icon:'☀️',high:35,low:27},{day:'Sun',icon:'☀️',high:37,low:28}
  ]},
  'Punjab':{ temp:'38°C',humidity:'45%',rain:'10%',wind:'28 km/h',condition:'Dry & Hot 🌵',advisory:'Extreme heat warning. Irrigate heavily. Check soil moisture daily.',forecast:[
    {day:'Mon',icon:'☀️',high:40,low:28},{day:'Tue',icon:'☀️',high:41,low:29},{day:'Wed',icon:'⛅',high:38,low:27},
    {day:'Thu',icon:'☀️',high:39,low:28},{day:'Fri',icon:'☀️',high:40,low:28},{day:'Sat',icon:'⛅',high:37,low:26},{day:'Sun',icon:'☀️',high:39,low:27}
  ]},
  'Gujarat':{ temp:'36°C',humidity:'58%',rain:'25%',wind:'30 km/h',condition:'Partly Cloudy ⛅',advisory:'Strong winds. Secure shade nets. Good day for groundnut harvesting.',forecast:[
    {day:'Mon',icon:'⛅',high:37,low:27},{day:'Tue',icon:'☀️',high:38,low:28},{day:'Wed',icon:'🌦',high:34,low:26},
    {day:'Thu',icon:'⛅',high:36,low:27},{day:'Fri',icon:'☀️',high:38,low:28},{day:'Sat',icon:'⛅',high:36,low:26},{day:'Sun',icon:'☀️',high:37,low:27}
  ]},
  'Rajasthan':{ temp:'42°C',humidity:'30%',rain:'5%',wind:'35 km/h',condition:'Very Hot 🔥',advisory:'Extreme heat & dry winds. Minimize field work 11am–4pm. Mulch soil.',forecast:[
    {day:'Mon',icon:'🌵',high:43,low:30},{day:'Tue',icon:'☀️',high:44,low:31},{day:'Wed',icon:'☀️',high:42,low:30},
    {day:'Thu',icon:'⛅',high:40,low:29},{day:'Fri',icon:'☀️',high:43,low:31},{day:'Sat',icon:'☀️',high:44,low:31},{day:'Sun',icon:'⛅',high:41,low:30}
  ]},
  'Uttar Pradesh':{ temp:'35°C',humidity:'55%',rain:'35%',wind:'20 km/h',condition:'Partly Cloudy ⛅',advisory:'Pre-monsoon showers expected. Prepare fields for Kharif sowing.',forecast:[
    {day:'Mon',icon:'⛅',high:36,low:26},{day:'Tue',icon:'🌦',high:34,low:25},{day:'Wed',icon:'🌧',high:31,low:24},
    {day:'Thu',icon:'⛅',high:33,low:25},{day:'Fri',icon:'☀️',high:36,low:26},{day:'Sat',icon:'⛅',high:34,low:25},{day:'Sun',icon:'🌦',high:32,low:24}
  ]},
  'West Bengal':{ temp:'30°C',humidity:'82%',rain:'85%',wind:'18 km/h',condition:'Monsoon 🌧',advisory:'Heavy monsoon rain. Paddy fields well irrigated. Watch for pest outbreak.',forecast:[
    {day:'Mon',icon:'🌧',high:30,low:24},{day:'Tue',icon:'🌧',high:29,low:23},{day:'Wed',icon:'🌦',high:31,low:24},
    {day:'Thu',icon:'🌧',high:29,low:23},{day:'Fri',icon:'🌧',high:28,low:23},{day:'Sat',icon:'🌦',high:30,low:24},{day:'Sun',icon:'🌧',high:29,low:23}
  ]},
};

// ── 7. GOVERNMENT SCHEMES ────────────────────────────────────────────────────
export const GOVT_SCHEMES = [
  {
    name:'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    ministry:'Ministry of Agriculture & Farmers Welfare',
    benefit:'₹6,000/year in 3 equal installments of ₹2,000 directly to bank account',
    eligibility:'All small & marginal farmers with cultivable land. Must have valid Aadhaar & bank account.',
    maxLand:'Unlimited (all landholding farmers)',
    category:'Income Support',
    badge:'₹6,000/yr',color:'#22c55e',
    apply:'pmkisan.gov.in',
    docs:['Aadhaar Card','Land Records (Khasra/Khatauni)','Bank Account Passbook','Mobile Number']
  },
  {
    name:'PM Fasal Bima Yojana (PMFBY)',
    ministry:'Ministry of Agriculture',
    benefit:'Crop insurance covering yield losses due to natural calamities, pests & diseases',
    eligibility:'All farmers growing notified crops. Premium: 2% for Kharif, 1.5% for Rabi, 5% for commercial crops.',
    maxLand:'All landholdings',
    category:'Insurance',
    badge:'2% Premium',color:'#3b82f6',
    apply:'pmfby.gov.in',
    docs:['Land Records','Bank Account','Aadhaar','Crop Sowing Certificate']
  },
  {
    name:'PM Krishi Sinchai Yojana (PMKSY)',
    ministry:'Ministry of Jal Shakti',
    benefit:'Subsidy on micro-irrigation (drip & sprinkler systems) — up to 80% for small/marginal farmers',
    eligibility:'Small farmers (< 2 ha) get 80% subsidy; others get 55% subsidy',
    maxLand:'5 acres for max subsidy',
    category:'Irrigation',
    badge:'80% Subsidy',color:'#06b6d4',
    apply:'pmksy.gov.in',
    docs:['Land Records','Bank Account','Quotation from authorized vendor','Photo']
  },
  {
    name:'Soil Health Card Scheme',
    ministry:'Ministry of Agriculture',
    benefit:'Free soil testing + printed Soil Health Card with fertilizer recommendations every 2 years',
    eligibility:'All farmers. Testing done at government soil testing labs free of cost.',
    maxLand:'All',
    category:'Soil Health',
    badge:'Free Testing',color:'#a78bfa',
    apply:'soilhealth.dac.gov.in',
    docs:['Aadhaar','Land Details','Mobile Number']
  },
  {
    name:'Kisan Credit Card (KCC)',
    ministry:'Ministry of Finance / NABARD',
    benefit:'Short-term crop loans at 4% interest rate (2% additional subvention for timely repayment). Limit up to ₹3 lakh.',
    eligibility:'All farmers, tenant farmers, sharecroppers, SHGs',
    maxLand:'All',
    category:'Credit & Finance',
    badge:'4% Interest',color:'#f59e0b',
    apply:'Your nearest Bank / PM Kisan Portal',
    docs:['Aadhaar','Land Records','Passport Photo','Income Certificate']
  },
  {
    name:'National Agriculture Market (eNAM)',
    ministry:'Ministry of Agriculture',
    benefit:'Online platform to sell produce directly in mandis across India. Better price discovery & transparent auction.',
    eligibility:'All farmers with produce to sell. Register at eNAM portal or through nearest FPO.',
    maxLand:'All',
    category:'Market Access',
    badge:'Online Mandi',color:'#10b981',
    apply:'enam.gov.in',
    docs:['Aadhaar','Bank Account','Mobile Number','APMC registration']
  },
  {
    name:'Sub-Mission on Agricultural Mechanization (SMAM)',
    ministry:'Ministry of Agriculture',
    benefit:'Subsidy on tractors, power tillers, harvesters, threshers — 40–50% subsidy for general, 50–80% for SC/ST/Small farmers',
    eligibility:'All farmers; priority to SC/ST/women farmers & small/marginal farmers',
    maxLand:'All',
    category:'Farm Machinery',
    badge:'50% Subsidy',color:'#f97316',
    apply:'agrimachinery.nic.in',
    docs:['Aadhaar','Land Records','Caste Certificate (if SC/ST)','Bank Account']
  },
  {
    name:'Paramparagat Krishi Vikas Yojana (PKVY)',
    ministry:'Ministry of Agriculture',
    benefit:'₹50,000/hectare over 3 years for organic farming. Includes training, certification & market linkage.',
    eligibility:'Farmers willing to adopt organic farming in clusters of 50 acres minimum',
    maxLand:'Min cluster 50 acres',
    category:'Organic Farming',
    badge:'₹50K/ha',color:'#84cc16',
    apply:'pgsindia.net',
    docs:['Aadhaar','Land Records','Willingness Certificate','Group Formation']
  },
  {
    name:'Rashtriya Krishi Vikas Yojana (RKVY)',
    ministry:'Ministry of Agriculture',
    benefit:'₹25,000 crore annually for agricultural infrastructure — cold storage, processing, market yards',
    eligibility:'Individual farmers via State Agriculture Departments; FPOs get priority',
    maxLand:'All',
    category:'Infrastructure',
    badge:'State Funded',color:'#ec4899',
    apply:'rkvy.nic.in',
    docs:['Aadhaar','Land Records','Project Proposal','Bank Account']
  },
  {
    name:'Agriculture Infrastructure Fund (AIF)',
    ministry:'Ministry of Agriculture',
    benefit:'₹1 lakh crore fund for post-harvest infrastructure — credit-linked subsidy 3% on interest',
    eligibility:'Farmers, FPOs, Agri-Entrepreneurs, SHGs, PACS',
    maxLand:'All',
    category:'Infrastructure',
    badge:'3% Int. Sub.',color:'#8b5cf6',
    apply:'agriinfra.dac.gov.in',
    docs:['Aadhaar','Business Plan','Land/Lease Docs','Bank Statement']
  },
  {
    name:'Pradhan Mantri Annadata Aay SanraksHan Abhiyan (PM-AASHA)',
    ministry:'Ministry of Agriculture',
    benefit:'MSP protection for pulses, oilseeds & copra. Price Deficiency Payment if market price < MSP.',
    eligibility:'All registered farmers growing notified crops',
    maxLand:'Up to 25% of production',
    category:'Price Support',
    badge:'MSP Protected',color:'#14b8a6',
    apply:'State Agriculture Dept.',
    docs:['Aadhaar','Land Records','Bank Account','Crop Registration']
  },
  {
    name:'National Food Security Mission (NFSM)',
    ministry:'Ministry of Agriculture',
    benefit:'Free certified seeds, demonstrations, farm machinery, training for rice, wheat, pulses, coarse cereals & commercial crops',
    eligibility:'Farmers in designated NFSM districts across India',
    maxLand:'All',
    category:'Seed & Input',
    badge:'Free Seeds',color:'#f43f5e',
    apply:'nfsm.gov.in',
    docs:['Aadhaar','Land Records','Mobile Number']
  },
  {
    name:'Integrated Scheme for Agricultural Marketing (ISAM)',
    ministry:'Ministry of Agriculture',
    benefit:'Grants for construction/upgradation of rural haats, primary processing centres & market infrastructure',
    eligibility:'State Govts, cooperatives, FPOs, PRIs',
    maxLand:'N/A',
    category:'Market Infrastructure',
    badge:'Infrastructure',color:'#0ea5e9',
    apply:'State Agri Dept.',
    docs:['DPR','Land Documents','NOC','Bank Account']
  },
  {
    name:'Micro Irrigation Fund (MIF)',
    ministry:'NABARD',
    benefit:'₹5,000 crore fund for states to expand micro-irrigation coverage beyond PMKSY limits',
    eligibility:'State Government projects for farmer benefit',
    maxLand:'All',
    category:'Irrigation',
    badge:'NABARD Fund',color:'#06b6d4',
    apply:'nabard.org',
    docs:['State Government Application','DPR']
  },
  {
    name:'PM Matsya Sampada Yojana',
    ministry:'Ministry of Fisheries',
    benefit:'₹20,050 crore for fisheries sector. Subsidy on fish farming, boats, cold chains, processing.',
    eligibility:'Fishermen, fish farmers, SHGs, FPOs',
    maxLand:'N/A (water body)',
    category:'Fisheries',
    badge:'₹20,050 Cr',color:'#3b82f6',
    apply:'pmmsy.dof.gov.in',
    docs:['Aadhaar','Land/Pond Docs','Bank Account','Caste Certificate if SC/ST']
  },
  {
    name:'National Beekeeping & Honey Mission (NBHM)',
    ministry:'Ministry of Agriculture',
    benefit:'Subsidy on beehives, equipment, training. 60–80% subsidy for bee boxes, hives & extraction units',
    eligibility:'All farmers & entrepreneurs. SC/ST/Women get higher subsidy.',
    maxLand:'All',
    category:'Allied Sector',
    badge:'80% Subsidy',color:'#fbbf24',
    apply:'State Horticulture Dept.',
    docs:['Aadhaar','Land Records','Bank Account','Training Certificate']
  },
];

// ── 8. MCX / COMMODITY STOCK PRICES ─────────────────────────────────────────
export const MCX_COMMODITIES = [
  { symbol:'GOLD',name:'Gold (10g)',price:72450,change:+280,pct:+0.39,unit:'₹/10g',trend:'up' },
  { symbol:'SILVER',name:'Silver (1kg)',price:87200,change:-320,pct:-0.37,unit:'₹/kg',trend:'down' },
  { symbol:'CRUDEOIL',name:'Crude Oil',price:6820,change:+95,pct:+1.41,unit:'₹/bbl',trend:'up' },
  { symbol:'NATURALGAS',name:'Natural Gas',price:245,change:-8,pct:-3.16,unit:'₹/mmBtu',trend:'down' },
  { symbol:'COTTON',name:'Cotton (170kg)',price:28500,change:+150,pct:+0.53,unit:'₹/bale',trend:'up' },
  { symbol:'CORIANDER',name:'Coriander',price:5520,change:-180,pct:-3.15,unit:'₹/qtl',trend:'down' },
  { symbol:'JEERA',name:'Cumin (Jeera)',price:24800,change:+420,pct:+1.72,unit:'₹/qtl',trend:'up' },
  { symbol:'TURMERIC',name:'Turmeric',price:8850,change:+210,pct:+2.43,unit:'₹/qtl',trend:'up' },
  { symbol:'PEPPER',name:'Black Pepper',price:47200,change:-650,pct:-1.36,unit:'₹/qtl',trend:'down' },
  { symbol:'CARDAMOM',name:'Cardamom',price:175000,change:+2200,pct:+1.27,unit:'₹/qtl',trend:'up' },
  { symbol:'MENTHAOIL',name:'Mentha Oil',price:945,change:+12,pct:+1.29,unit:'₹/kg',trend:'up' },
  { symbol:'MUSTARD',name:'Mustard Seed',price:5350,change:-45,pct:-0.83,unit:'₹/qtl',trend:'down' },
  { symbol:'SOYBEAN',name:'Soybean',price:4420,change:+55,pct:+1.26,unit:'₹/qtl',trend:'up' },
  { symbol:'CASTOR',name:'Castor Seed',price:5890,change:+80,pct:+1.38,unit:'₹/qtl',trend:'up' },
  { symbol:'WHEAT',name:'Wheat',price:2380,change:-20,pct:-0.83,unit:'₹/qtl',trend:'down' },
  { symbol:'MAIZE',name:'Maize',price:1820,change:+35,pct:+1.96,unit:'₹/qtl',trend:'up' },
  { symbol:'SUGARCANE',name:'Sugarcane (FRP)',price:3150,change:0,pct:0,unit:'₹/tonne',trend:'flat' },
  { symbol:'GROUNDNUT',name:'Groundnut Oil',price:10200,change:+180,pct:+1.80,unit:'₹/qtl',trend:'up' },
  { symbol:'RUBBER',name:'Rubber (RSS4)',price:19500,change:-250,pct:-1.27,unit:'₹/qtl',trend:'down' },
  { symbol:'CHILLI',name:'Red Chilli',price:11800,change:+350,pct:+3.06,unit:'₹/qtl',trend:'up' },
];

// ── 9. STATE INPUT PRICE MULTIPLIERS ─────────────────────────────────────────
export const INPUT_STATE_MULTIPLIER = {
  'Telangana':1.00,'Andhra Pradesh':0.98,'Maharashtra':1.08,'Karnataka':1.05,
  'Tamil Nadu':1.06,'Gujarat':1.10,'Madhya Pradesh':0.95,'Rajasthan':0.97,
  'Punjab':1.02,'Haryana':1.04,'Uttar Pradesh':0.94,'Bihar':0.92,
  'Odisha':0.90,'West Bengal':0.96,'Kerala':1.15,'Assam':0.93,
  'Jharkhand':0.91,'Chhattisgarh':0.89,'Himachal Pradesh':1.12,'Uttarakhand':1.08,
};

// ── 10. ELIGIBILITY CRITERIA ─────────────────────────────────────────────────
export const SCHEME_ELIGIBILITY_RULES = (land, state, category, aadhaar, bankAcc, casteCertificate) => {
  const results = [];
  const smallFarmer = land <= 2;
  const allFarmer = land > 0;

  if (allFarmer && aadhaar && bankAcc) results.push('PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)');
  if (allFarmer && aadhaar) results.push('PM Fasal Bima Yojana (PMFBY)');
  if (allFarmer) results.push('Soil Health Card Scheme');
  if (allFarmer && bankAcc) results.push('Kisan Credit Card (KCC)');
  if (allFarmer && aadhaar && bankAcc) results.push('National Agriculture Market (eNAM)');
  if (smallFarmer) results.push('PM Krishi Sinchai Yojana (PMKSY) — 80% subsidy');
  if (!smallFarmer && allFarmer) results.push('PM Krishi Sinchai Yojana (PMKSY) — 55% subsidy');
  if (allFarmer) results.push('National Food Security Mission (NFSM)');
  if (allFarmer && aadhaar) results.push('Sub-Mission on Agricultural Mechanization (SMAM)');
  if (land >= 2) results.push('Paramparagat Krishi Vikas Yojana (PKVY) — Organic Farming');
  if (allFarmer && aadhaar && bankAcc) results.push('PM-AASHA — MSP Price Protection');
  if (allFarmer && aadhaar) results.push('National Beekeeping & Honey Mission (NBHM)');
  if (category === 'fisheries') results.push('PM Matsya Sampada Yojana');
  if (casteCertificate) results.push('SMAM Extra 80% Subsidy (SC/ST/Women Farmers)');

  return results;
};

// ── 11. BASE FUEL PRICES ──────────────────────────────────────────────────
export const FUEL_BASE_PRICES = {
  'PETROL': 96.50,
  'DIESEL': 89.20
};
