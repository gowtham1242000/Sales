const { Sequelize } = require('sequelize');


global.Op = Sequelize.Op;
const operatorsAliases = {
    $notIn : Op.likenotIn,
    $like  : Op.like,
    $gte   : Op.gte,
    $lte   : Op.lte,
    $lt    : Op.lt,
    $gt    : Op.gt,
    $ne    : Op.ne,
    $or    : Op.or,
    $eq    : Op.eq,
    $col   : Op.col,
    $in    : Op.in,
    $cast  : (value, type) => Sequelize(`CAST(${value} AS ${type})`)
}
const sequelize = new Sequelize('testone', 'saleuser', 'salepass', {
  host: 'localhost',
  dialect: 'postgres',
  port: '5432',
  logging : false,
    timezone :'+05:30',
  operatorsAliases,
  dialectOptions: {
        statement_timeout: 60000
    }
});
sequelize.sync().then(success=>{
  console.log('Testone Sales Order Database connected successfully');
},err=>{
  console.log("There was a problem to connecting Database "+ err);
});

module.exports = sequelize;

