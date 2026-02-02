const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { Op } = require('sequelize');

const JWT_SECRET = 'superhemligt_nyckel';

// Middleware för admin
const verifyAdmin = (req, res, next) => {
    let token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: "Ingen token skickad" });
    if (token.startsWith('Bearer ')) token = token.slice(7, token.length);
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.isAdmin) next();
        else res.status(403).json({ error: "Endast admin får göra detta" });
    } catch (err) {
        res.status(401).json({ error: "Ogiltig token" });
    }
};

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- RUTTER ---

// Hämta produkter (Uppdaterad med sökfunktion)
router.get('/', async (req, res) => {
    try {
        const { department, search, sportswear } = req.query; 
        let whereClause = {};
        
        // 1. Filtrera på avdelning (Men/Women etc)
        if (department) {
            whereClause.department = department;
        }

        // Extra: Filtrera på sportkläder
        if (sportswear === 'true') {   
            whereClause.isSportswear = true;
        }

        // 2. Filtrera på sökord 
        if (search) {
            whereClause.name = {
                [Op.iLike]: `%${search}%` // iLike gör sökningen okänslig för stora/små bokstäver
            };
        }

        const products = await Product.findAll({
            where: whereClause,
            include: [
                { model: Category, attributes: ['name'] },
                { model: Brand, attributes: ['name'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(products);
    } catch (err) {
        console.error("Backend Error:", err);
        res.status(500).json({ error: 'Kunde inte hämta produkter' });
    }
});

// Hämta specifik produkt
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

// Skapa produkt
router.post('/', verifyAdmin, upload.single('imageFile'), async (req, res) => {
    try {
        const { name, price, description, imageUrl, inventory, discountPrice, department, categoryId, brandId, color, material, isSportswear } = req.body;

        // Välj filens URL om den finns, annars text-URL:en från fältet
        const finalImageUrl = req.file
            ? `http://localhost:5000/uploads/${req.file.filename}`
            : imageUrl;

        const newProduct = await Product.create({
            name,
            price,
            description,
            imageUrl: finalImageUrl,
            inventory: typeof inventory === 'string' ? JSON.parse(inventory) : inventory,
            discountPrice: discountPrice === '' || discountPrice === 'null' ? null : discountPrice,
            department: department || 'Unisex',
            categoryId: categoryId || null,
            brandId: brandId || null,
            color, // NYTT
            material, // NYTT
            isSportswear: isSportswear === 'true' // NYTT (konvertera sträng till boolean)
        });
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Redigera produkt
router.put('/:id', verifyAdmin, upload.single('imageFile'), async (req, res) => {
    try {
        const { name, price, description, imageUrl, inventory, discountPrice, categoryId, brandId, department, color, material, isSportswear } = req.body;
        const product = await Product.findByPk(req.params.id);

        if (!product) return res.status(404).json({ error: "Hittade inte" });

        // Uppdateringslogik för bild: Ny fil > Ny URL-sträng > Gammal bild
        let finalImageUrl = product.imageUrl;
        if (req.file) {
            finalImageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        } else if (imageUrl) {
            finalImageUrl = imageUrl;
        }

        await product.update({
            name: name || product.name,
            price: price || product.price,
            description: description || product.description,
            imageUrl: finalImageUrl,
            inventory: inventory ? (typeof inventory === 'string' ? JSON.parse(inventory) : inventory) : product.inventory,
            discountPrice: discountPrice === '' || discountPrice === 'null' ? null : discountPrice,
            categoryId: categoryId || product.categoryId,
            brandId: brandId || product.brandId,
            department: department || product.department,
            color: color !== undefined ? color : product.color, 
            material: material !== undefined ? material : product.material, 
            isSportswear: isSportswear !== undefined ? isSportswear === 'true' : product.isSportswear 
        });

        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Radera produkt
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