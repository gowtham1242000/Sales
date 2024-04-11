const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const status = sequelize.define('Statu', {
  status:DataTypes.STRING
});


module.exports = status;
