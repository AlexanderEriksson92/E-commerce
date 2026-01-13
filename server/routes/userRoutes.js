const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Favorite = require('../models/Favorite');
const Product = require('../models/Product');
const { verifyToken } = require('../middleware/authMiddleware'); // Du kan återanvända din jwt-logik här

router.get('/profile', async (req, res) => {
  try {
    // req.user.id kommer från din JWT-token (om du har en verifyToken middleware)
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    // Hämta favoriter och inkludera produktinfo
    const favorites = await Favorite.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product }]
    });

    res.json({ user, favorites });
  } catch (err) {
    res.status(500).json({ error: "Kunde inte hämta profil" });
  }
});

module.exports = router;