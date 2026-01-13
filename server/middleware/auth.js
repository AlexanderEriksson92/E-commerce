const jwt = require('jsonwebtoken');

// Vi hämtar din befintliga nyckel från miljön, precis som du gör vid login
const JWT_SECRET = process.env.JWT_SECRET; 

const verifyAdmin = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: "Ingen token hittades" });
  }

  // Verifierar token med din befintliga nyckel
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Ogiltig token" });
    }

    // Kollar om isAdmin-flaggan (som du satte vid login) finns i token
    if (decoded.isAdmin) {
      req.user = decoded;
      next(); // Allt okej! Gå vidare till funktionen som sparar i databasen
    } else {
      res.status(403).json({ error: "Åtkomst nekad: Inte administratör" });
    }
  });
};

module.exports = { verifyAdmin };