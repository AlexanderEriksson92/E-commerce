const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const User = require('./models/User'); // Behövs för admin-skapandet
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();

// Middleware - MÅSTE ligga före rutter
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutter
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Funktion för att skapa admin automatiskt om den inte finns
async function createFirstAdmin() {
  try {
    const existingAdmin = await User.findOne({ where: { username: 'admin' } });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({ 
        username: 'admin', 
        password: hashedPassword, 
        isAdmin: true 
      });
      console.log("✅ Admin-konto skapat: admin / admin123");
    }
  } catch (err) {
    console.log("Admin fanns redan eller kunde inte skapas.");
  }
}

// Starta servern
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Ansluten till databasen!');

    await sequelize.sync();
    await createFirstAdmin(); // Skapar admin vid varje start om den saknas

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Servern körs på http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Kunde inte starta servern:', error);
  }
};

startServer();