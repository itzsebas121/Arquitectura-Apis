const Sequelize = require('sequelize');
const sequelize = new Sequelize('GestionProyectos', 'sebas', 'Itz_sebas121', {
  host: '108.181.157.251', 
  dialect: 'mssql',       
  port: 10070,             
  logging: false,          
  dialectOptions: {
    encrypt: true,         
  },
});

const Proyecto = require('./proyecto')(sequelize, Sequelize.DataTypes);
const Tarea = require('./tarea')(sequelize, Sequelize.DataTypes);
const Comentario = require('./comentario')(sequelize, Sequelize.DataTypes);

const db = {
  sequelize,
  Sequelize,
  Proyecto,
  Tarea,
  Comentario,
};

module.exports = db;
