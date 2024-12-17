const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { Sequelize, DataTypes } = require('sequelize');

// Configuración de conexión a la base de datos usando Sequelize
const sequelize = new Sequelize('GestionProyectos', 'sebas', 'Itz_sebas121', {
    host: '108.181.157.251',
    dialect: 'mssql',
    port: 10070,
    logging: false,  // Deshabilitar el logging para consultas SQL
    dialectOptions: {
        encrypt: true, // Para cifrado de la conexión
    },
});

// Cargar archivo .proto
const PROTO_PATH = './proyectos.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const proyectosProto = grpc.loadPackageDefinition(packageDefinition).proyectos;

// Modelo de Proyectos con Sequelize
const Proyecto = sequelize.define('Proyecto', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: 'Proyectos',
    timestamps: false,
});

// Función para ejecutar consultas con Sequelize
const executeQuery = async (query, replacements) => {
    try {
        const result = await sequelize.query(query, { replacements, type: sequelize.QueryTypes.SELECT });
        return result;
    } catch (error) {
        console.error('Error en la consulta:', error);
        throw error;
    }
};

// Implementación de los métodos del servicio gRPC
const proyectoService = {
    GetProyectos: async (_, callback) => {
        try {
            const proyectos = await Proyecto.findAll();
            callback(null, { proyectos: proyectos.map(p => p.toJSON()) });
        } catch (err) {
            console.error('Error al obtener los proyectos:', err);
            callback(err);
        }
    },

    GetProyectoById: async (call, callback) => {
        try {
            const proyecto = await Proyecto.findByPk(call.request.id);
            if (!proyecto) {
                return callback(new Error('Proyecto no encontrado'));
            }
            callback(null, proyecto.toJSON());
        } catch (err) {
            console.error('Error al obtener el proyecto por ID:', err);
            callback(err);
        }
    },

    CreateProyecto: async (call, callback) => {
        try {
            const proyecto = await Proyecto.create({
                nombre: call.request.nombre,
                descripcion: call.request.descripcion,
                fecha_creacion: new Date(),
                activo: call.request.activo,
            });
            callback(null, { message: 'Proyecto creado exitosamente' });
        } catch (err) {
            console.error('Error al crear el proyecto:', err);
            callback(err);
        }
    },

    UpdateProyecto: async (call, callback) => {
        try {
            const proyecto = await Proyecto.findByPk(call.request.id);
            if (!proyecto) {
                return callback(new Error('Proyecto no encontrado'));
            }
            proyecto.nombre = call.request.nombre;
            proyecto.descripcion = call.request.descripcion;
            proyecto.fecha_creacion = call.request.fecha_creacion;
            proyecto.activo = call.request.activo;

            await proyecto.save();
            callback(null, { message: 'Proyecto actualizado exitosamente' });
        } catch (err) {
            console.error('Error al actualizar el proyecto:', err);
            callback(err);
        }
    },

    DeleteProyecto: async (call, callback) => {
        try {
            const proyecto = await Proyecto.findByPk(call.request.id);
            if (!proyecto) {
                return callback(new Error('Proyecto no encontrado'));
            }
            await proyecto.destroy();
            callback(null, { message: 'Proyecto eliminado exitosamente' });
        } catch (err) {
            console.error('Error al eliminar el proyecto:', err);
            callback(err);
        }
    }
};

// Crear e inicializar el servidor gRPC
const server = new grpc.Server();
server.addService(proyectosProto.ProyectoService.service, proyectoService);

// Iniciar el servidor en el puerto 50051
const PORT = '0.0.0.0:50051';
server.bindAsync(PORT, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`Servidor gRPC corriendo en ${PORT}`);
});
