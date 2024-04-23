const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const Shop = require('./Shops');
const User = require('./Users');
let lastOrderNo = 0;

const order = sequelize.define('Orders', {
  expecteddate:DataTypes.STRING,
  shopId:DataTypes.INTEGER,
  shopName:DataTypes.STRING,
  userId:DataTypes.INTEGER,
  orderNo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    defaultValue: function() {
      // Generate a unique order number
     lastOrderNo++; // Increment the order number
      return `ORD-${lastOrderNo}`;
    }
  },
 // orderNo:DataTypes.STRING,
  yourearing:DataTypes.INTEGER,
  totalAmount:DataTypes.FLOAT,
  status:DataTypes.STRING,
  statusid:DataTypes.INTEGER,
  orderType:DataTypes.STRING
  //itemId:DataTypes.ARRAY(DataTypes.INTEGER),
  //quantity:DataTypes.ARRAY(DataTypes.INTEGER)
});

order.belongsTo(Shop, { foreignKey: 'shopId', targetKey: 'id' });


order.belongsTo(User, { foreignKey:'userId', targetKey:'id'});

module.exports = order;
