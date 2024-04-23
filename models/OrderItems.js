const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const Shop = require('./Shops');
const Item = require('./Items');
const Order =require('./Orders');
const User =require('./Users');

const orderItem = sequelize.define('OrderItems', {
  orderId:DataTypes.INTEGER,
  itemId:DataTypes.INTEGER,
  orderNo:DataTypes.STRING,
  userId:DataTypes.INTEGER,
  yourearing:DataTypes.INTEGER,
  totalAmount:DataTypes.FLOAT,
  //itemId:DataTypes.ARRAY(DataTypes.INTEGER),
  quantity:DataTypes.INTEGER
});

orderItem.belongsTo(Item, { foreignKey: 'itemId', targetKey: 'id' });

orderItem.belongsTo(Order, { foreignKey: 'orderId', targetKey: 'id' });

orderItem.belongsTo(User, { foreignKey: 'userId', targetKey:'id'});
module.exports = orderItem;
