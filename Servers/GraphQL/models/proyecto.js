const Sequelize = require('sequelize');
module.exports = (sequelize) => {
  const Proyecto = sequelize.define('Proyecto', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: Sequelize.STRING,
      allowNull: false
    },
    descripcion: {
      type: Sequelize.STRING,
    },
    fecha_creacion: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    activo: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'Proyectos',
    timestamps: false, 
  });

  Proyecto.associate = (models) => {
    Proyecto.hasMany(models.Tarea, { foreignKey: 'proyecto_id' });
  };
  Proyecto.associate = (models) => {
    Proyecto.hasMany(models.Tarea, {
      foreignKey: 'proyecto_id',
      as: 'tareas', 
    });
  };
  
  return Proyecto;
};
