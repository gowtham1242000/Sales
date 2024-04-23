const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const Item = require('./Items');
const User = require('./Users');

const ReturnOrderItem = sequelize.define('ReturnOrderItem', {
    returnOrderId: DataTypes.INTEGER,
    itemId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    returnNo: DataTypes.STRING,
    quantityReturned: DataTypes.STRING
});

ReturnOrderItem.belongsTo(Item, { foreignKey: 'itemId', targetKey: 'id' });
ReturnOrderItem.belongsTo(User, { foreignKey: 'userId', targetKey: 'id' });

module.exports = ReturnOrderItem;
