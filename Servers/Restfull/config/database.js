const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('GestionProyectos', 'sebas', 'Itz_sebas121', {
    host: '108.181.157.251', 
    dialect: 'mssql',       
    port: 10070,             
    logging: false,          
    dialectOptions: {
      encrypt: true,         
    },
  });

module.exports = sequelize;
