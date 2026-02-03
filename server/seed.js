require('dotenv').config();
const sequelize = require('./config/db');
const { Product, ProductVariant, Brand, Category, Material, Color } = require('./models/index');

async function seedDatabase() {
  try {
    console.log("Emptying database and syncing...");
    await sequelize.sync({ force: true });

    const productsData = [
      // --- WOMEN (12 st) ---
      { name: 'Velora Silk Slip', price: 1200, discountPrice: 899, brand: 'Velora', category: 'Dresses', material: 'Silk', department: 'Women', color: 'Black', isSportswear: false, imageUrl: 'https://images.pexels.com/photos/1181290/pexels-photo-1181290.jpeg?auto=compress&w=800', variants: ['S', 'M', 'L'] },
      { name: 'Aura Summer Gown', price: 1599, brand: 'Aura', category: 'Dresses', material: 'Cotton', department: 'Women', color: 'White', isSportswear: false, imageUrl: 'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?auto=compress&w=800', variants: ['XS', 'S', 'M'] },
      { name: 'DenimCo Highrise', price: 899, discountPrice: 449, brand: 'DenimCo', category: 'Jeans', material: 'Denim', department: 'Women', color: 'Blue', isSportswear: false, imageUrl: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&w=800', variants: ['27', '28', '29'] },
      { name: 'Nordic Wool Coat', price: 2900, brand: 'Nordic Tailor', category: 'Jackets', material: 'Wool', department: 'Women', color: 'Grey', isSportswear: false, imageUrl: 'https://images.pexels.com/photos/7679456/pexels-photo-7679456.jpeg?auto=compress&w=800', variants: ['36', '38', '40'] },
      { name: 'FlowState Yoga Set', price: 950, discountPrice: 699, brand: 'FlowState', category: 'Sets', material: 'Nylon', department: 'Women', color: 'Lavender', isSportswear: true, imageUrl: 'https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg?auto=compress&w=800', variants: ['S', 'M'] },
      { name: 'StepForm Leather Heels', price: 1400, brand: 'StepForm', category: 'Shoes', material: 'Leather', department: 'Women', color: 'Red', isSportswear: false, imageUrl: 'https://images.pexels.com/photos/3389419/pexels-photo-3389419.jpeg?auto=compress&w=800', variants: ['37', '38', '39'] },
      { name: 'Loom Oversized Knit', price: 799, discountPrice: 399, brand: 'Loom & Thread', category: 'Sweaters', material: 'Wool', department: 'Women', color: 'Beige', isSportswear: false, imageUrl: 'https://images.pexels.com/photos/5705490/pexels-photo-5705490.jpeg?auto=compress&w=800', variants: ['S', 'M', 'L'] },
      { name: 'CarryOn Leather Bag', price: 2200, brand: 'CarryOn', category: 'Bags', material: 'Leather', department: 'Women', color: 'Tan', isSportswear: false, imageUrl: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&w=800', variants: ['One Size'] },
      { name: 'Aura Pleated Skirt', price: 699, brand: 'Aura', category: 'Skirts', material: 'Satin', department: 'Women', color: 'Pink', isSportswear: false, imageUrl: 'https://images.pexels.com/photos/7680197/pexels-photo-7680197.jpeg?auto=compress&w=800', variants: ['34', '36', '38'] },
      { name: 'Breeze Linen Shirt', price: 599, discountPrice: 299, brand: 'Breeze', category: 'Shirts', material: 'Linen', department: 'Women', color: 'White', isSportswear: false, imageUrl: 'https://images.pexels.com/photos/1233648/pexels-photo-1233648.jpeg?auto=compress&w=800', variants: ['S', 'M', 'L'] },
      { name: 'Lustre Gold Hoops', price: 450, brand: 'Lustre', category: 'Jewelry', material: 'Gold Plated', department: 'Women', color: 'Gold', isSportswear: false, imageUrl: 'https://images.pexels.com/photos/3352548/pexels-photo-3352548.jpeg?auto=compress&w=800', variants: ['One Size'] },
      { name: 'Zen Crop Top', price: 399, brand: 'Zen', category: 'Tops', material: 'Polyester', department: 'Women', color: 'Black', isSportswear: true, imageUrl: 'https://images.pexels.com/photos/4167541/pexels-photo-4167541.jpeg?auto=compress&w=800', variants: ['XS', 'S', 'M'] },

      // --- MEN (4 st) ---
      { name: 'Forge Raw Denim', price: 1100, discountPrice: 799, brand: 'Forge', category: 'Jeans', material: 'Denim', department: 'Men', color: 'Navy', isSportswear: false, imageUrl: 'https://images.pexels.com/photos/1082528/pexels-photo-1082528.jpeg?auto=compress&w=800', variants: ['32', '34', '36'] },
      { name: 'Apex Tech Jacket', price: 2100, brand: 'Apex', category: 'Jackets', material: 'Gore-Tex', department: 'Men', color: 'Black', isSportswear: true, imageUrl: 'https://images.pexels.com/photos/163696/pexels-photo-163696.jpeg?auto=compress&w=800', variants: ['M', 'L', 'XL'] },
      { name: 'Nordic Tailor Suit', price: 4500, discountPrice: 2999, brand: 'Nordic Tailor', category: 'Sets', material: 'Wool', department: 'Men', color: 'Charcoal', isSportswear: false, imageUrl: 'https://images.pexels.com/photos/375880/pexels-photo-375880.jpeg?auto=compress&w=800', variants: ['48', '50', '52'] },
      { name: 'Veloce Runner Pro', price: 1399, brand: 'Veloce', category: 'Shoes', material: 'Mesh', department: 'Men', color: 'White', isSportswear: true, imageUrl: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&w=800', variants: ['42', '43', '44'] },

      // --- KIDS (2 st) ---
      { name: 'KnitCo Mini Sweater', price: 450, discountPrice: 225, brand: 'KnitCo', category: 'Sweaters', material: 'Cotton', department: 'Kids', color: 'Yellow', isSportswear: false, imageUrl: 'https://images.pexels.com/photos/1619690/pexels-photo-1619690.jpeg?auto=compress&w=800', variants: ['116', '128', '140'] },
      { name: 'Apex Junior Boots', price: 899, brand: 'Apex', category: 'Shoes', material: 'Leather', department: 'Kids', color: 'Brown', isSportswear: false, imageUrl: 'https://images.pexels.com/photos/1102734/pexels-photo-1102734.jpeg?auto=compress&w=800', variants: ['30', '32', '34'] },

      // --- UNISEX (2 st) ---
      { name: 'KnitCo Beanie', price: 249, brand: 'KnitCo', category: 'Accessories', material: 'Wool', department: 'Unisex', color: 'Grey', isSportswear: false, imageUrl: 'https://images.pexels.com/photos/844867/pexels-photo-844867.jpeg?auto=compress&w=800', variants: ['One Size'] },
      { name: 'CarryOn Backpack', price: 999, discountPrice: 499, brand: 'CarryOn', category: 'Bags', material: 'Canvas', department: 'Unisex', color: 'Green', isSportswear: false, imageUrl: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&w=800', variants: ['One Size'] }
    ];

    // 1. Extrahera unika värden
    const brands = [...new Set(productsData.map(p => p.brand))];
    const categories = [...new Set(productsData.map(p => p.category))];
    const colors = [...new Set(productsData.map(p => p.color))];
    const materials = [...new Set(productsData.map(p => p.material))];

    // 2. Skapa dem i databasen
    const brandMap = {};
    for (const b of brands) { const res = await Brand.create({ name: b }); brandMap[b] = res.id; }
    
    const catMap = {};
    for (const c of categories) { const res = await Category.create({ name: c }); catMap[c] = res.id; }
    
    const colorMap = {};
    for (const clr of colors) { const res = await Color.create({ name: clr }); colorMap[clr] = res.id; }
    
    const matMap = {};
    for (const m of materials) { const res = await Material.create({ name: m }); matMap[m] = res.id; }

    console.log("Base data created.");

    // 3. Skapa produkterna
    for (const item of productsData) {
      const product = await Product.create({
        name: item.name,
        price: item.price,
        discountPrice: item.discountPrice,
        brandId: brandMap[item.brand],
        categoryId: catMap[item.category],
        colorId: colorMap[item.color],
        materialId: matMap[item.material],
        department: item.department,
        isSportswear: item.isSportswear,
        imageUrl: item.imageUrl,
        description: `Premium quality ${item.name} from ${item.brand}.`
      });

      for (const size of item.variants) {
        await ProductVariant.create({
          productId: product.id,
          size: size,
          stock: Math.floor(Math.random() * 20) + 5
        });
      }
    }

    console.log("SUCCESS: 20 products with images and relations seeded!");
    process.exit(0);
  } catch (error) {
    console.error("SEED ERROR:", error);
    process.exit(1);
  }
}

seedDatabase();