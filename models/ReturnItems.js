const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const Shop = require('./Shops');
const User = require('./Users');
const ReturnOrderItem = require('./ReturnOrderItems');

let lastReturnNo = 0;

const ReturnItem = sequelize.define('ReturnItem', {
    shopId: DataTypes.INTEGER,
    shopName: DataTypes.STRING,
    yourearing: DataTypes.INTEGER,
    statusId: DataTypes.INTEGER,
    orderNo:  DataTypes.STRING,
    userId: DataTypes.INTEGER,
    totalAmount: DataTypes.FLOAT,
    deliveryDate: DataTypes.STRING
});

ReturnItem.belongsTo(Shop, { foreignKey: 'shopId', targetKey: 'id' });
ReturnItem.belongsTo(User, { foreignKey: 'userId', targetKey: 'id' });
ReturnItem.hasMany(ReturnOrderItem, { foreignKey: 'returnOrderId' });

ReturnItem.belongsTo(Shop, { foreignKey: 'shopId' });
module.exports = ReturnItem;
