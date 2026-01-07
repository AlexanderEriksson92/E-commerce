const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'superhemligt_nyckel'; 

// LOGGA IN
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Inloggningsförsök för:", username);

    const user = await User.findOne({ where: { username } });

    if (!user) {
      console.log("Användaren hittades inte i databasen.");
      return res.status(401).json({ error: "Fel användarnamn eller lösenord" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (isMatch) {
      const token = jwt.sign(
        { id: user.id, isAdmin: user.isAdmin }, 
        JWT_SECRET, 
        { expiresIn: '1h' }
      );
      
      console.log("✅ Inloggning lyckades!");
      res.json({ 
        token, 
        username: user.username, 
        isAdmin: user.isAdmin 
      });
    } else {
      console.log("❌ Fel lösenord.");
      res.status(401).json({ error: "Fel användarnamn eller lösenord" });
    }
  } catch (err) {
    console.error("SERVERFEL VID INLOGGNING:", err);
    res.status(500).json({ error: "Internt serverfel" });
  }
});

module.exports = router;