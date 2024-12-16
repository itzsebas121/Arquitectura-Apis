const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sql = require('mssql');
const cors = require('cors'); 


const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://127.0.0.1:5500', 
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true
    }
});

app.use(cors({
    origin: 'http://127.0.0.1:5500',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'], 
}));

const dbConfig = {
  user: 'sebas',
  password: 'Itz_sebas121',
  server: '108.181.157.251',
  port:10070, 
  database: 'GestionProyectos',
  options: {
    encrypt: true, 
    trustServerCertificate: true, 
  },
};

app.use(express.static('public'));
app.use(express.json());

const getProyectos = async () => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM Proyectos');
        return result.recordset;
    } catch (err) {
        console.error('Error al obtener proyectos:', err);
    }
};

app.get('/proyectos', async (req, res) => {
    const proyectos = await getProyectos();
    res.json(proyectos);
});

io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    getProyectos().then(proyectos => {
        socket.emit('proyectos', proyectos);
    });

    socket.on('insertarProyecto', async (proyecto) => {
        try {
            const pool = await sql.connect(dbConfig);
            await pool.request()
                .input('nombre', sql.NVarChar, proyecto.nombre)
                .input('descripcion', sql.NVarChar, proyecto.descripcion)
                .query('INSERT INTO Proyectos (nombre, descripcion) VALUES (@nombre, @descripcion)');

            const proyectos = await getProyectos();
            io.emit('proyectos', proyectos); 
            io.emit('notificacion', { tipo: 'insertar', proyecto });
        } catch (err) {
            console.error('Error al insertar proyecto:', err);
        }
    });

    socket.on('actualizarProyecto', async (proyecto) => {
        try {
            const pool = await sql.connect(dbConfig);
            await pool.request()
                .input('id', sql.Int, proyecto.id)
                .input('nombre', sql.NVarChar, proyecto.nombre)
                .input('descripcion', sql.NVarChar, proyecto.descripcion)
                .query('UPDATE Proyectos SET nombre = @nombre, descripcion = @descripcion WHERE id = @id');

            const proyectos = await getProyectos();
            io.emit('proyectos', proyectos); 
            io.emit('notificacion', { tipo: 'actualizar', proyecto }); 
        } catch (err) {
            console.error('Error al actualizar proyecto:', err);
        }
    });

    socket.on('eliminarProyecto', async (id) => {
        try {
            const pool = await sql.connect(dbConfig);
            await pool.request().input('id', sql.Int, id).query('DELETE FROM Proyectos WHERE id = @id');

            const proyectos = await getProyectos();
            io.emit('proyectos', proyectos); 
            io.emit('notificacion', { tipo: 'eliminar', id });
        } catch (err) {
            console.error('Error al eliminar proyecto:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

const port = 3000;
server.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
