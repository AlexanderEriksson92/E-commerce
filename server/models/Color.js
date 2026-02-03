const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Color = sequelize.define('Color', {
  name: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true // Förhindrar dubbletter som "Svart" och "Svart"
  },
  hexCode: { 
    type: DataTypes.STRING, 
    allowNull: true // T.ex. "#000000"
  }
});

module.exports = Color;