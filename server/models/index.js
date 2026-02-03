const Product = require('./Product');
const Category = require('./Category');
const Brand = require('./Brand');
const Material = require('./Material');
const Color = require('./Color'); // TILLAGD
const ProductVariant = require('./ProductVariant');
const User = require('./User');
const Favorite = require('./Favorite');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// --- RELATIONER ---

Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

Brand.hasMany(Product, { foreignKey: 'brandId' });
Product.belongsTo(Brand, { foreignKey: 'brandId' });

Material.hasMany(Product, { foreignKey: 'materialId' });
Product.belongsTo(Material, { foreignKey: 'materialId' });

Color.hasMany(Product, { foreignKey: 'colorId' }); // TILLAGD
Product.belongsTo(Color, { foreignKey: 'colorId' }); // TILLAGD

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
  Color, // NU DEFINIERAD
  ProductVariant,
  User,
  Favorite,
  Order,
  OrderItem
};