const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const item = sequelize.define('Items', {
  name:DataTypes.STRING,
  price:DataTypes.INTEGER,
  quantity :DataTypes.STRING,
  description:DataTypes.STRING,
  image:DataTypes.STRING
});


module.exports = item;