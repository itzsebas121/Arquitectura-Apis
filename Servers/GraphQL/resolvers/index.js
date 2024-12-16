const db = require('../models');  // Importar los modelos de Sequelize

const resolvers = {
  Query: {
    // Obtener todos los proyectos
    proyectos: async () => {
      return await db.Proyecto.findAll();
    },
    // Obtener un proyecto por ID
    proyecto: async (_, { id }) => {
      return await db.Proyecto.findByPk(id);
    },
    // Obtener todas las tareas
    tareas: async () => {
      return await db.Tarea.findAll();
    },
    // Obtener una tarea por ID
    tarea: async (_, { id }) => {
      return await db.Tarea.findByPk(id);
    },
    // Obtener todos los comentarios
    comentarios: async () => {
      return await db.Comentario.findAll();
    },
    // Obtener un comentario por ID
    comentario: async (_, { id }) => {
      return await db.Comentario.findByPk(id);
    },
  },

  Mutation: {
    // Crear Proyecto
    crearProyecto: async (_, { nombre, descripcion, activo }) => {
      return await db.Proyecto.create({ nombre, descripcion, activo });
    },

    // Actualizar Proyecto
    actualizarProyecto: async (_, { id, nombre, descripcion, activo }) => {
      const proyecto = await db.Proyecto.findByPk(id);
      if (!proyecto) {
        throw new Error('Proyecto no encontrado');
      }
      proyecto.nombre = nombre || proyecto.nombre;
      proyecto.descripcion = descripcion || proyecto.descripcion;
      proyecto.activo = activo !== undefined ? activo : proyecto.activo;
      await proyecto.save();
      return proyecto;
    },

    // Eliminar Proyecto
    eliminarProyecto: async (_, { id }) => {
      const proyecto = await db.Proyecto.findByPk(id);
      if (!proyecto) {
        throw new Error('Proyecto no encontrado');
      }
      await proyecto.destroy();
      return `Proyecto con id ${id} eliminado exitosamente.`;
    },

    // Crear Tarea
    crearTarea: async (_, { proyecto_id, titulo, descripcion, estado, prioridad, fecha_vencimiento }) => {
      return await db.Tarea.create({ proyecto_id, titulo, descripcion, estado, prioridad, fecha_vencimiento });
    },

    // Actualizar Tarea
    actualizarTarea: async (_, { id, titulo, descripcion, estado, prioridad, fecha_vencimiento }) => {
      const tarea = await db.Tarea.findByPk(id);
      if (!tarea) {
        throw new Error('Tarea no encontrada');
      }
      tarea.titulo = titulo || tarea.titulo;
      tarea.descripcion = descripcion || tarea.descripcion;
      tarea.estado = estado || tarea.estado;
      tarea.prioridad = prioridad || tarea.prioridad;
      tarea.fecha_vencimiento = fecha_vencimiento || tarea.fecha_vencimiento;
      await tarea.save();
      return tarea;
    },

    // Eliminar Tarea
    eliminarTarea: async (_, { id }) => {
      const tarea = await db.Tarea.findByPk(id);
      if (!tarea) {
        throw new Error('Tarea no encontrada');
      }
      await tarea.destroy();
      return `Tarea con id ${id} eliminada exitosamente.`;
    },

    // Crear Comentario
    crearComentario: async (_, { tarea_id, contenido}) => {
      return await db.Comentario.create({ tarea_id, contenido });
    },

    // Actualizar Comentario
    actualizarComentario: async (_, { id, contenido }) => {
      const comentario = await db.Comentario.findByPk(id);
      if (!comentario) {
        throw new Error('Comentario no encontrado');
      }
      comentario.contenido = contenido || comentario.contenido;
      await comentario.save();
      return comentario;
    },

    // Eliminar Comentario
    eliminarComentario: async (_, { id }) => {
      const comentario = await db.Comentario.findByPk(id);
      if (!comentario) {
        throw new Error('Comentario no encontrado');
      }
      await comentario.destroy();
      return `Comentario con id ${id} eliminado exitosamente.`;
    },
  },
};

module.exports = resolvers;
