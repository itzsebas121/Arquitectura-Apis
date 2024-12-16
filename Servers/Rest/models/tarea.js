const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');  // Asegúrate de que el path es correcto
const Proyecto = require('./Proyecto');  // Importa el modelo Proyecto

const Tarea = sequelize.define('Tarea', {
  // Definición de las columnas
  proyecto_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  titulo: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  descripcion: {
    type: Sequelize.STRING,
  },
  estado: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  prioridad: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  fecha_creacion: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
  fecha_vencimiento: {
    type: Sequelize.DATE,
  }
}, {
  timestamps: false // Desactiva los campos createdAt y updatedAt
});


// Relación con Proyecto
Tarea.belongsTo(Proyecto, { foreignKey: 'proyecto_id' });

module.exports = Tarea;
