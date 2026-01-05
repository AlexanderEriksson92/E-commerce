const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Hämta alla produkter
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Kunde inte hämta produkter' });
  }
});

// Seed-rutt (Fyll på data)
router.get('/seed', async (req, res) => {
  try {
    await Product.sync({ force: true });
    await Product.bulkCreate([
      { name: 'Klassisk T-shirt', price: 299, description: 'Svart t-shirt i bomull.' },
      { name: 'Jeans', price: 799, description: 'Blå slitstarka jeans.' },
      { name: 'Hoodie', price: 499, description: 'Grå hoodie med mjuk insida.' }
    ]);
    res.send('Databasen fylld! 🛒');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Hämta EN specifik produkt
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) res.json(product);
    else res.status(404).json({ error: 'Hittades ej' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;