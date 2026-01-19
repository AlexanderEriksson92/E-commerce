const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

const Category = require('../models/Category'); 
const Brand = require('../models/Brand');      
const sequelize = require('../config/db'); 
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const JWT_SECRET = 'superhemligt_nyckel';


// Middleware för att kolla admin
const verifyAdmin = (req, res, next) => {
    let token = req.headers['authorization']; 
    
    if (!token) return res.status(403).json({ error: "Ingen token skickad" });

    // Hantera om token skickas med eller utan "Bearer "
    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.isAdmin) {
            next();
        } else {
            res.status(403).json({ error: "Endast admin får göra detta" });
        }
    } catch (err) {
        res.status(401).json({ error: "Ogiltig eller utgången token" });
    }
};

// Multer-inställningar
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- RUTTER ---

// Hämtar alla produkter - NU MED INCLUDE
router.get('/', async (req, res) => {
    try {
        const products = await Product.findAll({
            // Detta gör att Category.name och Brand.name skickas med till React
            include: [
                { model: Category, attributes: ['name'] },
                { model: Brand, attributes: ['name'] }
            ]
        });
        res.json(products);
    } catch (err) {
        console.error("Backend Error:", err);
        res.status(500).json({ error: 'Kunde inte hämta produkter' });
    }
});

// Hämtar EN specifik produkt - NU MED INCLUDE
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [
                { model: Category, attributes: ['name'] },
                { model: Brand, attributes: ['name'] }
            ]
        });
        if (product) res.json(product);
        else res.status(404).json({ error: 'Hittades ej' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Skapa produkt
router.post('/', verifyAdmin, upload.single('imageFile'), async (req, res) => {
    try {
        const { name, price, description, imageUrl, stock, discountPrice, department } = req.body;
        
        const finalImageUrl = req.file 
            ? `http://localhost:5000/uploads/${req.file.filename}` 
            : imageUrl;

        const newProduct = await Product.create({
            name,
            price,
            description,
            imageUrl: finalImageUrl,
            stock: stock || 0,
            discountPrice: discountPrice === '' ? null : discountPrice,
            department: department || 'Unisex'
        });
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT: Redigera produkt
router.put('/:id', verifyAdmin, upload.single('imageFile'), async (req, res) => {
    try {
        const { name, price, description, stock, discountPrice } = req.body;
        const product = await Product.findByPk(req.params.id);
        
        if (!product) return res.status(404).json({ error: "Hittade inte" });

        let finalImageUrl = product.imageUrl;
        if (req.file) {
            finalImageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        }

        // Uppdatera produkten
        await product.update({
            name: name || product.name,
            price: price || product.price,
            description: description || product.description,
            imageUrl: finalImageUrl,
            stock: stock !== undefined ? stock : product.stock,
            discountPrice: discountPrice === '' || discountPrice === 'null' ? null : discountPrice
        });

        res.json(product);
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE: Radera produkt
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

module.exports = router;