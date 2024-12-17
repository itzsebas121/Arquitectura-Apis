const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// Ruta relativa al archivo .proto
const PROTO_PATH = path.resolve(__dirname, "../../Servers/GRPC/proyectos.proto");

// Cargar el archivo .proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proyectoProto = grpc.loadPackageDefinition(packageDefinition).proyectos;

const client = new proyectoProto.ProyectoService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

// 1. Listar proyectos
function listProyectos() {
  client.GetProyectos({}, (error, response) => {
    if (error) {
      console.error("Error al listar proyectos:", error.message);
    } else {
      console.log("Proyectos obtenidos:", response.proyectos);
    }
  });
}

// 2. Obtener un proyecto por ID
function getProyectoById(id) {
  client.GetProyectoById({ id: id }, (error, response) => {
    if (error) {
      console.error("Error al obtener el proyecto:", error.message);
    } else {
      console.log("Proyecto obtenido:", response);
    }
  });
}

// 3. Crear un nuevo proyecto
function createProyecto(nombre, descripcion, activo, fecha_creacion) {
    client.CreateProyecto(
      { nombre, descripcion, activo, fecha_creacion },  // Pasa la fecha como parámetro
      (error, response) => {
        if (error) {
          console.error("Error al crear el proyecto:", error.message);
        } else {
          console.log("Proyecto creado exitosamente:", response.message);
          console.log("Detalles del proyecto:", response.proyecto);
        }
      }
    );
  }
  

// 4. Actualizar un proyecto
function updateProyecto(id, nombre, descripcion, fecha_creacion, activo) {
    client.UpdateProyecto(
      { id, nombre, descripcion, fecha_creacion, activo },  // Pasa la fecha de creación o actualización como parámetro
      (error, response) => {
        if (error) {
          console.error("Error al actualizar el proyecto:", error.message);
        } else {
          console.log("Proyecto actualizado exitosamente:", response.message);
        }
      }
    );
  }
  
  

// 5. Eliminar un proyecto
function deleteProyecto(id) {
  client.DeleteProyecto({ id: id }, (error, response) => {
    if (error) {
      console.error("Error al eliminar el proyecto:", error.message);
    } else {
      console.log("Proyecto eliminado exitosamente:", response.message);
    }
  });
}


listProyectos();  

//getProyectoById(1);  

//createProyecto("Nuevo Proyecto", "Descripción del proyecto", true, new Date("2024-12-17"));  

//updateProyecto(1, "Proyecto Actualizado", "Nueva descripción", new Date("2024-12-17"), true);  

//deleteProyecto(1);
