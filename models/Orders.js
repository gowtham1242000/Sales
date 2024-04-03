const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const Shop = require('./Shops');
const User = require('./Users');

const order = sequelize.define('Orders', {
  expecteddate:DataTypes.STRING,
  shopId:DataTypes.INTEGER,
  shopName:DataTypes.STRING,
  userId:DataTypes.INTEGER,
  yourearing:DataTypes.INTEGER,
  totalAmount:DataTypes.FLOAT
  //itemId:DataTypes.ARRAY(DataTypes.INTEGER),
  //quantity:DataTypes.ARRAY(DataTypes.INTEGER)
});

order.belongsTo(Shop, { foreignKey: 'shopId', targetKey: 'id' });


order.belongsTo(User, { foreignKey:'userId', targetKey:'id'});

module.exports = order;
