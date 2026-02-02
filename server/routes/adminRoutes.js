const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const Category = require('../models/Category');
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

// Hämta alla kategorier
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.findAll({ order: [['name', 'ASC']] });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: "Kunde inte hämta kategorier" });
    }
});

// Skapa ny kategori
router.post('/categories', verifyAdmin, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "Namn saknas" });
        const category = await Category.create({ name });
        res.json(category);
    } catch (err) {
        res.status(400).json({ error: "Kategorin finns redan" });
    }
});

// --- BRANDS ---

// Hämta alla märken
router.get('/brands', async (req, res) => {
    try {
        const brands = await Brand.findAll({ order: [['name', 'ASC']] });
        res.json(brands);
    } catch (err) {
        res.status(500).json({ error: "Kunde inte hämta märken" });
    }
});

// Skapa nytt märke
router.post('/brands', verifyAdmin, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "Namn saknas" });
        const brand = await Brand.create({ name });
        res.json(brand);
    } catch (err) {
        res.status(400).json({ error: "Märket finns redan" });
    }
});

module.exports = router;