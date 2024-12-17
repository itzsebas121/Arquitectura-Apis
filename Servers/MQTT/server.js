const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const mqtt = require('mqtt');


const DB_CONFIG = {
    user: 'sebas',
    password: 'Itz_sebas121',
    server: '108.181.157.251',
    database: 'GestionProyectos',
    port: 10070,
    options: {
        encrypt: true, 
        trustServerCertificate: true 
    }
};

const app = express();

app.use(cors()); 

// Middleware para parsear el cuerpo de las solicitudes como JSON
app.use(express.json());

// Conectar a la base de datos
async function connectToDatabase() {
    try {
        const pool = await sql.connect(DB_CONFIG);
        console.log('Conectado a la base de datos');
        return pool;
    } catch (err) {
        console.error('Error al conectar a la base de datos:', err);
        process.exit(1); // Termina el proceso si no puede conectar a la base de datos
    }
}

// Configuración de la conexión al broker MQTT
const client = mqtt.connect('ws://test.mosquitto.org:8081/mqtt');  // Usamos WebSocket para la conexión

client.on('connect', () => {
    console.log('Conectado al broker MQTT');
    client.subscribe('proyectos/respuesta', (err) => {
        if (!err) {
            console.log('Suscrito a proyectos/respuesta');
        }
    });
});

// Ruta para obtener todos los proyectos
app.get('/proyectos', async (req, res) => {
    try {
        const pool = await connectToDatabase();
        const result = await pool.request().query('SELECT * FROM Proyectos');
        const proyectos = result.recordset;

        // Publicar los proyectos en el topic MQTT
        client.publish('proyectos/respuesta', JSON.stringify(proyectos));

        // Enviar la respuesta al cliente HTTP
        res.json(proyectos);
    } catch (err) {
        console.error('Error al obtener proyectos:', err);
        res.status(500).send('Error al obtener proyectos');
    }
});

// Ruta para crear o actualizar proyectos
app.post('/proyectos', async (req, res) => {
    const { id, nombre, descripcion, activo, fecha_creacion } = req.body;

    // Validación de campos obligatorios
    if (!nombre) {
        return res.status(400).send('El nombre del proyecto es obligatorio.');
    }

    try {
        const pool = await connectToDatabase();
        let query = '';

        if (id) {
            // Actualizar proyecto existente
            query = `
                UPDATE Proyectos
                SET 
                    nombre = @nombre,
                    descripcion = @descripcion,
                    activo = @activo,
                    fecha_creacion = @fecha_creacion
                WHERE id = @id
            `;
        } else {
            // Crear nuevo proyecto
            query = `
                INSERT INTO Proyectos (nombre, descripcion, activo, fecha_creacion)
                VALUES (@nombre, @descripcion, @activo, SYSDATETIMEOFFSET())
            `;
        }

        await pool.request()
            .input('id', sql.Int, id)
            .input('nombre', sql.NVarChar(100), nombre)
            .input('descripcion', sql.NVarChar(sql.MAX), descripcion)
            .input('activo', sql.Bit, activo)
            .input('fecha_creacion', sql.DateTimeOffset, fecha_creacion)
            .query(query);

        res.status(200).send('Proyecto procesado exitosamente');
    } catch (err) {
        console.error('Error al crear/actualizar el proyecto:', err);
        res.status(500).send('Error al crear/actualizar el proyecto');
    }
});

// Ruta para eliminar un proyecto
app.delete('/proyectos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await connectToDatabase();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Proyectos WHERE id = @id');
        
        res.status(200).send('Proyecto eliminado exitosamente');
    } catch (err) {
        console.error('Error al eliminar el proyecto:', err);
        res.status(500).send('Error al eliminar el proyecto');
    }
});

// Manejar la recepción de mensajes desde MQTT
client.on('message', async (topic, message) => {
    console.log('Mensaje recibido en el topic', topic);
    const messageContent = JSON.parse(message.toString());

    if (topic === 'proyectos/crud') {
        const { action, project, projectName } = messageContent;

        try {
            if (action === 'createOrUpdateProject') {
                // Crear o actualizar proyecto
                const { nombre, descripcion, activo, fecha_creacion } = project;
                let query = '';

                if (project.id) {
                    // Actualizar proyecto
                    query = `
                        UPDATE Proyectos
                        SET nombre = @nombre, descripcion = @descripcion, activo = @activo, fecha_creacion = @fecha_creacion
                        WHERE id = @id
                    `;
                } else {
                    // Crear proyecto
                    query = `
                        INSERT INTO Proyectos (nombre, descripcion, activo, fecha_creacion)
                        VALUES (@nombre, @descripcion, @activo, SYSDATETIMEOFFSET())
                    `;
                }

                const pool = await connectToDatabase();
                await pool.request()
                    .input('id', sql.Int, project.id)
                    .input('nombre', sql.NVarChar(100), nombre)
                    .input('descripcion', sql.NVarChar(sql.MAX), descripcion)
                    .input('activo', sql.Bit, activo)
                    .input('fecha_creacion', sql.DateTimeOffset, fecha_creacion)
                    .query(query);

                console.log('Proyecto procesado en MQTT:', project);
            }

            if (action === 'deleteProject') {
                // Eliminar proyecto
                const pool = await connectToDatabase();
                await pool.request()
                    .input('projectName', sql.NVarChar(100), projectName)
                    .query('DELETE FROM Proyectos WHERE nombre = @projectName');

                console.log('Proyecto eliminado en MQTT:', projectName);
            }
        } catch (err) {
            console.error('Error al procesar acción en MQTT:', err);
        }
    }
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
