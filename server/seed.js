require('dotenv').config();
const sequelize = require('./config/db');
const { Product, ProductVariant, Brand, Category, Material, Color } = require('./models/index');

async function seedDatabase() {
  try {
    console.log("Connecting to database (keeping existing data)...");
    // VIKTIGT: force: false så vi inte rensar databasen
    await sequelize.sync({ force: false });

    const newProductsData = [
      // --- WOMEN (8 till) ---
      { name: 'Sienna Satin Blouse', price: 750, brand: 'Aura', category: 'Tops', material: 'Satin', department: 'Women', color: 'Champagne', isSportswear: false, imageUrl: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&w=800', variants: ['36', '38', '40'] },
      { name: 'Luna Mesh Tights', price: 599, brand: 'Zen', category: 'Tights', material: 'Polyester', department: 'Women', color: 'Purple', isSportswear: true, imageUrl: 'https://images.pexels.com/photos/3756042/pexels-photo-3756042.jpeg?auto=compress&w=800', variants: ['XS', 'S', 'M'] },
      { name: 'Velora Night Gown', price: 1800, discountPrice: 1299, brand: 'Velora', category: 'Dresses', material: 'Silk', department: 'Women', color: 'Midnight Blue', isSportswear: false, imageUrl: 'https://images.pexels.com/photos/1755428/pexels-photo-1755428.jpeg?auto=compress&w=800', variants: ['S', 'M', 'L'] },
      { name: 'Breeze Linen Trousers', price: 899, brand: 'Breeze', category: 'Pants', material: 'Linen', department: 'Women', color: 'Sand', isSportswear: false, imageUrl: 'https://images.pexels.com/photos/1103928/pexels-photo-1103928.jpeg?auto=compress&w=800', variants: ['34', '36', '38'] },
      { name: 'Aura Velvet Headband', price: 199, brand: 'Aura', category: 'Accessories', material: 'Velvet', department: 'Women', color: 'Red', isSportswear: false, imageUrl: 'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?auto=compress&w=800', variants: ['One Size'] },
      { name: 'FlowState Mesh Bra', price: 449, brand: 'FlowState', category: 'Tops', material: 'Nylon', department: 'Women', color: 'Black', isSportswear: true, imageUrl: 'https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&w=800', variants: ['S', 'M', 'L'] },
      { name: 'Loom Wool Cardigan', price: 1100, brand: 'Loom & Thread', category: 'Sweaters', material: 'Wool', department: 'Women', color: 'Grey', isSportswear: false, imageUrl: 'https://images.pexels.com/photos/1619697/pexels-photo-1619697.jpeg?auto=compress&w=800', variants: ['M', 'L'] },
      { name: 'StepForm Ankle Boots', price: 1899, brand: 'StepForm', category: 'Shoes', material: 'Leather', department: 'Women', color: 'Tan', isSportswear: false, imageUrl: 'https://images.pexels.com/photos/1460838/pexels-photo-1460838.jpeg?auto=compress&w=800', variants: ['37', '38', '39', '40'] },

      // --- MEN (8 till) ---
      { name: 'Forge Biker Jacket', price: 3500, discountPrice: 2499, brand: 'Forge', category: 'Jackets', material: 'Leather', department: 'Men', color: 'Black', isSportswear: false, imageUrl: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&w=800', variants: ['L', 'XL', 'XXL'] },
      { name: 'Apex Storm Parka', price: 3200, brand: 'Apex', category: 'Jackets', material: 'Gore-Tex', department: 'Men', color: 'Olive', isSportswear: true, imageUrl: 'https://images.pexels.com/photos/163696/pexels-photo-163696.jpeg?auto=compress&w=800', variants: ['M', 'L', 'XL'] },
      { name: 'Nordic Tailor Chinos', price: 999, brand: 'Nordic Tailor', category: 'Pants', material: 'Cotton', department: 'Men', color: 'Beige', isSportswear: false, imageUrl: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&w=800', variants: ['32', '34', '36'] },
      { name: 'Veloce Track Pants', price: 699, discountPrice: 499, brand: 'Veloce', category: 'Pants', material: 'Polyester', department: 'Men', color: 'Navy', isSportswear: true, imageUrl: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&w=800', variants: ['S', 'M', 'L'] },
      { name: 'Forge Heavy Hoodie', price: 899, brand: 'Forge', category: 'Sweaters', material: 'Cotton', department: 'Men', color: 'Grey', isSportswear: false, imageUrl: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&w=800', variants: ['M', 'L', 'XL'] },
      { name: 'Apex Trail Shoes', price: 1599, brand: 'Apex', category: 'Shoes', material: 'Nylon', department: 'Men', color: 'Orange/Black', isSportswear: true, imageUrl: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&w=800', variants: ['42', '43', '44', '45'] },
      { name: 'Nordic Classic Shirt', price: 799, brand: 'Nordic Tailor', category: 'Shirts', material: 'Cotton', department: 'Men', color: 'White', isSportswear: false, imageUrl: 'https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg?auto=compress&w=800', variants: ['S', 'M', 'L', 'XL'] },
      { name: 'Veloce Compression Tee', price: 449, brand: 'Veloce', category: 'T-shirts', material: 'Elastane', department: 'Men', color: 'Black', isSportswear: true, imageUrl: 'https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&w=800', variants: ['M', 'L', 'XL'] },

      // --- KIDS (2 till) ---
      { name: 'Mini Apex Raincoat', price: 699, brand: 'Apex', category: 'Jackets', material: 'Polyester', department: 'Kids', color: 'Yellow', isSportswear: false, imageUrl: 'https://images.pexels.com/photos/1619690/pexels-photo-1619690.jpeg?auto=compress&w=800', variants: ['104', '116', '128'] },
      { name: 'KnitCo Toddler Mittens', price: 149, brand: 'KnitCo', category: 'Accessories', material: 'Wool', department: 'Kids', color: 'Blue', isSportswear: false, imageUrl: 'https://images.pexels.com/photos/1102734/pexels-photo-1102734.jpeg?auto=compress&w=800', variants: ['One Size'] },

      // --- UNISEX (2 till) ---
      { name: 'CarryOn Wallet', price: 399, brand: 'CarryOn', category: 'Accessories', material: 'Leather', department: 'Unisex', color: 'Brown', isSportswear: false, imageUrl: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&w=800', variants: ['One Size'] },
      { name: 'Loom Eco Tote', price: 199, brand: 'Loom & Thread', category: 'Bags', material: 'Canvas', department: 'Unisex', color: 'Beige', isSportswear: false, imageUrl: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&w=800', variants: ['One Size'] }
    ];

    // Funktion för att hitta eller skapa bas-data
    const getOrCreate = async (Model, name) => {
      const [instance] = await Model.findOrCreate({ where: { name: name } });
      return instance.id;
    };

    console.log("Adding new base data and products...");

    for (const item of newProductsData) {
      // 1. Skapa relationer (findOrCreate gör att vi inte får dubbletter)
      const brandId = await getOrCreate(Brand, item.brand);
      const categoryId = await getOrCreate(Category, item.category);
      const colorId = await getOrCreate(Color, item.color);
      const materialId = await getOrCreate(Material, item.material);

      // 2. Skapa produkten (om den inte redan finns)
      const [product, created] = await Product.findOrCreate({
        where: { name: item.name },
        defaults: {
          price: item.price,
          discountPrice: item.discountPrice,
          brandId,
          categoryId,
          colorId,
          materialId,
          department: item.department,
          isSportswear: item.isSportswear,
          imageUrl: item.imageUrl,
          description: `Premium quality ${item.name} from ${item.brand}.`
        }
      });

      if (created) {
        // 3. Skapa varianter bara om produkten är ny
        for (const size of item.variants) {
          await ProductVariant.create({
            productId: product.id,
            size: size,
            stock: Math.floor(Math.random() * 20) + 5
          });
        }
        console.log(`+ Added: ${item.name}`);
      } else {
        console.log(`- Skipped: ${item.name} (already exists)`);
      }
    }

    console.log("SUCCESS: 20 NEW products added to the existing collection!");
    process.exit(0);
  } catch (error) {
    console.error("SEED ERROR:", error);
    process.exit(1);
  }
}

seedDatabase();