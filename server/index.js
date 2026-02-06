const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const path = require('path');
const bcrypt = require('bcrypt');

// 1. MODELL-IMPORTER (Hämtas nu centralt från models-mappen)
const { 
  User, 
  Product, 
  Brand, 
  Category, 
  Material, 
  ProductVariant, 
  Favorite, 
  Order, 
  OrderItem 
} = require('./models'); 

// 2. RUTT-IMPORTER
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes'); 

const app = express();

// 3. MIDDLEWARE
app.use(cors({
  origin: ['https://e-commerce-5sp4sxafa-alexander-erikssons-projects-d01d809b.vercel.app', 'http://localhost:5173'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. RUTTER
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes); 

// 5. ADMIN-SKAPANDE (AUTOMATISKT)
async function createFirstAdmin() {
  try {
    const adminEmail = 'admin@webbshop.se';
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({ 
        username: 'admin', 
        password: hashedPassword, 
        isAdmin: true,
        firstName: 'System',
        lastName: 'Admin',
        email: adminEmail
      });
      console.log("✅ NYTT Admin-konto skapat!");
      console.log("Använd: admin@webbshop.se / admin123");
    } else {
      console.log("ℹ️ Admin-kontot (admin@webbshop.se) finns redan i databasen.");
    }
  } catch (err) {
    console.error("❌ Fel vid kontroll av admin:", err);
  }
}

// 6. STARTA SERVER
const startServer = async () => {
  try {
    // Anslut till DB
    console.log('✅ Ansluten till databasen!');

    // Synkronisera tabeller
    // alter: true uppdaterar existerande tabeller utan att radera data
    await sequelize.sync({ alter: true }); 
    console.log('✅ Databasen är synkroniserad och tabeller skapade!');

    // Skapa admin om det saknas
    await createFirstAdmin(); 

    const PORT = process.env.PORT || 5000;
    
    app.listen(PORT, () => {
      console.log(`🚀 Servern körs på port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Kunde inte starta servern:', error);
  }
};

startServer();