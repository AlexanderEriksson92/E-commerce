const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.INTEGER, allowNull: false },
  discountPrice: { type: DataTypes.INTEGER, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  imageUrl: { type: DataTypes.STRING, allowNull: true },
  department: { type: DataTypes.STRING, allowNull: true },
  // NYA FÄLT HÄR:
  color: { type: DataTypes.STRING, allowNull: true },
  material: { type: DataTypes.STRING, allowNull: true },
  isSportswear: { type: DataTypes.BOOLEAN, defaultValue: false },
  
  inventory: { 
    type: DataTypes.JSONB, 
    allowNull: false,
    defaultValue: { "XS": 0, "S": 0, "M": 0, "L": 0, "XL": 0 }
  },
  categoryId: { type: DataTypes.INTEGER, allowNull: true },
  brandId: { type: DataTypes.INTEGER, allowNull: true } // Glöm inte brandId om du använder det!
});

module.exports = Product;