const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProductVariant = sequelize.define('ProductVariant', {
  size: { type: DataTypes.STRING, allowNull: false },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  productId: { type: DataTypes.INTEGER, allowNull: false } // Denna kolumn kopplar till produkten
});

module.exports = ProductVariant;