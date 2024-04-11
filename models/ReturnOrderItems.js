const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const Shop = require('./Shops');
const Item = require('./Items');
const Order =require('./Orders');
const User =require('./Users');

const returnOrderItem = sequelize.define('ReturnOrderItems', {
  returnOrderId:DataTypes.INTEGER,
  itemId:DataTypes.INTEGER,
  userId:DataTypes.INTEGER,
  quantityReturned:DataTypes.STRING
 // quantity:DataTypes.INTEGER,
});

returnOrderItem.belongsTo(Item, { foreignKey: 'itemId', targetKey: 'id' });

returnOrderItem.belongsTo(Order, { foreignKey: 'orderId', targetKey: 'id' });

returnOrderItem.belongsTo(User, { foreignKey: 'userId', targetKey:'id'});

module.exports = returnOrderItem;
