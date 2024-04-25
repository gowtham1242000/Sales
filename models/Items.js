const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const item = sequelize.define('Items', {
  name:DataTypes.STRING,
  price:DataTypes.INTEGER,
  quantity :DataTypes.STRING,
  availability: {
    type: DataTypes.BOOLEAN,
    defaultValue: true       // Assume shops are available by default
  },
  image:DataTypes.STRING,
  attribute:DataTypes.STRING,
  thumbnail:DataTypes.STRING,
  itemCode:DataTypes.STRING,
});


module.exports = item;
