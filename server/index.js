const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const path = require('path');
const bcrypt = require('bcrypt');

// 1. MODELL-IMPORTER
const User = require('./models/User'); 
const Product = require('./models/Product');
const Brand = require('./models/Brand'); 
const Category = require('./models/Category'); 
const Favorite = require('./models/Favorite');
const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');

// 2. RUTT-IMPORTER
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes'); 

const app = express();

// --- 3. RELATIONER (ASSOCIATIONS) ---

// Kategori & Varumärke -> Produkt
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

Brand.hasMany(Product, { foreignKey: 'brandId' });
Product.belongsTo(Brand, { foreignKey: 'brandId' });

// Favoriter (Användare <-> Produkt)
User.hasMany(Favorite, { foreignKey: 'userId' });
Favorite.belongsTo(User, { foreignKey: 'userId' });
Product.hasMany(Favorite, { foreignKey: 'productId' });
Favorite.belongsTo(Product, { foreignKey: 'productId' });

// Ordrar (Användare <-> Order)
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

// OrderItems (Order <-> Produkt)
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

// 4. MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 5. RUTTER
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes); 

// 6. ADMIN-SKAPANDE (AUTOMATISKT)
async function createFirstAdmin() {
  try {
    const existingAdmin = await User.findOne({ where: { username: 'admin' } });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({ 
        username: 'admin', 
        password: hashedPassword, 
        isAdmin: true,
        firstName: 'System',
        lastName: 'Admin',
        email: 'admin@webbshop.se'
      });
      console.log("✅ Admin-konto skapat: admin / admin123");
    }
  } catch (err) {
    console.log("ℹ️ Admin-kontot verifierat.");
  }
}

// 7. STARTA SERVER
const startServer = async () => {
  try {
    // Anslut till DB
    await sequelize.authenticate();
    console.log('✅ Ansluten till databasen!');

    // Synkronisera tabeller
    // alter: true uppdaterar existerande tabeller utan att radera data
    await sequelize.sync({ alter: true }); 
    console.log('✅ Databasen är synkroniserad och tabeller skapade!');

    // Skapa admin om det saknas
    await createFirstAdmin(); 

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Servern körs på http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Kunde inte starta servern:', error);
  }
};

startServer();