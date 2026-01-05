const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Definiera "Product"-modellen
const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false                  // Namn är obligatoriskt
  },
  description: {
    type: DataTypes.TEXT              // Längre textfält för beskrivning
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),   // Pris med två decimaler
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0                   // Startar på 0 i lager om inget anges
  },
  imageUrl: {
    type: DataTypes.STRING            // URL till produktbild
  }
});

module.exports = Product;