const Product = require('./models/Product');
const Category = require('./models/Category');
const sequelize = require('./config/db');

const seedDatabase = async () => {
  try {
    console.log("Rensar och skapar om tabeller med nya fält...");
    await sequelize.sync({ force: true }); 

    await Category.bulkCreate([
      { id: 1, name: 'Hoodies' },
      { id: 2, name: 'T-Shirts' },
      { id: 3, name: 'Pants' },
      { id: 4, name: 'Accessories' },
      { id: 5, name: 'Jackets' }
    ]);

    const products = [
      // MEN
      { name: "Urban Stealth Hoodie", price: 899, discountPrice: 649, description: "Tung premium-bomull med borstad insida för maximal komfort.", department: "Men", imageUrl: "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg", categoryId: 1, inventory: { "XS": 5, "S": 10, "M": 15, "L": 10, "XL": 5 } },
      { name: "Raw Denim Jacket", price: 1200, discountPrice: 999, description: "Klassisk denimjacka som bara blir snyggare med tiden.", department: "Men", imageUrl: "https://images.pexels.com/photos/2850487/pexels-photo-2850487.jpeg", categoryId: 5, inventory: { "XS": 2, "S": 5, "M": 8, "L": 5, "XL": 2 } },
      { name: "Midnight Cargo Pants", price: 750, discountPrice: null, description: "Funktionella cargobyxor med förstärkta sömmar.", department: "Men", imageUrl: "https://images.pexels.com/photos/157675/fashion-men-s-individuality-black-and-white-157675.jpeg", categoryId: 3, inventory: { "28": 5, "30": 10, "32": 10, "34": 5 } },
      { name: "Street Logo Tee", price: 349, discountPrice: 199, description: "Vår klassiska logga tryckt på ekologisk bomull.", department: "Men", imageUrl: "https://images.pexels.com/photos/1018911/pexels-photo-1018911.jpeg", categoryId: 2, inventory: { "XS": 20, "S": 30, "M": 30, "L": 20, "XL": 10 } },
      { name: "Tech Fleece Joggers", price: 699, discountPrice: null, description: "Lätta och varma joggers för en aktiv livsstil.", department: "Men", imageUrl: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg", categoryId: 3, inventory: { "XS": 5, "S": 10, "M": 10, "L": 5 } },
      { name: "Oversized Flannel", price: 549, discountPrice: 399, description: "Rutig flanellskjorta i rymlig passform.", department: "Men", imageUrl: "https://images.pexels.com/photos/428338/pexels-photo-428338.jpeg", categoryId: 2, inventory: { "S": 10, "M": 15, "L": 15, "XL": 5 } },
      { name: "Graphite Windbreaker", price: 1100, discountPrice: null, description: "Vind- och vattenavvisande jacka för stadens alla väder.", department: "Men", imageUrl: "https://images.pexels.com/photos/16170/pexels-photo.jpg", categoryId: 5, inventory: { "XS": 3, "S": 7, "M": 10, "L": 5, "XL": 2 } },

      // WOMEN
      { name: "Nova Oversized Tee", price: 299, discountPrice: 149, description: "Den perfekta bas-tishan med modern siluett.", department: "Women", imageUrl: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg", categoryId: 2, inventory: { "XS": 20, "S": 25, "M": 20, "L": 10 } },
      { name: "Cloud Knit Sweater", price: 749, discountPrice: 599, description: "Mjuk stickad tröja i en lyxig ullmix.", department: "Women", imageUrl: "https://images.pexels.com/photos/459486/pexels-photo-459486.jpeg", categoryId: 1, inventory: { "XS": 5, "S": 12, "M": 15, "L": 5 } },
      { name: "High-Rise Street Pants", price: 849, discountPrice: null, description: "Trendiga byxor med hög midja och raka ben.", department: "Women", imageUrl: "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg", categoryId: 3, inventory: { "24": 5, "26": 10, "28": 10, "30": 5 } },
      { name: "Azure Puffer Vest", price: 999, discountPrice: 749, description: "Varmfodrad väst som lyfter vilken outfit som helst.", department: "Women", imageUrl: "https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg", categoryId: 5, inventory: { "XS": 5, "S": 10, "M": 10, "L": 5 } },
      { name: "Essential Crop Top", price: 249, discountPrice: null, description: "Kortare modell i stretchigt ribbat material.", department: "Women", imageUrl: "https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg", categoryId: 2, inventory: { "XXS": 5, "XS": 10, "S": 15, "M": 10 } },
      { name: "Fitted Cargo Leggings", price: 599, discountPrice: 449, description: "Leggings möter utility - snyggt och praktiskt.", department: "Women", imageUrl: "https://images.pexels.com/photos/1103828/pexels-photo-1103828.jpeg", categoryId: 3, inventory: { "XS": 10, "S": 15, "M": 15, "L": 5 } },
      { name: "Silk Blend Blouse", price: 649, discountPrice: null, description: "Elegant blus med fantastiskt lyster.", department: "Women", imageUrl: "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg", categoryId: 2, inventory: { "XS": 5, "S": 10, "M": 10, "L": 5 } },

      // KIDS
      { name: "Mini Explorer Hoodie", price: 449, discountPrice: 299, description: "Slitstark hoodie för små äventyrare.", department: "Kids", imageUrl: "https://images.pexels.com/photos/35188/child-childrens-face-child-l-e-a-f.jpg", categoryId: 1, inventory: { "110/116": 10, "122/128": 15, "134/140": 10 } },
      { name: "Playground Shorts", price: 199, discountPrice: null, description: "Mjuka shorts för lek hela dagen.", department: "Kids", imageUrl: "https://images.pexels.com/photos/1619690/pexels-photo-1619690.jpeg", categoryId: 3, inventory: { "110/116": 20, "122/128": 20, "134/140": 15 } },
      { name: "Junior Graphic Tee", price: 149, discountPrice: 99, description: "Coolt tryck för de minsta streetwear-fansen.", department: "Kids", imageUrl: "https://images.pexels.com/photos/1619697/pexels-photo-1619697.jpeg", categoryId: 2, inventory: { "110/116": 30, "122/128": 30, "134/140": 25 } },
      { name: "Tots Rain Jacket", price: 549, discountPrice: null, description: "Helt vattentät med avtagbar huva.", department: "Kids", imageUrl: "https://images.pexels.com/photos/1152359/pexels-photo-1152359.jpeg", categoryId: 5, inventory: { "110/116": 5, "122/128": 10, "134/140": 5 } },

      // UNISEX
      { name: "Beanie One-Size", price: 199, discountPrice: 149, description: "Klassisk uppvikt mössa som passar alla.", department: "Unisex", imageUrl: "https://images.pexels.com/photos/1501210/pexels-photo-1501210.jpeg", categoryId: 4, inventory: { "One Size": 100 } },
      { name: "Utility Backpack", price: 1499, discountPrice: null, description: "Rymlig ryggsäck med laptopfack och många detaljer.", department: "Unisex", imageUrl: "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg", categoryId: 4, inventory: { "One Size": 20 } }
    ];

    await Product.bulkCreate(products);
    console.log("Databasen är nu helt uppdaterad!");
    process.exit();
  } catch (err) {
    console.error("Fel:", err);
    process.exit(1);
  }
};

seedDatabase();