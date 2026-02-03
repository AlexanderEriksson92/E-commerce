const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Importerar alla modeller
const User = require('../models/User');
const Favorite = require('../models/Favorite');
const Product = require('../models/Product');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const sequelize = require('../config/db');

const secret = process.env.JWT_SECRET || 'superhemligt_nyckel';

// --- 1. REGISTRERING (Nu med automatisk inloggning) ---
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    const userExists = await User.findOne({ where: { email } });
    if (userExists) return res.status(400).json({ error: "E-postadressen är redan registrerad" });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await User.create({
      username: email,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      isAdmin: false
    });

    // SKAPA TOKEN DIREKT HÄR (Samma logik som vid login)
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, isAdmin: newUser.isAdmin },
      secret,
      { expiresIn: '2h' }
    );

    // Skicka tillbaka allt frontend behöver för att vara "inloggad"
    res.status(201).json({ 
      message: "Konto skapat!", 
      token,
      username: newUser.firstName, 
      isAdmin: newUser.isAdmin,
      userId: newUser.id 
    });
  } catch (err) {
    res.status(500).json({ error: "Kunde inte skapa konto." });
  }
});

// --- 2. INLOGGNING (Nu med Email) ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body; 
    const user = await User.findOne({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Fel e-post eller lösenord" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      secret,
      { expiresIn: '2h' }
    );

    res.json({
      token,
      username: user.firstName, 
      isAdmin: user.isAdmin,
      userId: user.id 
    });
  } catch (err) {
    res.status(500).json({ error: "Serverfel vid inloggning" });
  }
});

// --- 3. PROFILINFO ---
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Ingen token hittades" });

    const decoded = jwt.verify(token, secret);
    const user = await User.findByPk(decoded.id, { 
      attributes: { exclude: ['password'] } 
    });
    res.json(user);
  } catch (err) {
    res.status(401).json({ error: "Ogiltig token" });
  }
});

// --- 4. FAVORITER (HJÄRTAN) ---
router.post('/favorites/toggle', async (req, res) => {
  try {
    const { productId, userId } = req.body;
    const existing = await Favorite.findOne({ where: { userId, productId } });

    if (existing) {
      await existing.destroy();
      return res.json({ isFavorite: false });
    } else {
      await Favorite.create({ userId, productId });
      return res.json({ isFavorite: true });
    }
  } catch (err) {
    res.status(500).json({ error: "Fel vid favorit-toggle" });
  }
});

router.get('/favorites/details/:userId', async (req, res) => {
  try {
    const favs = await Favorite.findAll({ 
      where: { userId: req.params.userId }, 
      include: [{ 
        model: Product,
        include: [
          { 
            // Vi måste inkludera variants för att frontend ska se storlekarna
            model: require('../models/ProductVariant'), 
            as: 'variants' 
          },
          {
            model: require('../models/Brand'),
            attributes: ['name']
          }
        ] 
      }] 
    });
    
    // Vi mappar ut produkterna och ser till att variants följer med
    res.json(favs.map(f => f.Product));
  } catch (err) {
    console.error("Favorit-detalj fel:", err);
    res.status(500).json({ error: "Fel vid hämtning av favoriter" });
  }
});

// --- 5. CHECKOUT (KÖP) ---
// routes/auth.js - Uppdaterad Checkout
router.post('/checkout', async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { userId, items, totalAmount } = req.body;

    const newOrder = await Order.create({ 
      userId: userId ? parseInt(userId) : null, 
      totalAmount: parseFloat(totalAmount) 
    }, { transaction: t });

    for (const item of items) {
      const product = await Product.findByPk(item.id, { transaction: t });

      if (!product) throw new Error(`Produkten hittades inte.`);

      const size = item.selectedSize; // T.ex. "S" eller "L"
      
      // Kolla om storleken finns och har lager
      if (!product.inventory[size] || product.inventory[size] < 1) {
        throw new Error(`Storlek ${size} för ${product.name} är tyvärr slut.`);
      }

      // Skapa en kopia av inventory och minska rätt storlek
      const updatedInventory = { ...product.inventory };
      updatedInventory[size] -= 1;

      // Spara rader
      await OrderItem.create({
        orderId: newOrder.id,
        productId: item.id,
        quantity: 1,
        priceAtPurchase: parseFloat(item.price)
      }, { transaction: t });

      // Uppdatera produkten med det nya inventory-objektet
      await product.update({ inventory: updatedInventory }, { transaction: t });
    }

    await t.commit();
    res.status(201).json({ message: "Köp bekräftat!", orderId: newOrder.id });

  } catch (err) {
    await t.rollback();
    console.error("Checkout Error:", err);
    res.status(400).json({ error: err.message });
  }
});

// --- 6. ORDERHISTORIK ---
router.get('/orders/:userId', async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.params.userId },
      include: [{
        model: OrderItem,
        include: [Product] // Kräver korrekt relation i index.js
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    console.error("Fetch orders error:", err);
    res.status(500).json({ error: "Kunde inte hämta orderhistorik" });
  }
});

module.exports = router;