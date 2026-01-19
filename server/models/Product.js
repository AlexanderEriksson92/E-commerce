const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.INTEGER, allowNull: false },
  discountPrice: { type: DataTypes.INTEGER, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  imageUrl: { type: DataTypes.STRING, allowNull: true },
  department: { type: DataTypes.STRING, allowNull: true },
  inventory: { 
    type: DataTypes.JSONB, 
    allowNull: false,
    defaultValue: { "XS": 0, "S": 0, "M": 0, "L": 0, "XL": 0 } // Här är den!
  },
  categoryId: { type: DataTypes.INTEGER, allowNull: true }
});

module.exports = Product;