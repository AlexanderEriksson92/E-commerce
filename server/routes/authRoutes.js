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

// --- 1. REGISTRERING (Nu med Email) ---
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    // Vi kollar om e-posten redan finns
    const userExists = await User.findOne({ where: { email } });
    if (userExists) return res.status(400).json({ error: "E-postadressen är redan registrerad" });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await User.create({
      username: email, // Vi använder email som username i databasen för att slippa ändra modellen
      firstName,
      lastName,
      email,
      password: hashedPassword,
      isAdmin: false
    });
    res.status(201).json({ message: "Konto skapat!", userId: newUser.id });
  } catch (err) {
    res.status(500).json({ error: "Kunde inte skapa konto." });
  }
});

// --- 2. INLOGGNING (Nu med Email) ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body; // Vi tar emot email istället för username
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
      username: user.firstName, // Vi skickar förnamnet till frontend så det står "Hej Kalle!"
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
      include: [{ model: Product }] 
    });
    res.json(favs.map(f => f.Product));
  } catch (err) {
    res.status(500).json({ error: "Fel vid hämtning av favoriter" });
  }
});

// --- 5. CHECKOUT (KÖP) ---
router.post('/checkout', async (req, res) => {
  // Vi startar en transaktion för att garantera datasäkerhet
  const t = await sequelize.transaction();

  try {
    const { userId, items, totalAmount } = req.body;

    // 1. Skapa huvudordern
    const newOrder = await Order.create({ 
      userId: userId ? parseInt(userId) : null, 
      totalAmount: parseFloat(totalAmount) 
    }, { transaction: t });

    // 2. Skapa orderrader OCH minska lager för varje produkt
    for (const item of items) {
      // Hämta produkten för att kolla lagerstatus
      const product = await Product.findByPk(item.id, { transaction: t });

      if (!product) {
        throw new Error(`Produkt med ID ${item.id} hittades inte.`);
      }

      // Kontrollera om det finns tillräckligt i lager (vi antar quantity 1 här utifrån din kod)
      if (product.stock < 1) {
        throw new Error(`Tyvärr tog ${product.name} precis slut i lager.`);
      }

      // Skapa order-raden
      await OrderItem.create({
        orderId: newOrder.id,
        productId: item.id,
        quantity: 1,
        priceAtPurchase: parseFloat(item.price)
      }, { transaction: t });

      // MINSKA LAGRET MED 1
      await product.decrement('stock', { by: 1, transaction: t });
    }

    // Om allt gick bra, bekräfta alla ändringar i databasen
    await t.commit();

    res.status(201).json({ 
      message: userId ? "Order sparad på din profil!" : "Tack för ditt gästköp!", 
      orderId: newOrder.id 
    });

  } catch (err) {
    // Om något gick fel (t.ex. slut i lager), rulla tillbaka allt
    await t.rollback();
    console.error("Checkout Error:", err);
    res.status(400).json({ error: err.message || "Kunde inte slutföra köp" });
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