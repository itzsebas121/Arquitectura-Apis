const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Tarea = require('./tarea');

const Comentario = sequelize.define('Comentario', {
  contenido: {  // Cambié "texto" por "contenido"
    type: DataTypes.STRING,
    allowNull: false,
  },
  tarea_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Tarea,
      key: 'id'
    }
  }
}, {
  timestamps: false
});

// Relación con la tarea
Comentario.belongsTo(Tarea, { foreignKey: 'tarea_id' });

module.exports = Comentario;
