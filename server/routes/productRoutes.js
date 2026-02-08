const express = require('express');
const router = express.Router();
const { Product, Category, Brand, Material, Color, ProductVariant, ProductImage } = require('../models');
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

// 1. Hämta alla produkter (med huvudbild)
router.get('/', async (req, res) => {
    try {
        const { department } = req.query;
        let whereClause = {};

        if (department === 'Sport') {
            whereClause.isSportswear = { [Op.or]: [true, 1, '1'] };
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
                { model: ProductVariant, as: 'variants' },
                {
                    model: ProductImage,
                    as: 'images',
                    where: { isMain: true }, // Vi vill bara ha huvudbilden i listan
                    required: false
                }
            ]
        });
        res.json(products);
    } catch (err) {
        console.error("DEBUG ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// 2. Hämta specifik produkt (med ALLA bilder)
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [
                { model: Category, attributes: ['name'] },
                { model: Brand, attributes: ['name'] },
                { model: Material, attributes: ['name'] },
                { model: Color, attributes: ['name'] },
                { model: ProductVariant, as: 'variants' },
                { model: ProductImage, as: 'images' } // Här hämtas alla bilder (upp till 5)
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
            ? `/uploads/${req.file.filename}`
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
router.put('/:id', verifyAdmin, upload.array('imageFiles', 5), async (req, res) => {
    try {
        const { name, price, description, inventory, discountPrice, categoryId, brandId, materialId, department, color, isSportswear, mainImageIndex, existingImages } = req.body;
        const product = await Product.findByPk(req.params.id);

        if (!product) return res.status(404).json({ error: "Hittades inte" });

        // 1. Uppdatera basinfo
        await product.update({
            name: name || product.name,
            price: price || product.price,
            description: description || product.description,
            discountPrice: discountPrice === '' || discountPrice === 'null' ? null : discountPrice,
            categoryId: categoryId || product.categoryId,
            brandId: brandId || product.brandId,
            materialId: materialId || product.materialId,
            department: department || product.department,
            color: color !== undefined ? color : product.color,
            isSportswear: isSportswear !== undefined ? isSportswear === 'true' : product.isSportswear
        });

        // 2. Hantera bilder (Kombinera URL:er och Filer)
        // Vi rensar gamla kopplingar för att skriva det nya tillståndet från EditProduct
        await ProductImage.destroy({ where: { productId: product.id } });

        let allImagePaths = [];

        // Lägg till URL-bilder först (de som redan fanns eller lades till via länk)
        if (existingImages) {
            const urls = Array.isArray(existingImages) ? existingImages : [existingImages];
            urls.forEach(url => allImagePaths.push(url));
        }

        // Lägg till nya uppladdade filer
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => allImagePaths.push(`/uploads/${file.filename}`));
        }

        // Skapa poster för alla bilder och använd mainImageIndex för att sätta isMain
        if (allImagePaths.length > 0) {
            const imageRecords = allImagePaths.map((path, index) => ({
                productId: product.id,
                imageUrl: path,
                isMain: index === parseInt(mainImageIndex || 0)
            }));
            await ProductImage.bulkCreate(imageRecords);
            
            // Valfritt: Uppdatera även huvudtabellens imageUrl för bakåtkompatibilitet
            const mainImg = imageRecords.find(r => r.isMain) || imageRecords[0];
            await product.update({ imageUrl: mainImg.imageUrl });
        }

        // 3. Uppdatera lager (Varianter)
        if (inventory) {
            const invObj = typeof inventory === 'string' ? JSON.parse(inventory) : inventory;
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
        console.error(err);
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