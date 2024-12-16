const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Tarea = sequelize.define('Tarea', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    proyecto_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['pendiente', 'en progreso', 'completada']],
      },
    },
    prioridad: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['baja', 'media', 'alta']],
      },
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    fecha_vencimiento: {
      type: DataTypes.DATE,
    },
  }, {
    timestamps: false, // Desactiva los campos createdAt y updatedAt
  });

  // Relación con el modelo Proyecto
  Tarea.associate = (models) => {
    Tarea.belongsTo(models.Proyecto, {
      foreignKey: 'proyecto_id',
      as: 'proyecto',
    });

    Tarea.hasMany(models.Comentario, {
      foreignKey: 'tarea_id',
      as: 'comentarios',
    });
  };

  return Tarea;
};
