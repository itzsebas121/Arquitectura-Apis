const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Comentario = sequelize.define('Comentario', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tarea_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    contenido: {
      type: DataTypes.TEXT,
      allowNull: false,
    }
  }, {
    timestamps: false, 
  });

  Comentario.associate = (models) => {
    Comentario.belongsTo(models.Tarea, {
      foreignKey: 'tarea_id',
      as: 'tarea',
    });
  };
  return Comentario;
};
