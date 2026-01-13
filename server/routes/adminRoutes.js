const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const jwt = require('jsonwebtoken');

// Vi lägger verifyAdmin direkt här för att slippa import-fel
const verifyAdmin = (req, res, next) => {
  // Vi kollar både process.env och din hårdkodade sträng för säkerhets skull
  const secret = process.env.JWT_SECRET || 'superhemligt_nyckel';
  const authHeader = req.headers['authorization'];
  const token = authHeader && (authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader);

  if (!token) return res.status(401).json({ error: "Ingen token" });

  jwt.verify(token, secret, (err, decoded) => {
    if (err || !decoded.isAdmin) {
      return res.status(403).json({ error: "Ej admin" });
    }
    req.user = decoded;
    next();
  });
};

// --- RUTTER ---

router.get('/brands', async (req, res) => {
  const brands = await Brand.findAll({ order: [['name', 'ASC']] });
  res.json(brands);
});

router.get('/categories', async (req, res) => {
  const categories = await Category.findAll({ order: [['name', 'ASC']] });
  res.json(categories);
});

router.post('/brands', verifyAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    console.log("Backend tog emot namn:", name); // Kolla terminalen!

    if (!name) {
      return res.status(400).json({ error: "Namn saknas i anropet" });
    }

    const brand = await Brand.create({ name: name });
    res.json(brand);
  } catch (err) {
    console.error("Sequelize fel:", err); // Detta visar VARFÖR databasen nekar
    res.status(500).json({ error: "Kunde inte spara i databasen", details: err.message });
  }
});

router.post('/categories', verifyAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    console.log("Försöker skapa kategori med namn:", name); // Kolla terminalen!

    if (!name) {
      return res.status(400).json({ error: "Namn på kategorin saknas" });
    }

    const category = await Category.create({ name: name });
    res.json(category);
  } catch (err) {
    console.error("DETTA ÄR FELET:", err); // Kolla din backend-terminal nu!
    res.status(400).json({ 
      error: "Kunde inte skapa kategori", 
      details: err.message 
    });
  }
});

module.exports = router;