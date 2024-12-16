const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Proyecto {
    id: ID!
    nombre: String!
    descripcion: String
    fecha_creacion: String!
    activo: Boolean!
  }

  type Tarea {
    id: ID!
    proyecto_id: Int!
    titulo: String!
    descripcion: String
    estado: String!
    prioridad: String!
    fecha_creacion: String!
    fecha_vencimiento: String
  }

  type Comentario {
    id: ID!
    tarea_id: Int!
    contenido: String!
  }

  type Query {
    proyectos: [Proyecto]
    proyecto(id: ID!): Proyecto
    tareas: [Tarea]
    tarea(id: ID!): Tarea
    comentarios: [Comentario]
    comentario(id: ID!): Comentario
  }

  type Mutation {
    crearProyecto(nombre: String!, descripcion: String, activo: Boolean): Proyecto
    actualizarProyecto(id: ID!, nombre: String, descripcion: String, activo: Boolean): Proyecto
    eliminarProyecto(id: ID!): String

    crearTarea(proyecto_id: Int!, titulo: String!, descripcion: String, estado: String!, prioridad: String!, fecha_vencimiento: String): Tarea
    actualizarTarea(id: ID!, titulo: String, descripcion: String, estado: String, prioridad: String, fecha_vencimiento: String): Tarea
    eliminarTarea(id: ID!): String

    crearComentario(tarea_id: Int!, contenido: String!): Comentario
    actualizarComentario(id: ID!, contenido: String): Comentario
    eliminarComentario(id: ID!): String
  }
`;

module.exports = typeDefs;
