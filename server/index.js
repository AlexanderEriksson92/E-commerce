// Fix för IPv4-nätverk (viktigt för anslutning till vissa molntjänster)
const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const productRoutes = require('./routes/productRoutes');

const app = express();

// Middleware
app.use(cors());             // Tillåter frontenden att prata med backenden
app.use(express.json());     // Gör att vi kan läsa JSON-data i anrop

// Använd våra produkt-rutter
// Detta betyder att alla rutter i productRoutes börjar på /api/products
app.use('/api/products', productRoutes);

// Starta servern och anslut till databasen
const startServer = async () => {
  try {
    // Kontrollera att anslutningen fungerar
    await sequelize.authenticate();
    console.log('✅ Ansluten till Supabase-databasen!');

    // Synka modeller med databasen (skapar tabeller om de inte finns)
    await sequelize.sync();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Servern körs på http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Kunde inte starta servern:', error);
  }
};

startServer();