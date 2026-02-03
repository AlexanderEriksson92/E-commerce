const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Material = sequelize.define('Material', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true // Förhindrar dubbletter av samma materialnamn
  }
}, {
  timestamps: false 
});

module.exports = Material;