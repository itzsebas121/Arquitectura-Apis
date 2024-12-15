const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Proyecto = sequelize.define('Proyecto', {
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,  
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,  
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, 
  }
}, {
  tableName: 'Proyectos',
  timestamps: false, 
});

module.exports = Proyecto;
