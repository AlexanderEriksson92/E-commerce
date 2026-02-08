const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const Color = require('../models/Color'); // NYTT
const Material = require('../models/Material'); // NYTT
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'superhemligt_nyckel';

// Middleware för att kontrollera Admin
const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && (authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader);

    if (!token) return res.status(401).json({ error: "Ingen token" });

    jwt.verify(token, secret, (err, decoded) => {
        if (err || !decoded.isAdmin) return res.status(403).json({ error: "Ej admin" });
        req.user = decoded;
        next();
    });
};

// --- KATEGORIER ---
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.findAll({ order: [['name', 'ASC']] });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: "Kunde inte hämta kategorier" });
    }
});

router.post('/categories', verifyAdmin, async (req, res) => {
    try {
        const { name } = req.body;
        const category = await Category.create({ name });
        res.json(category);
    } catch (err) {
        res.status(400).json({ error: "Kategorin finns redan" });
    }
});

// --- BRANDS ---
router.get('/brands', async (req, res) => {
    try {
        const brands = await Brand.findAll({ order: [['name', 'ASC']] });
        res.json(brands);
    } catch (err) {
        res.status(500).json({ error: "Kunde inte hämta märken" });
    }
});

router.post('/brands', verifyAdmin, async (req, res) => {
    try {
        const { name } = req.body;
        const brand = await Brand.create({ name });
        res.json(brand);
    } catch (err) {
        res.status(400).json({ error: "Märket finns redan" });
    }
});

// --- COLORS (NYTT) ---
router.get('/colors', async (req, res) => {
    try {
        const colors = await Color.findAll({ order: [['name', 'ASC']] });
        res.json(colors);
    } catch (err) {
        res.status(500).json({ error: "Kunde inte hämta färger" });
    }
});

router.post('/colors', verifyAdmin, async (req, res) => {
    try {
        const { name, hexCode } = req.body;
        const color = await Color.create({ name, hexCode });
        res.json(color);
    } catch (err) {
        res.status(400).json({ error: "Färgen finns redan" });
    }
});

// --- MATERIALS (NYTT) ---
router.get('/materials', async (req, res) => {
    try {
        const materials = await Material.findAll({ order: [['name', 'ASC']] });
        res.json(materials);
    } catch (err) {
        res.status(500).json({ error: "Kunde inte hämta material" });
    }
});

router.post('/materials', verifyAdmin, async (req, res) => {
    try {
        const { name } = req.body;
        const material = await Material.create({ name });
        res.json(material);
    } catch (err) {
        res.status(400).json({ error: "Materialet finns redan" });
    }
});

module.exports = router;