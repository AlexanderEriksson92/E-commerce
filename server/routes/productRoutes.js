const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'superhemligt_nyckel';
const multer = require('multer');
const path = require('path');

// Middleware för att kolla admin
const verifyAdmin = (req, res, next) => {
  // Hämta token från headers
  const token = req.headers['authorization']; 
  
  if (!token) {
    return res.status(403).json({ error: "Ingen token skickad" });
  }

  try {
    const decoded = jwt.verify(token, 'superhemligt_nyckel'); // Samma nyckel som i authRoutes!
    if (decoded.isAdmin) {
      next(); // Allt ok, fortsätt till sparning
    } else {
      res.status(403).json({ error: "Endast admin får göra detta" });
    }
  } catch (err) {
    res.status(401).json({ error: "Ogiltig eller utgången token" });
  }
};

// Inställningar för var och hur filer sparas
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Ger filen ett unikt namn
  }
});

const upload = multer({ storage: storage });

// Ändrad POST-rutt för att hantera BÅDE text och fil
router.post('/', upload.single('imageFile'), async (req, res) => {
  try {
    const { name, price, description, imageUrl } = req.body;
    
    // Om en fil laddades upp, använd den sökvägen. Annars använd URL:en.
    const finalImageUrl = req.file 
      ? `http://localhost:5000/uploads/${req.file.filename}` 
      : imageUrl;

    const newProduct = await Product.create({
      name,
      price,
      description,
      imageUrl: finalImageUrl
    });
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

// POST: Lägg till en ny produkt
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { name, price, description, imageUrl } = req.body;
    const newProduct = await Product.create({
      name,
      price,
      description,
      imageUrl
    });
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ error: 'Kunde inte skapa produkt: ' + err.message });
  }
});

// RADERA PRODUKT
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Hittade inte produkten" });
    
    await product.destroy();
    res.json({ message: "Produkten raderad!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// REDIGERA PRODUKT
router.put('/:id', verifyAdmin, upload.single('imageFile'), async (req, res) => {
  try {
    const { name, price, description, imageUrl, category, brand } = req.body;
    const product = await Product.findByPk(req.params.id);
    
    if (!product) return res.status(404).json({ error: "Hittade inte produkten" });

    // Om ny fil laddats upp, använd den, annars behåll gammal URL eller uppdatera med ny URL
    let finalImageUrl = product.imageUrl;
    if (req.file) {
      finalImageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    } else if (imageUrl) {
      finalImageUrl = imageUrl;
    }

    await product.update({
      name,
      price,
      description,
      imageUrl: finalImageUrl
    });

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;