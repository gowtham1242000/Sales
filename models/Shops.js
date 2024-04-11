const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const User = require('./Users');

const shop = sequelize.define('Shops', {
  shopname:DataTypes.STRING,
  location:DataTypes.STRING,
  address:DataTypes.STRING,
  emailId:DataTypes.STRING,
 shopImage: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true // Adjust this as per your requirement
  },
  thumbnailimage: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true // Adjust this as per your requirement
  },
  locationCode: {
    type: DataTypes.JSONB, // Assuming JSONB data type for flexibility
    allowNull: true // Adjust this as per your requirement
  },
  contectnumber:DataTypes.STRING,
  userId:DataTypes.INTEGER
});

shop.belongsTo(User, { foreignKey: 'userId', targetKey: 'id' });

module.exports = shop;
