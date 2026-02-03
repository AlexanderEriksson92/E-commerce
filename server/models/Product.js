const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.INTEGER, allowNull: false },
  discountPrice: { type: DataTypes.INTEGER, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  imageUrl: { type: DataTypes.STRING, allowNull: true },
  department: { type: DataTypes.STRING, allowNull: true },
  isSportswear: { type: DataTypes.BOOLEAN, defaultValue: false },
  
  // Relationer (ID:n)
  categoryId: { type: DataTypes.INTEGER, allowNull: true },
  brandId: { type: DataTypes.INTEGER, allowNull: true },
  materialId: { type: DataTypes.INTEGER, allowNull: true },
  colorId: { type: DataTypes.INTEGER, allowNull: true } 
});

module.exports = Product;