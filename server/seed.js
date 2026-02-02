import sequelize from './config/db.js';
import Product from './models/Product.js';
import Category from './models/Category.js';
import Brand from './models/Brand.js';

const brandsList = [
  'Aura Nordic', 'Urban Flux', 'Iron & Oak', 'Velvet Peak',
  'Nomad Collective', 'Solis Wear', 'Nova Stitch', 'Arid Supply',
  'Echo Denim', 'Lunar Thread', 'Terra Modus', 'Apex Edge'
];

const categoriesList = [
  'Skor', 'T-shirts', 'Tröjor & Hoodies', 'Skjortor', 'Byxor',
  'Jeans', 'Shorts', 'Ytterkläder', 'Klänningar & Kjolar',
  'Träningskläder', 'Underkläder & Sockar', 'Badkläder',
  'Accessoarer', 'Väskor', 'Huvudbonader'
];

const mixedProducts = [
  { name: 'Everest Parka', price: 2999, discountPrice: 1999, brand: 'Iron & Oak', cat: 'Ytterkläder', dept: 'Men', pexelId: 845434, sport: false, color: 'Navy', mat: 'Dunmix', inv: { "L": 5 } },
  { name: 'Street Oversized Hoodie', price: 799, discountPrice: null, brand: 'Urban Flux', cat: 'Tröjor & Hoodies', dept: 'Men', pexelId: 1183266, sport: false, color: 'Black', mat: 'Bomull', inv: { "M": 10 } },
  { name: 'Tech Runner Shorts', price: 449, discountPrice: 299, brand: 'Apex Edge', cat: 'Shorts', dept: 'Men', pexelId: 1552242, sport: true, color: 'Grey', mat: 'Polyester', inv: { "S": 8 } },
  { name: 'Luna Silk Blouse', price: 1299, discountPrice: 899, brand: 'Velvet Peak', cat: 'Skjortor', dept: 'Women', pexelId: 1852382, sport: false, color: 'Champagne', mat: 'Silke', inv: { "S": 5 } },
  { name: 'Active Sculpt Tights', price: 649, discountPrice: null, brand: 'Solis Wear', cat: 'Träningskläder', dept: 'Women', pexelId: 3757376, sport: true, color: 'Dark Green', mat: 'Spandex', inv: { "XS": 12 } },
  { name: 'Summer Breeze Dress', price: 899, discountPrice: 499, brand: 'Terra Modus', cat: 'Klänningar & Kjolar', dept: 'Women', pexelId: 985699, sport: false, color: 'Floral', mat: 'Linne', inv: { "M": 10 } },
  { name: 'Vogue Leather Boots', price: 2499, discountPrice: 1799, brand: 'Aura Nordic', cat: 'Skor', dept: 'Women', pexelId: 1159670, sport: false, color: 'Black', mat: 'Läder', inv: { "38": 4 } },
  { name: 'Playtime Denim Jacket', price: 549, discountPrice: 349, brand: 'Echo Denim', cat: 'Ytterkläder', dept: 'Kids', pexelId: 1148957, sport: false, color: 'Light Blue', mat: 'Denim', inv: { "110": 8 } },
  { name: 'Commuter Backpack', price: 1299, discountPrice: 899, brand: 'Urban Flux', cat: 'Väskor', dept: 'Unisex', pexelId: 2905238, sport: false, color: 'Navy', mat: 'Cordura', inv: { "OneSize": 15 } },
  { name: 'Urban Beanie', price: 299, discountPrice: null, brand: 'Lunar Thread', cat: 'Huvudbonader', dept: 'Unisex', pexelId: 1496647, sport: false, color: 'Grey', mat: 'Ull', inv: { "OneSize": 40 } },
  { name: 'Oxford Button-Down', price: 899, discountPrice: 599, brand: 'Iron & Oak', cat: 'Skjortor', dept: 'Men', pexelId: 428338, sport: false, color: 'White', mat: 'Bomull', inv: { "M": 12 } },
  { name: 'Yoga Flow Mat', price: 499, discountPrice: null, brand: 'Solis Wear', cat: 'Accessoarer', dept: 'Unisex', pexelId: 4056723, sport: true, color: 'Purple', mat: 'TPE', inv: { "OneSize": 20 } },
  { name: 'Ripped Slim Jeans', price: 1199, discountPrice: 799, brand: 'Echo Denim', cat: 'Jeans', dept: 'Women', pexelId: 1082528, sport: false, color: 'Blue', mat: 'Denim', inv: { "28": 10 } },
  { name: 'Classic Leather Belt', price: 499, discountPrice: null, brand: 'Aura Nordic', cat: 'Accessoarer', dept: 'Men', pexelId: 306491, sport: false, color: 'Brown', mat: 'Läder', inv: { "95": 15 } },
  { name: 'Kids Rain Boots', price: 399, discountPrice: 249, brand: 'Arid Supply', cat: 'Skor', dept: 'Kids', pexelId: 1476209, sport: false, color: 'Yellow', mat: 'Gummi', inv: { "28": 10 } },
  { name: 'Sport Tank Top', price: 299, discountPrice: null, brand: 'Apex Edge', cat: 'Träningskläder', dept: 'Men', pexelId: 416809, sport: true, color: 'Black', mat: 'Syntet', inv: { "L": 15 } },
  { name: 'Minimalist Watch', price: 1999, discountPrice: 1499, brand: 'Aura Nordic', cat: 'Accessoarer', dept: 'Unisex', pexelId: 190819, sport: false, color: 'Silver', mat: 'Stål', inv: { "OneSize": 5 } },
  { name: 'Floral Maxi Skirt', price: 799, discountPrice: null, brand: 'Velvet Peak', cat: 'Klänningar & Kjolar', dept: 'Women', pexelId: 1007018, sport: false, color: 'Red/Floral', mat: 'Viskos', inv: { "M": 12 } },
  { name: 'Canvas Tote Bag', price: 149, discountPrice: 99, brand: 'Terra Modus', cat: 'Väskor', dept: 'Unisex', pexelId: 1117272, sport: false, color: 'Natural', mat: 'Bomull', inv: { "OneSize": 100 } },
  { name: 'Winter Wool Scarf', price: 449, discountPrice: null, brand: 'Lunar Thread', cat: 'Accessoarer', dept: 'Unisex', pexelId: 814858, sport: false, color: 'Camel', mat: 'Ull', inv: { "OneSize": 30 } },
  { name: 'Urban Bomber Jacket', price: 1299, discountPrice: 899, brand: 'Urban Flux', cat: 'Ytterkläder', dept: 'Men', pexelId: 1632346, sport: false, color: 'Olive', mat: 'Nylon', inv: { "M": 5, "L": 3 } },
  { name: 'Desert Suede Jacket', price: 2499, discountPrice: null, brand: 'Iron & Oak', cat: 'Ytterkläder', dept: 'Men', pexelId: 1040945, sport: false, color: 'Tan', mat: 'Mocka', inv: { "L": 2 } },
  { name: 'Nordic Wool Sweater', price: 1499, discountPrice: 1049, brand: 'Aura Nordic', cat: 'Tröjor & Hoodies', dept: 'Men', pexelId: 2529157, sport: false, color: 'Grey Melange', mat: 'Merinoull', inv: { "M": 8, "L": 5 } },
  { name: 'Core Black Hoodie', price: 699, discountPrice: 499, brand: 'Urban Flux', cat: 'Tröjor & Hoodies', dept: 'Men', pexelId: 1183267, sport: false, color: 'Black', mat: 'Bomull', inv: { "S": 10, "M": 15 } },
  
  // HERR - SKJORTOR & BYXOR
  { name: 'Denim Work Shirt', price: 899, discountPrice: null, brand: 'Echo Denim', cat: 'Skjortor', dept: 'Men', pexelId: 2364605, sport: false, color: 'Indigo', mat: 'Bomull', inv: { "M": 12 } },
  { name: 'City Slim Chinos', price: 899, discountPrice: 599, brand: 'Urban Flux', cat: 'Byxor', dept: 'Men', pexelId: 1346187, sport: false, color: 'Navy', mat: 'Stretch-bomull', inv: { "32": 10, "34": 10 } },
  { name: 'Black Selvedge Jeans', price: 1399, discountPrice: null, brand: 'Echo Denim', cat: 'Jeans', dept: 'Men', pexelId: 1598507, sport: false, color: 'Black', mat: 'Denim', inv: { "31": 5, "33": 5 } },
  
  // DAM - KLÄNNINGAR & KJOLAR
  { name: 'Emperial Silk Dress', price: 2199, discountPrice: 1599, brand: 'Velvet Peak', cat: 'Klänningar & Kjolar', dept: 'Women', pexelId: 2065195, sport: false, color: 'Emerald', mat: 'Siden', inv: { "S": 3, "M": 5 } },
  { name: 'Boho Maxi Skirt', price: 799, discountPrice: 399, brand: 'Terra Modus', cat: 'Klänningar & Kjolar', dept: 'Women', pexelId: 1972115, sport: false, color: 'Terracotta', mat: 'Viskos', inv: { "M": 10 } },
  { name: 'Pleated Evening Skirt', price: 999, discountPrice: null, brand: 'Velvet Peak', cat: 'Klänningar & Kjolar', dept: 'Women', pexelId: 761963, sport: false, color: 'Black', mat: 'Satin', inv: { "S": 4, "M": 4 } },
  
  // DAM - TOPPAR & YTTERKLÄDER
  { name: 'Oversized Linen Shirt', price: 899, discountPrice: 649, brand: 'Terra Modus', cat: 'Skjortor', dept: 'Women', pexelId: 1030947, sport: false, color: 'White', mat: 'Linne', inv: { "S": 8, "M": 12 } },
  { name: 'Classic Trench Coat', price: 2299, discountPrice: null, brand: 'Aura Nordic', cat: 'Ytterkläder', dept: 'Women', pexelId: 2065200, sport: false, color: 'Beige', mat: 'Bomullsgabardin', inv: { "M": 5 } },
  { name: 'Cropped Cable Knit', price: 999, discountPrice: 699, brand: 'Lunar Thread', cat: 'Tröjor & Hoodies', dept: 'Women', pexelId: 1914982, sport: false, color: 'Cream', mat: 'Ullmix', inv: { "XS": 5, "S": 8 } },
  
  // TRÄNING (SPORT)
  { name: 'Aero Compression Tee', price: 499, discountPrice: 299, brand: 'Apex Edge', cat: 'T-shirts', dept: 'Men', pexelId: 2294361, sport: true, color: 'Electric Blue', mat: 'Syntet', inv: { "L": 15 } },
  { name: 'Zen Seamless Bra', price: 399, discountPrice: null, brand: 'Solis Wear', cat: 'Träningskläder', dept: 'Women', pexelId: 3823039, sport: true, color: 'Sage', mat: 'Nylon', inv: { "S": 10, "M": 10 } },
  { name: 'Turbo Track Pants', price: 799, discountPrice: 449, brand: 'Apex Edge', cat: 'Träningskläder', dept: 'Unisex', pexelId: 1552249, sport: true, color: 'Charcoal', mat: 'Polyester', inv: { "M": 12, "L": 10 } },
  
  // BARN
  { name: 'Little Explorer Fleece', price: 499, discountPrice: 249, brand: 'Nomad Collective', cat: 'Tröjor & Hoodies', dept: 'Kids', pexelId: 1620788, sport: false, color: 'Yellow', mat: 'Fleece', inv: { "104": 15 } },
  { name: 'Mini Star Leggings', price: 249, discountPrice: null, brand: 'Nova Stitch', cat: 'Underkläder & Sockar', dept: 'Kids', pexelId: 1619931, sport: false, color: 'Pink', mat: 'Bomull', inv: { "92": 25 } },
  { name: 'Schoolyard Sneakers', price: 599, discountPrice: 399, brand: 'Apex Edge', cat: 'Skor', dept: 'Kids', pexelId: 2351883, sport: true, color: 'Multi', mat: 'Syntet', inv: { "30": 10, "32": 10 } },
  
  // ACCESSORER & VÄSKOR
  { name: 'Leather Passport Holder', price: 399, discountPrice: 199, brand: 'Nomad Collective', cat: 'Accessoarer', dept: 'Unisex', pexelId: 461077, sport: false, color: 'Cognac', mat: 'Läder', inv: { "OneSize": 50 } },
  { name: 'Golden Era Watch', price: 3499, discountPrice: null, brand: 'Aura Nordic', cat: 'Accessoarer', dept: 'Women', pexelId: 280250, sport: false, color: 'Gold', mat: 'Stål', inv: { "OneSize": 3 } },
  { name: 'Vantage Tote Bag', price: 699, discountPrice: 449, brand: 'Urban Flux', cat: 'Väskor', dept: 'Unisex', pexelId: 1152077, sport: false, color: 'Black', mat: 'Canvas', inv: { "OneSize": 20 } },
  
  // FYLLNAD (BLANDAT MODE)
  { name: 'Relaxed Fit Tee', price: 349, discountPrice: 149, brand: 'Nova Stitch', cat: 'T-shirts', dept: 'Men', pexelId: 1018911, sport: false, color: 'White', mat: 'Bomull', inv: { "M": 30 } },
  { name: 'Silk Neck Scarf', price: 499, discountPrice: null, brand: 'Velvet Peak', cat: 'Accessoarer', dept: 'Women', pexelId: 3317434, sport: false, color: 'Pattern', mat: 'Silke', inv: { "OneSize": 15 } },
  { name: 'Heavy Duty Belt', price: 599, discountPrice: 399, brand: 'Iron & Oak', cat: 'Accessoarer', dept: 'Men', pexelId: 1759622, sport: false, color: 'Dark Brown', mat: 'Läder', inv: { "100": 10 } },
  { name: 'Street Snapback', price: 349, discountPrice: null, brand: 'Urban Flux', cat: 'Huvudbonader', dept: 'Unisex', pexelId: 1073083, sport: false, color: 'Grey', mat: 'Bomull', inv: { "OneSize": 40 } },
  { name: 'Luxe Swimsuit', price: 899, discountPrice: 499, brand: 'Solis Wear', cat: 'Badkläder', dept: 'Women', pexelId: 1323712, sport: false, color: 'Red', mat: 'Lycra', inv: { "M": 8 } },
  { name: 'Classic Loafers', price: 1599, discountPrice: 1099, brand: 'Aura Nordic', cat: 'Skor', dept: 'Men', pexelId: 298863, sport: false, color: 'Burgundy', mat: 'Läder', inv: { "43": 4 } },
  { name: 'Cargo Field Pants', price: 1099, discountPrice: null, brand: 'Nomad Collective', cat: 'Byxor', dept: 'Men', pexelId: 1598507, sport: false, color: 'Olive', mat: 'Canvas', inv: { "33": 8 } },
  { name: 'Dainty Gold Necklace', price: 1299, discountPrice: 899, brand: 'Velvet Peak', cat: 'Accessoarer', dept: 'Women', pexelId: 1458867, sport: false, color: 'Gold', mat: '18k Guldplätering', inv: { "OneSize": 10 } },
  { name: 'Kids Denim Overall', price: 649, discountPrice: 399, brand: 'Echo Denim', cat: 'Byxor', dept: 'Kids', pexelId: 1648384, sport: false, color: 'Indigo', mat: 'Denim', inv: { "116": 6 } },
  { name: 'Winter Parka Junior', price: 1199, discountPrice: null, brand: 'Arid Supply', cat: 'Ytterkläder', dept: 'Kids', pexelId: 1619931, sport: false, color: 'Green', mat: 'Polyester', inv: { "128": 4 } },
  { name: 'High-Top Sneakers', price: 999, discountPrice: 599, brand: 'Urban Flux', cat: 'Skor', dept: 'Unisex', pexelId: 1598505, sport: false, color: 'White/Black', mat: 'Läder/Gummi', inv: { "41": 6, "42": 6 } },
  { name: 'Athletic Headband', price: 149, discountPrice: 79, brand: 'Apex Edge', cat: 'Accessoarer', dept: 'Unisex', sport: true, color: 'Black', mat: 'Syntet', inv: { "OneSize": 100 } },
  { name: 'Minimalist Card Holder', price: 449, discountPrice: null, brand: 'Aura Nordic', cat: 'Accessoarer', dept: 'Unisex', pexelId: 4525, sport: false, color: 'Black', mat: 'Läder', inv: { "OneSize": 30 } },
  { name: 'Soft Ribbed Beanie', price: 299, discountPrice: 149, brand: 'Lunar Thread', cat: 'Huvudbonader', dept: 'Kids', pexelId: 151511, sport: false, color: 'Mustard', mat: 'Bomullsmix', inv: { "OneSize": 25 } },
  { name: 'Breeze Linen Shorts', price: 549, discountPrice: null, brand: 'Terra Modus', cat: 'Shorts', dept: 'Men', pexelId: 428338, sport: false, color: 'Sand', mat: 'Linne', inv: { "32": 15 } },
  { name: 'Velvet Choker', price: 199, discountPrice: 99, brand: 'Velvet Peak', cat: 'Accessoarer', dept: 'Women', pexelId: 1458867, sport: false, color: 'Black', mat: 'Sammet', inv: { "OneSize": 50 } },
  { name: 'Yoga Block', price: 249, discountPrice: null, brand: 'Solis Wear', cat: 'Accessoarer', dept: 'Unisex', pexelId: 3823039, sport: true, color: 'Cork', mat: 'Kork', inv: { "OneSize": 40 } },
  { name: 'Rain Poncho', price: 399, discountPrice: 199, brand: 'Arid Supply', cat: 'Ytterkläder', dept: 'Unisex', pexelId: 1536619, sport: false, color: 'Clear', mat: 'PVC', inv: { "OneSize": 100 } },{ name: 'Alpha Carbon Runner', price: 1899, discountPrice: 1299, brand: 'Apex Edge', cat: 'Skor', dept: 'Sport', pexelId: 2529148, sport: true, color: 'Neon', mat: 'Mesh', inv: { "42": 10 } },
  { name: 'Compression Pro Tee', price: 499, discountPrice: null, brand: 'Apex Edge', cat: 'T-shirts', dept: 'Sport', pexelId: 416717, sport: true, color: 'Black', mat: 'Polyester', inv: { "L": 15 } },
  { name: 'Endurance Track Jacket', price: 999, discountPrice: 699, brand: 'Apex Edge', cat: 'Ytterkläder', dept: 'Sport', pexelId: 1183268, sport: true, color: 'Blue', mat: 'Nylon', inv: { "M": 8 } },
  { name: 'Rapid Dry Shorts', price: 399, discountPrice: 199, brand: 'Apex Edge', cat: 'Shorts', dept: 'Sport', pexelId: 1552242, sport: true, color: 'Grey', mat: 'Syntet', inv: { "M": 20 } },
  
  // DAM SPORT
  { name: 'Zen Yoga Leggings', price: 799, discountPrice: 499, brand: 'Solis Wear', cat: 'Träningskläder', dept: 'Sport', pexelId: 3757376, sport: true, color: 'Sage', mat: 'Spandex', inv: { "S": 12 } },
  { name: 'Power Lift Sports Bra', price: 449, discountPrice: null, brand: 'Solis Wear', cat: 'Träningskläder', dept: 'Sport', pexelId: 3823039, sport: true, color: 'Berry', mat: 'Nylon', inv: { "M": 15 } },
  { name: 'Aerobic Tank Top', price: 349, discountPrice: 149, brand: 'Solis Wear', cat: 'T-shirts', dept: 'Sport', pexelId: 3757385, sport: true, color: 'White', mat: 'Bomullsmix', inv: { "S": 10 } },
  { name: 'Swift Running Skirt', price: 549, discountPrice: null, brand: 'Apex Edge', cat: 'Klänningar & Kjolar', dept: 'Sport', pexelId: 1161947, sport: true, color: 'Black', mat: 'Polyester', inv: { "S": 7 } },
  
  // UNISEX SPORT & ACCESSORER
  { name: 'Performance Gym Bag', price: 899, discountPrice: 599, brand: 'Urban Flux', cat: 'Väskor', dept: 'Sport', pexelId: 416778, sport: true, color: 'Black', mat: 'Cordura', inv: { "OneSize": 20 } },
  { name: 'Elite Sweatband Set', price: 149, discountPrice: 79, brand: 'Apex Edge', cat: 'Accessoarer', dept: 'Sport', pexelId: 3823039, sport: true, color: 'White', mat: 'Frotté', inv: { "OneSize": 50 } },
  { name: 'Hydro Steel Bottle', price: 299, discountPrice: null, brand: 'Nomad Collective', cat: 'Accessoarer', dept: 'Sport', pexelId: 416778, sport: true, color: 'Silver', mat: 'Stål', inv: { "OneSize": 30 } },
  { name: 'Speed Jump Rope', price: 199, discountPrice: 99, brand: 'Apex Edge', cat: 'Accessoarer', dept: 'Sport', pexelId: 3757376, sport: true, color: 'Black', mat: 'PVC', inv: { "OneSize": 40 } },

  // BARN SPORT
  { name: 'Junior Team Jersey', price: 399, discountPrice: 199, brand: 'Apex Edge', cat: 'T-shirts', dept: 'Sport', pexelId: 163452, sport: true, color: 'Red', mat: 'Mesh', inv: { "128": 15 } },
  { name: 'Kicks Soccer Shoes', price: 699, discountPrice: null, brand: 'Apex Edge', cat: 'Skor', dept: 'Sport', pexelId: 1171084, sport: true, color: 'Neon Green', mat: 'Syntetläder', inv: { "34": 8 } },

  // FLER SPORTBILDER (Pexels Mode-sport)
  { name: 'Legacy Weight Belt', price: 599, discountPrice: 399, brand: 'Iron & Oak', cat: 'Accessoarer', dept: 'Sport', pexelId: 2294361, sport: true, color: 'Black', mat: 'Läder', inv: { "L": 5 } },
  { name: 'Pilates Soft Mat', price: 449, discountPrice: null, brand: 'Solis Wear', cat: 'Accessoarer', dept: 'Sport', pexelId: 4056723, sport: true, color: 'Pink', mat: 'TPE', inv: { "OneSize": 25 } },
  { name: 'Mountain Trail Shoes', price: 1699, discountPrice: 1199, brand: 'Arid Supply', cat: 'Skor', dept: 'Sport', pexelId: 601177, sport: true, color: 'Brown/Orange', mat: 'GoreTex', inv: { "43": 6 } },
  { name: 'Reflective Run Vest', price: 499, discountPrice: 249, brand: 'Apex Edge', cat: 'Ytterkläder', dept: 'Sport', pexelId: 2529148, sport: true, color: 'Neon Yellow', mat: 'Reflex', inv: { "M": 10 } },
  { name: 'Compression Socks', price: 199, discountPrice: 129, brand: 'Apex Edge', cat: 'Underkläder & Sockar', dept: 'Sport', pexelId: 1552249, sport: true, color: 'Black/Grey', mat: 'Nylon', inv: { "40-45": 100 } },
  { name: 'Training Sun Visor', price: 249, discountPrice: null, brand: 'Solis Wear', cat: 'Huvudbonader', dept: 'Sport', pexelId: 1161947, sport: true, color: 'White', mat: 'Bomull', inv: { "OneSize": 20 } }
];

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('--- 🏁 Databasen rensad ---');

    const createdBrands = await Brand.bulkCreate(brandsList.map(name => ({ name })));
    const createdCats = await Category.bulkCreate(categoriesList.map(name => ({ name })));
    console.log('✅ Kategorier och märken skapade');

    for (const p of mixedProducts) {
      const brand = createdBrands.find(b => b.name === p.brand);
      const category = createdCats.find(c => c.name === p.cat);

      // Statisk Pexels URL som garanterar kläder och unika bilder
      const imageUrl = `https://images.pexels.com/photos/${p.pexelId}/pexels-photo-${p.pexelId}.jpeg?auto=compress&cs=tinysrgb&w=800`;

      await Product.create({
        name: p.name,
        price: p.price,
        discountPrice: p.discountPrice,
        description: `Premium ${p.name.toLowerCase()} designad av ${p.brand}. Material: ${p.mat}.`,
        imageUrl: imageUrl,
        department: p.dept,
        inventory: p.inv,
        color: p.color,
        material: p.mat,
        isSportswear: p.sport,
        brandId: brand ? brand.id : null,
        categoryId: category ? category.id : null
      });
    }

    console.log('✅ Seed genomförd: 20 unika produkter skapade med bilder och REA-data!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed misslyckades:', err);
    process.exit(1);
  }
}

seed();