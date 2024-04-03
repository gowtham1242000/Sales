const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const User = require('./Users');

const shop = sequelize.define('Shops', {
  shopname:DataTypes.STRING,
  location:DataTypes.STRING,
  address:DataTypes.STRING,
  emailId:DataTypes.STRING,
  contectnumber:DataTypes.STRING,
  userId:DataTypes.INTEGER
});

shop.belongsTo(User, { foreignKey: 'userId', targetKey: 'id' });

module.exports = shop;
