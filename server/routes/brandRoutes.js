const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
// Importera din verifyAdmin middleware här
// const { verifyAdmin } = require('../middleware/auth'); 

// Hämta alla märken
router.get('/', async (req, res) => {
  const brands = await Brand.findAll({ order: [['name', 'ASC']] });
  res.json(brands);
});

// Lägg till nytt märke (Skyddad rutt)
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const newBrand = await Brand.create({ name });
    res.json(newBrand);
  } catch (err) {
    res.status(400).json({ error: "Märket finns redan eller felaktig data" });
  }
});

module.exports = router;