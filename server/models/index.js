// 1. Importera sequelize-instansen (kolla att sökvägen stämmer!)
const sequelize = require('../config/db'); 
const { DataTypes } = require('sequelize');

// 2. Importera alla modeller
// Om de andra modellerna kraschar när de anropas som funktioner, 
// krävs de förmodligen bara rakt av:
const Product = require('./Product');
const Category = require('./Category');
const Brand = require('./Brand');
const Material = require('./Material');
const Color = require('./Color'); 
const ProductVariant = require('./ProductVariant');
const User = require('./User');
const Favorite = require('./Favorite');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// 3. För ProductImage (eftersom vi VET att den är en funktion):
const ProductImage = require('./ProductImage')(sequelize, DataTypes);

// --- RELATIONER ---
// (Samma kod som förut...)
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

Brand.hasMany(Product, { foreignKey: 'brandId' });
Product.belongsTo(Brand, { foreignKey: 'brandId' });

Material.hasMany(Product, { foreignKey: 'materialId' });
Product.belongsTo(Material, { foreignKey: 'materialId' });

Color.hasMany(Product, { foreignKey: 'colorId' }); 
Product.belongsTo(Color, { foreignKey: 'colorId' }); 

Product.hasMany(ProductImage, { foreignKey: 'productId', as: 'images', onDelete: 'CASCADE' });
ProductImage.belongsTo(Product, { foreignKey: 'productId' });

Product.hasMany(ProductVariant, { foreignKey: 'productId', as: 'variants', onDelete: 'CASCADE' });
ProductVariant.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(Favorite, { foreignKey: 'userId' });
Favorite.belongsTo(User, { foreignKey: 'userId' });
Product.hasMany(Favorite, { foreignKey: 'productId' });
Favorite.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

module.exports = {
  Product,
  Category,
  Brand,
  Material,
  Color, 
  ProductVariant,
  ProductImage,
  User,
  Favorite,
  Order,
  OrderItem
};