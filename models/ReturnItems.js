const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const Shop = require('./Shops');
const User = require('./Users');
const Item = require('./Items');

const returnItem = sequelize.define('ReturnItem', {
  shopId:DataTypes.INTEGER,
  shopName:DataTypes.STRING,
  yourearing:DataTypes.INTEGER,
  statusId:DataTypes.INTEGER,
  orderNo:DataTypes.STRING,
  userId:DataTypes.INTEGER,
  totalAmount:DataTypes.FLOAT
//  quantity:DataTypes.INTEGER
});

returnItem.belongsTo(Shop, { foreignKey: 'shopId', targetKey: 'id' });

returnItem.belongsTo(User, { foreignKey:'userId', targetKey:'id'});

module.exports = returnItem;
