const express = require('express');
const router = express.Router();
// Importera modeller från din index-fil för att få med alla relationer
const { Product, Category, Brand, Material, Color, ProductVariant } = require('../models');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { Op } = require('sequelize');

const JWT_SECRET = 'superhemligt_nyckel';
import API_URL from '../api';

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

// 1. Hämta produkter (inkluderar Material & Variants)
router.get('/', async (req, res) => {
    try {
        const { department } = req.query; 
        let whereClause = {};

        if (department === 'Sport') {
            // Vi använder [Op.or] för att täcka alla baser (true, 1, eller strängen '1')
            whereClause.isSportswear = {
                [Op.or]: [true, 1, '1']
            };
        } else if (department) {
            whereClause.department = department;
        }

        const products = await Product.findAll({
            where: whereClause,
            include: [
                { model: Category, attributes: ['name'] },
                { model: Brand, attributes: ['name'] },
                { model: Material, attributes: ['name'] },
                { model: Color, attributes: ['name'] },
                { model: ProductVariant, as: 'variants' } 
            ]
        });
        res.json(products);
    } catch (err) {
        console.error("DEBUG ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// 2. Hämta specifik produkt
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [
                { model: Category, attributes: ['name'] },
                { model: Brand, attributes: ['name'] },
                { model: Material, attributes: ['name'] },
                { model: Color, attributes: ['name'] },
                { model: ProductVariant, as: 'variants' }
            ]
        });
        if (product) res.json(product);
        else res.status(404).json({ error: 'Hittades ej' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Skapa produkt (inkl. Lager/Varianter)
router.post('/', verifyAdmin, upload.single('imageFile'), async (req, res) => {
    try {
        const { name, price, description, imageUrl, inventory, discountPrice, department, categoryId, brandId, color, materialId, isSportswear } = req.body;

        const finalImageUrl = req.file
            ? `http://${API_URL}/uploads/${req.file.filename}`
            : imageUrl;

        // Skapa produkten
        const newProduct = await Product.create({
            name,
            price,
            description,
            imageUrl: finalImageUrl,
            discountPrice: discountPrice === '' || discountPrice === 'null' ? null : discountPrice,
            department: department || 'Unisex',
            categoryId: categoryId || null,
            brandId: brandId || null,
            materialId: materialId || null,
            color,
            isSportswear: isSportswear === 'true'
        });

        // Hantera inventory (ProductVariants)
        if (inventory) {
            const invObj = typeof inventory === 'string' ? JSON.parse(inventory) : inventory;
            const variantData = Object.entries(invObj).map(([size, stock]) => ({
                size,
                stock: parseInt(stock),
                productId: newProduct.id
            }));
            await ProductVariant.bulkCreate(variantData);
        }

        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Redigera produkt
router.put('/:id', verifyAdmin, upload.single('imageFile'), async (req, res) => {
    try {
        const { name, price, description, imageUrl, inventory, discountPrice, categoryId, brandId, materialId, department, color, isSportswear } = req.body;
        const product = await Product.findByPk(req.params.id);

        if (!product) return res.status(404).json({ error: "Hittade inte" });

        let finalImageUrl = product.imageUrl;
        if (req.file) {
            finalImageUrl = `http://${API_URL}/uploads/${req.file.filename}`;
        } else if (imageUrl) {
            finalImageUrl = imageUrl;
        }

        await product.update({
            name: name || product.name,
            price: price || product.price,
            description: description || product.description,
            imageUrl: finalImageUrl,
            discountPrice: discountPrice === '' || discountPrice === 'null' ? null : discountPrice,
            categoryId: categoryId || product.categoryId,
            brandId: brandId || product.brandId,
            materialId: materialId || product.materialId,
            department: department || product.department,
            color: color !== undefined ? color : product.color, 
            isSportswear: isSportswear !== undefined ? isSportswear === 'true' : product.isSportswear 
        });

        // Uppdatera lager (Varianter)
        if (inventory) {
            const invObj = typeof inventory === 'string' ? JSON.parse(inventory) : inventory;
            
            // För enkelhetens skull i en admin-vy: radera gamla varianter och lägg till nya
            await ProductVariant.destroy({ where: { productId: product.id } });
            
            const variantData = Object.entries(invObj).map(([size, stock]) => ({
                size,
                stock: parseInt(stock),
                productId: product.id
            }));
            await ProductVariant.bulkCreate(variantData);
        }

        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Radera produkt
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ error: "Hittade inte produkten" });
        
        // ProductVariant raderas automatiskt om du har ON DELETE CASCADE i din association
        await product.destroy();
        res.json({ message: "Produkten raderad!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;