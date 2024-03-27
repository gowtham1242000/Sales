const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const Shop = require('./Shops');

const order = sequelize.define('Orders', {
  expecteddate:DataTypes.STRING,
  shopId:DataTypes.INTEGER,
  shopName:DataTypes.STRING,
  yourearing:DataTypes.INTEGER,
  totalAmount:DataTypes.FLOAT
  //itemId:DataTypes.ARRAY(DataTypes.INTEGER),
  //quantity:DataTypes.ARRAY(DataTypes.INTEGER)
});

order.belongsTo(Shop, { foreignKey: 'shopId', targetKey: 'id' });


module.exports = order;