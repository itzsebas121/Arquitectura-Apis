const express = require('express');
const app = express();
const tareaRoutes = require('./routes/tarea'); 
const proyectoRoutes = require('./routes/proyecto'); 
const comentariosRoutes = require('./routes/comentario'); 
const cors = require('cors');
app.use(express.json());

app.use(cors());

// Usar las rutas
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/proyectos', tareaRoutes);  
app.use('/api/proyectos', comentariosRoutes);  // Aquí agregas la nueva ruta

app.listen(3000, () => {
  console.log('Servidor en puerto 3000');
});
