const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Definiera "Product"-modellen
const Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  description: { type: DataTypes.TEXT },
  imageUrl: { type: DataTypes.STRING },
  category: { type: DataTypes.STRING }, // Nytt fält för jeans, accessoarer etc.
  brand: { type: DataTypes.STRING }    // Nytt fält för märken
});

module.exports = Product;