const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const user = sequelize.define('Users', {
  username:DataTypes.STRING,
  password:DataTypes.STRING,
  role:DataTypes.STRING,
  emailId:DataTypes.INTEGER,
  phonenumber:DataTypes.INTEGER,
  userProfileImage:DataTypes.STRING,
  position:DataTypes.STRING,
  myEarning:DataTypes.FLOAT,
  adminId:DataTypes.INTEGER,
  totalOrderPlaced:DataTypes.INTEGER,
  logoutStatus:DataTypes.BOOLEAN
});


module.exports = user;